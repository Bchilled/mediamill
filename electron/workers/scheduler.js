// Background scheduler — runs idea scans and pipeline on a schedule
const{getDb,run,all,get}=require('../ipc/db');

let scanInterval=null;
let pipelineInterval=null;

async function getSettings(){
  await getDb();
  const rows=all('SELECT key,value FROM settings');
  const s={apiKeys:{}};
  rows.forEach(r=>{try{const v=JSON.parse(r.value);if(r.key.startsWith('apiKey.')){s.apiKeys[r.key.replace('apiKey.','')]=v;}else{s[r.key]=v;}}catch(e){s[r.key]=r.value;}});
  return s;
}

async function runDailyScan(){
  console.log('[Scheduler] Running daily idea scan...');
  await getDb();
  const channels=all('SELECT * FROM channels');
  for(const ch of channels){
    try{
      const{scan}=require('./ideaScanner');
      const ideas=await scan(ch);
      const{v4:uuid}=require('uuid');
      for(const idea of ideas){
        const existing=get('SELECT id FROM ideas WHERE channel_id=? AND title=?',[ch.id,idea.title]);
        if(existing)continue;
        const id=uuid();
        run('INSERT INTO ideas(id,channel_id,title,description,sources,tags,priority,status,origin)VALUES(?,?,?,?,?,?,?,?,?)',
          [id,ch.id,idea.title,idea.description||'',JSON.stringify(idea.sources||[]),JSON.stringify(idea.tags||[]),0,'idea',idea.origin||'ai_scan']);
      }
      console.log(`[Scheduler] ${ideas.length} ideas found for "${ch.name}"`);
    }catch(e){console.error('[Scheduler] Scan failed for',ch.name,e.message);}
  }
  // Save last scan time
  run("INSERT OR REPLACE INTO settings(key,value)VALUES('last_scan',?)",[JSON.stringify(new Date().toISOString())]);
}

async function runAutoPipeline(){
  await getDb();
  const settings=await getSettings();
  if(!settings.apiKeys?.claude&&!settings.apiKeys?.gemini)return;// No AI keys
  // Find channels with auto_approve=1 and pending videos
  const pendingVideos=all(`
    SELECT v.*,c.auto_approve,c.name as channel_name
    FROM videos v JOIN channels c ON v.channel_id=c.id
    WHERE v.status='pending' AND v.stage='ingest' AND c.auto_approve=1
    LIMIT 3
  `);
  for(const video of pendingVideos){
    console.log('[Scheduler] Auto-starting pipeline for:',video.title);
    const channel=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    // Import and run pipeline
    const{app}=require('electron');
    const path=require('path');
    const fs=require('fs');
    const{v4:uuid}=require('uuid');
    // Delegate to pipeline worker inline
    try{
      run("UPDATE videos SET status='processing',stage='script',updated_at=datetime('now') WHERE id=?",[video.id]);
      const{generateScript}=require('./scriptGenerator');
      const script=await generateScript(video,channel,settings);
      const base=app.getPath('userData');
      const mkd=p=>{if(!fs.existsSync(p))fs.mkdirSync(p,{recursive:true});return p;};
      fs.writeFileSync(path.join(mkd(path.join(base,'scripts')),video.id+'.json'),JSON.stringify(script,null,2));
      run("UPDATE videos SET script=?,stage='assets',updated_at=datetime('now') WHERE id=?",[JSON.stringify(script),video.id]);
      run("UPDATE videos SET status='review',stage='review',updated_at=datetime('now') WHERE id=?",[video.id]);
    }catch(e){
      run("UPDATE videos SET status='failed',updated_at=datetime('now') WHERE id=?",[video.id]);
      console.error('[Scheduler] Pipeline failed for',video.title,e.message);
    }
  }
}

function start(){
  // Idea scan every 6 hours
  const SIX_HOURS=6*60*60*1000;
  scanInterval=setInterval(runDailyScan,SIX_HOURS);

  // Auto pipeline every 30 min
  const THIRTY_MIN=30*60*1000;
  pipelineInterval=setInterval(runAutoPipeline,THIRTY_MIN);

  // Run on startup too (after 30s delay to let app settle)
  setTimeout(runDailyScan,30000);
  setTimeout(runAutoPipeline,60000);

  console.log('[Scheduler] Started — scan every 6h, pipeline check every 30min');
}

function stop(){
  if(scanInterval)clearInterval(scanInterval);
  if(pipelineInterval)clearInterval(pipelineInterval);
}

module.exports={start,stop,runDailyScan,runAutoPipeline};
