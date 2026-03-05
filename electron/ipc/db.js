const path=require('path');
const{app}=require('electron');
const fs=require('fs');
let db=null;
let SQL=null;

async function getDb(){
  if(db)return db;
  if(!SQL){
    SQL=await require('sql.js')({
      locateFile:f=>path.join(__dirname,'../../node_modules/sql.js/dist/',f)
    });
  }
  const dbPath=path.join(app.getPath('userData'),'forge.db');
  if(fs.existsSync(dbPath)){
    const data=fs.readFileSync(dbPath);
    db=new SQL.Database(data);
  }else{
    db=new SQL.Database();
  }
  initSchema();
  return db;
}

function saveDb(){
  if(!db)return;
  const dbPath=path.join(app.getPath('userData'),'forge.db');
  const data=db.export();
  fs.writeFileSync(dbPath,Buffer.from(data));
}

function initSchema(){
  db.run(`CREATE TABLE IF NOT EXISTS channels(
    id TEXT PRIMARY KEY,name TEXT NOT NULL,preset TEXT DEFAULT 'long',
    style_prompt TEXT DEFAULT '',voice_profile TEXT DEFAULT 'default',
    voice_engine TEXT DEFAULT 'auto',
    publish_schedule TEXT DEFAULT '0 18 * * *',auto_approve INTEGER DEFAULT 0,
    target_length_min INTEGER DEFAULT 20,target_length_max INTEGER DEFAULT 90,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS videos(
    id TEXT PRIMARY KEY,channel_id TEXT,title TEXT,description TEXT,
    preset TEXT DEFAULT 'long',target_length INTEGER,
    status TEXT DEFAULT 'pending',stage TEXT DEFAULT 'ingest',
    idea_id TEXT,script TEXT,assets_json TEXT,voice_path TEXT,
    video_path TEXT,thumbnail_path TEXT,youtube_id TEXT,
    approved_at TEXT,published_at TEXT,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS ideas(
    id TEXT PRIMARY KEY,channel_id TEXT,title TEXT NOT NULL,
    description TEXT DEFAULT '',sources TEXT DEFAULT '[]',
    tags TEXT DEFAULT '[]',priority INTEGER DEFAULT 0,
    status TEXT DEFAULT 'idea',target_length INTEGER,
    origin TEXT DEFAULT 'manual',ai_summary TEXT,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS tasks(
    id TEXT PRIMARY KEY,type TEXT,video_id TEXT,channel_id TEXT,
    agent TEXT,model TEXT,status TEXT DEFAULT 'queued',
    input_json TEXT,output_json TEXT,error TEXT,metadata TEXT,
    started_at TEXT,completed_at TEXT,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS prompts(
    id TEXT PRIMARY KEY,name TEXT,type TEXT,content TEXT,
    channel_id TEXT,is_global INTEGER DEFAULT 1,
    created_at TEXT DEFAULT(datetime('now')),updated_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS agent_config(
    task_type TEXT PRIMARY KEY,agent TEXT,model TEXT,
    enabled INTEGER DEFAULT 1,fallback_agent TEXT,fallback_model TEXT,
    max_tokens INTEGER DEFAULT 4096,temperature REAL DEFAULT 0.7
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS settings(
    key TEXT PRIMARY KEY,value TEXT
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS api_usage(
    id TEXT PRIMARY KEY,agent TEXT,model TEXT,
    input_tokens INTEGER,output_tokens INTEGER,cost_usd REAL,
    task_type TEXT,channel_id TEXT,
    created_at TEXT DEFAULT(datetime('now'))
  )`);
  db.run(`CREATE TABLE IF NOT EXISTS sources(
    id TEXT PRIMARY KEY,channel_id TEXT,url TEXT,type TEXT,
    name TEXT,enabled INTEGER DEFAULT 1,last_crawled TEXT,
    created_at TEXT DEFAULT(datetime('now'))
  )`);
  saveDb();
}

function run(sql,params=[]){
  db.run(sql,params);
  saveDb();
}
function all(sql,params=[]){
  const stmt=db.prepare(sql);
  stmt.bind(params);
  const rows=[];
  while(stmt.step())rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}
function get(sql,params=[]){
  const rows=all(sql,params);
  return rows[0]||null;
}

module.exports={getDb,saveDb,run,all,get};
