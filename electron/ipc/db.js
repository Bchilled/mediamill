const path=require('path');
const{app}=require('electron');
const fs=require('fs');
let db=null,SQL=null;

async function getDb(){
  if(db)return db;
  if(!SQL)SQL=await require('sql.js')({locateFile:f=>path.join(__dirname,'../../node_modules/sql.js/dist/',f)});
  const dbPath=path.join(app.getPath('userData'),'forge.db');
  if(fs.existsSync(dbPath)){const data=fs.readFileSync(dbPath);db=new SQL.Database(data);}
  else db=new SQL.Database();
  initSchema();
  runMigrations();
  return db;
}

function saveDb(){
  if(!db)return;
  fs.writeFileSync(path.join(app.getPath('userData'),'forge.db'),Buffer.from(db.export()));
}

function colExists(table,col){
  try{
    const stmt=db.prepare(`PRAGMA table_info(${table})`);
    const rows=[];while(stmt.step())rows.push(stmt.getAsObject());stmt.free();
    return rows.some(r=>r.name===col);
  }catch(e){return false;}
}

function runMigrations(){
  const cols=[
    ['channels','voice_engine',"TEXT DEFAULT 'auto'"],
    ['channels','topic','TEXT DEFAULT ""'],
    ['channels','logo_path','TEXT DEFAULT NULL'],
    ['channels','branding','TEXT DEFAULT NULL'],
    ['channels','formats','TEXT DEFAULT \'["long"]\''],
    ['channels','locked','INTEGER DEFAULT 0'],
    ['videos','creator_assets','TEXT DEFAULT NULL'],
    ['ideas','origin',"TEXT DEFAULT 'manual'"],
    ['ideas','ai_summary','TEXT DEFAULT NULL'],
    ['videos','idea_id','TEXT DEFAULT NULL'],
    ['videos','description','TEXT DEFAULT ""'],
    ['tasks','channel_id','TEXT DEFAULT NULL'],
    ['tasks','metadata','TEXT DEFAULT NULL'],
    ['ideas','ai_summary','TEXT DEFAULT NULL'],
  ];
  for(const[table,col,def]of cols){
    if(!colExists(table,col))try{db.run(`ALTER TABLE ${table} ADD COLUMN ${col} ${def}`);}catch(e){}
  }
  saveDb();
}

function initSchema(){
  db.run(`CREATE TABLE IF NOT EXISTS channels(
    id TEXT PRIMARY KEY,name TEXT NOT NULL,preset TEXT DEFAULT 'long',
    style_prompt TEXT DEFAULT '',topic TEXT DEFAULT '',
    voice_profile TEXT DEFAULT 'default',voice_engine TEXT DEFAULT 'auto',
    publish_schedule TEXT DEFAULT '0 18 * * *',auto_approve INTEGER DEFAULT 0,
    target_length_min INTEGER DEFAULT 20,target_length_max INTEGER DEFAULT 90,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS videos(
    id TEXT PRIMARY KEY,channel_id TEXT,title TEXT,description TEXT DEFAULT '',
    preset TEXT DEFAULT 'long',target_length INTEGER,status TEXT DEFAULT 'pending',
    stage TEXT DEFAULT 'ingest',idea_id TEXT,script TEXT,assets_json TEXT,
    voice_path TEXT,video_path TEXT,thumbnail_path TEXT,youtube_id TEXT,
    approved_at TEXT,published_at TEXT,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS ideas(
    id TEXT PRIMARY KEY,channel_id TEXT,title TEXT NOT NULL,
    description TEXT DEFAULT '',sources TEXT DEFAULT '[]',tags TEXT DEFAULT '[]',
    priority INTEGER DEFAULT 0,status TEXT DEFAULT 'idea',target_length INTEGER,
    origin TEXT DEFAULT 'manual',ai_summary TEXT,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS tasks(
    id TEXT PRIMARY KEY,type TEXT,video_id TEXT,channel_id TEXT,agent TEXT,model TEXT,
    status TEXT DEFAULT 'queued',input_json TEXT,output_json TEXT,error TEXT,metadata TEXT,
    started_at TEXT,completed_at TEXT,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY,value TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS api_usage(
    id TEXT PRIMARY KEY,agent TEXT,model TEXT,input_tokens INTEGER,output_tokens INTEGER,
    cost_usd REAL,task_type TEXT,channel_id TEXT,created_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sources(
    id TEXT PRIMARY KEY,channel_id TEXT,url TEXT,type TEXT,name TEXT,
    enabled INTEGER DEFAULT 1,last_crawled TEXT,created_at TEXT DEFAULT(datetime('now'))
  )`);
  saveDb();
}

function run(sql,params=[]){db.run(sql,params);saveDb();}
function all(sql,params=[]){
  const stmt=db.prepare(sql);stmt.bind(params);
  const rows=[];while(stmt.step())rows.push(stmt.getAsObject());stmt.free();return rows;
}
function get(sql,params=[]){return all(sql,params)[0]||null;}

// Works as require('./ipc/db')(ipcMain) from main.js AND const{getDb}=require('./ipc/db')
const dbModule=function(ipcMain){};
dbModule.getDb=getDb;dbModule.saveDb=saveDb;dbModule.run=run;dbModule.all=all;dbModule.get=get;
module.exports=dbModule;

  ipcMain.handle('video:attachAssets',async(_,videoId,assetType,files)=>{
    const db=await getDb();
    // Store creator assets in video record under creator_assets JSON column
    const existing=get('SELECT creator_assets FROM videos WHERE id=?',[videoId]);
    let ca={};
    try{ca=JSON.parse(existing?.creator_assets||'{}');}catch(e){}
    ca[assetType]=(ca[assetType]||[]).concat(files);
    run('UPDATE videos SET creator_assets=? WHERE id=?',[JSON.stringify(ca),videoId]);
    return{ok:true};
  });

  // Generate subtitles for a video in a given language
  ipcMain.handle('video:generateSubtitles',async(_,videoId,langCode)=>{
    // Get video and its script
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    if(!video)throw new Error('Video not found');

    const settings_row=get("SELECT value FROM settings WHERE key='apiKeys'");
    const apiKeys=settings_row?JSON.parse(settings_row.value):{};

    let script='';
    try{const s=JSON.parse(video.script||'{}');script=(s.script||[]).map(seg=>seg.text||'').join('\n\n');}catch(e){}

    if(!script)throw new Error('No script found — generate a script first');

    // Use AI to translate if not English
    const https=require('https');
    function aiPost(body){
      return new Promise((res,rej)=>{
        const b=JSON.stringify(body);
        const r=https.request({hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',
          headers:{'Content-Type':'application/json','x-api-key':apiKeys.claude,'anthropic-version':'2023-06-01','Content-Length':Buffer.byteLength(b)}},resp=>{
          let d='';resp.on('data',c=>d+=c);resp.on('end',()=>res(JSON.parse(d)));
        });
        r.on('error',rej);r.write(b);r.end();
      });
    }

    let srtContent='';
    if(langCode==='en'||langCode==='en-CA'){
      // Convert script to basic SRT
      const segments=(JSON.parse(video.script||'{}')).script||[];
      let idx=1,time=0;
      srtContent=segments.map(seg=>{
        const dur=Math.max(2,(seg.text?.split(' ').length||10)/3);
        const start=formatSRT(time);const end=formatSRT(time+dur);
        time+=dur+0.5;
        return`${idx++}\n${start} --> ${end}\n${seg.text||''}\n`;
      }).join('\n');
    } else if(apiKeys.claude){
      const prompt=`Translate this script to ${langCode} and format as SRT subtitles. Return ONLY valid SRT format, no preamble.\n\nScript:\n${script}`;
      const resp=await aiPost({model:'claude-haiku-4-5-20251001',max_tokens:4096,messages:[{role:'user',content:prompt}]});
      srtContent=resp.content?.[0]?.text||'';
    } else {
      throw new Error('Claude API key required for translation. Add it in Settings → AI Models.');
    }

    // Save SRT to video record
    const existing=JSON.parse(video.creator_assets||'{}');
    existing.subtitles=existing.subtitles||{};
    existing.subtitles[langCode]={content:srtContent,generated_at:new Date().toISOString()};
    run('UPDATE videos SET creator_assets=? WHERE id=?',[JSON.stringify(existing),videoId]);
    return{ok:true,langCode,lines:srtContent.split('\n').length};
  });

  function formatSRT(seconds){
    const h=Math.floor(seconds/3600),m=Math.floor((seconds%3600)/60),s=Math.floor(seconds%60),ms=Math.floor((seconds%1)*1000);
    return`${pad(h)}:${pad(m)}:${pad(s)},${String(ms).padStart(3,'0')}`;
  }
  function pad(n){return String(n).padStart(2,'0');}
