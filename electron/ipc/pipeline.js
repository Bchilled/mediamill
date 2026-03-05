const{getDb,run,all,get}=require('./db');
const{v4:uuid}=require('uuid');
const path=require('path');
const fs=require('fs');
const{app}=require('electron');

function getSettings(){
  try{
    const rows=all('SELECT key,value FROM settings');
    const s={};
    rows.forEach(r=>{try{s[r.key]=JSON.parse(r.value);}catch(e){s[r.key]=r.value;}});
    return s;
  }catch(e){return{};}
}

function ensureDir(p){if(!fs.existsSync(p))fs.mkdirSync(p,{recursive:true});return p;}

function getDirs(){
  const base=app.getPath('userData');
  return{
    scripts:ensureDir(path.join(base,'scripts')),
    assets:ensureDir(path.join(base,'assets')),
    voice:ensureDir(path.join(base,'voice')),
    output:ensureDir(path.join(base,'output')),
  };
}

function setStage(videoId,stage,status='processing'){
  run(`UPDATE videos SET stage=?,status=?,updated_at=datetime('now') WHERE id=?`,[stage,status,videoId]);
}

function logTask(videoId,channelId,type,status,detail=''){
  const id=uuid();
  run(`INSERT INTO tasks(id,type,video_id,channel_id,status,output_json,created_at,updated_at)VALUES(?,?,?,?,?,?,datetime('now'),datetime('now'))`,
    [id,type,videoId,channelId,status,detail?JSON.stringify({detail}):null]);
  return id;
}

module.exports=(ipcMain)=>{
  ipcMain.handle('videos:getAll',async(_,channelId)=>{await getDb();return all('SELECT * FROM videos WHERE channel_id=? ORDER BY created_at DESC',[channelId]);});
  ipcMain.handle('videos:get',async(_,id)=>{await getDb();return get('SELECT * FROM videos WHERE id=?',[id]);});
  ipcMain.handle('videos:create',async(_,d)=>{
    await getDb();const id=uuid();
    run('INSERT INTO videos(id,channel_id,title,description,preset,target_length,status,stage)VALUES(?,?,?,?,?,?,?,?)',
      [id,d.channel_id,d.title,d.description||'',d.preset||'long',d.target_length||null,'pending','ingest']);
    return get('SELECT * FROM videos WHERE id=?',[id]);
  });
  ipcMain.handle('videos:update',async(_,id,d)=>{
    await getDb();const f=Object.keys(d).map(k=>k+'=?').join(',');
    run('UPDATE videos SET '+f+",updated_at=datetime('now') WHERE id=?",[...Object.values(d),id]);
    return get('SELECT * FROM videos WHERE id=?',[id]);
  });
  ipcMain.handle('videos:delete',async(_,id)=>{await getDb();run('DELETE FROM videos WHERE id=?',[id]);return{ok:true};});
  ipcMain.handle('videos:approve',async(_,id)=>{
    await getDb();
    run("UPDATE videos SET status='approved',approved_at=datetime('now'),updated_at=datetime('now') WHERE id=?",[id]);
    // Auto-start compose stage
    const video=get('SELECT * FROM videos WHERE id=?',[id]);
    const channel=get('SELECT * FROM channels WHERE id=?',[video?.channel_id]);
    if(video&&channel)setImmediate(()=>runCompose(video,channel));
    return{ok:true};
  });

  ipcMain.handle('pipeline:start',async(_,videoId)=>{
    await getDb();
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    if(!video)throw new Error('Video not found');
    const channel=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    if(!channel)throw new Error('Channel not found');
    setStage(videoId,'script');
    setImmediate(()=>runFull(video,channel));
    return{ok:true};
  });

  ipcMain.handle('pipeline:status',async(_,videoId)=>{
    await getDb();
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    const tasks=all('SELECT * FROM tasks WHERE video_id=? ORDER BY created_at ASC',[videoId]);
    return{video,tasks};
  });

  // Manual per-stage triggers
  ipcMain.handle('pipeline:generateScript',async(_,videoId)=>{
    await getDb();
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    const channel=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    const settings=getSettings();
    setStage(videoId,'script');
    const{generateScript}=require('../workers/scriptGenerator');
    try{
      const script=await generateScript(video,channel,settings);
      const dirs=getDirs();
      fs.writeFileSync(path.join(dirs.scripts,videoId+'.json'),JSON.stringify(script,null,2));
      run("UPDATE videos SET script=?,stage='assets',updated_at=datetime('now') WHERE id=?",[JSON.stringify(script),videoId]);
      logTask(videoId,channel.id,'script','completed','Script generated successfully');
      return{ok:true,script};
    }catch(e){
      setStage(videoId,'script','failed');
      logTask(videoId,channel.id,'script','failed',e.message);
      throw e;
    }
  });

  ipcMain.handle('pipeline:gatherAssets',async(_,videoId)=>{
    await getDb();
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    const channel=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    const settings=getSettings();
    if(!video.script)throw new Error('Generate script first');
    setStage(videoId,'assets');
    const{gatherAssetsForScript}=require('../workers/assetGatherer');
    const dirs=getDirs();
    try{
      const script=JSON.parse(video.script);
      const assetDir=path.join(dirs.assets,videoId);
      ensureDir(assetDir);
      const assets=await gatherAssetsForScript(script,settings,assetDir);
      run("UPDATE videos SET assets_json=?,stage='voice',updated_at=datetime('now') WHERE id=?",[JSON.stringify(assets),videoId]);
      logTask(videoId,channel.id,'assets','completed',`${assets.length} assets gathered`);
      return{ok:true,assets};
    }catch(e){
      setStage(videoId,'assets','failed');
      logTask(videoId,channel.id,'assets','failed',e.message);
      throw e;
    }
  });

  ipcMain.handle('pipeline:renderVoice',async(_,videoId)=>{
    await getDb();
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    const channel=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    const settings=getSettings();
    if(!video.script)throw new Error('Generate script first');
    setStage(videoId,'voice');
    const{renderScriptVoice}=require('../workers/voiceRenderer');
    const dirs=getDirs();
    try{
      const script=JSON.parse(video.script);
      const voiceDir=path.join(dirs.voice,videoId);
      ensureDir(voiceDir);
      const audioFiles=await renderScriptVoice(script,voiceDir,settings,channel.voice_engine||'auto');
      run("UPDATE videos SET voice_path=?,stage='compose',updated_at=datetime('now') WHERE id=?",[JSON.stringify(audioFiles),videoId]);
      logTask(videoId,channel.id,'voice','completed',`${audioFiles.length} audio segments rendered`);
      return{ok:true,audioFiles};
    }catch(e){
      setStage(videoId,'voice','failed');
      logTask(videoId,channel.id,'voice','failed',e.message);
      throw e;
    }
  });

  ipcMain.handle('pipeline:compose',async(_,videoId)=>{
    await getDb();
    const video=get('SELECT * FROM videos WHERE id=?',[videoId]);
    const channel=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    if(!video.script)throw new Error('Generate script first');
    setStage(videoId,'compose');
    const{composeVideo}=require('../workers/videoComposer');
    const dirs=getDirs();
    try{
      const script=JSON.parse(video.script);
      const assets=video.assets_json?JSON.parse(video.assets_json):[];
      const audioFiles=video.voice_path?JSON.parse(video.voice_path):[];
      const outPath=path.join(dirs.output,videoId+'.mp4');
      await composeVideo(script,audioFiles,assets,outPath,getSettings());
      run("UPDATE videos SET video_path=?,stage='review',status='review',updated_at=datetime('now') WHERE id=?",[outPath,videoId]);
      logTask(videoId,channel.id,'compose','completed',outPath);
      return{ok:true,videoPath:outPath};
    }catch(e){
      setStage(videoId,'compose','failed');
      logTask(videoId,channel.id,'compose','failed',e.message);
      throw e;
    }
  });
};

// Full autonomous pipeline
async function runFull(video,channel){
  try{
    await getDb();
    const settings=getSettings();
    const dirs=getDirs();

    // 1. Script
    setStage(video.id,'script');
    const{generateScript}=require('../workers/scriptGenerator');
    const script=await generateScript(video,channel,settings);
    fs.writeFileSync(path.join(dirs.scripts,video.id+'.json'),JSON.stringify(script,null,2));
    run("UPDATE videos SET script=?,stage='assets',updated_at=datetime('now') WHERE id=?",[JSON.stringify(script),video.id]);
    logTask(video.id,channel.id,'script','completed','Script generated');

    // 2. Assets
    setStage(video.id,'assets');
    const{gatherAssetsForScript}=require('../workers/assetGatherer');
    const assetDir=path.join(dirs.assets,video.id);
    ensureDir(assetDir);
    const assets=await gatherAssetsForScript(script,settings,assetDir);
    run("UPDATE videos SET assets_json=?,stage='voice',updated_at=datetime('now') WHERE id=?",[JSON.stringify(assets),video.id]);
    logTask(video.id,channel.id,'assets','completed',`${assets.length} assets`);

    // 3. Voice
    setStage(video.id,'voice');
    const{renderScriptVoice}=require('../workers/voiceRenderer');
    const voiceDir=path.join(dirs.voice,video.id);
    ensureDir(voiceDir);
    const audioFiles=await renderScriptVoice(script,voiceDir,settings,channel.voice_engine||'auto');
    run("UPDATE videos SET voice_path=?,stage='compose',updated_at=datetime('now') WHERE id=?",[JSON.stringify(audioFiles),video.id]);
    logTask(video.id,channel.id,'voice','completed',`${audioFiles.length} segments`);

    // 4. Compose
    setStage(video.id,'compose');
    const{composeVideo}=require('../workers/videoComposer');
    const outPath=path.join(dirs.output,video.id+'.mp4');
    await composeVideo(script,audioFiles,assets,outPath,settings);
    run("UPDATE videos SET video_path=?,updated_at=datetime('now') WHERE id=?",[outPath,video.id]);
    logTask(video.id,channel.id,'compose','completed',outPath);

    // 5. Done — review or auto-approve
    const ch=get('SELECT * FROM channels WHERE id=?',[video.channel_id]);
    if(ch?.auto_approve){
      run("UPDATE videos SET status='approved',stage='publish',approved_at=datetime('now'),updated_at=datetime('now') WHERE id=?",[video.id]);
    }else{
      run("UPDATE videos SET status='review',stage='review',updated_at=datetime('now') WHERE id=?",[video.id]);
    }
  }catch(e){
    console.error('[Pipeline] FAILED',video.id,e.message);
    run("UPDATE videos SET status='failed',updated_at=datetime('now') WHERE id=?",[video.id]);
    try{logTask(video.id,channel.id,'pipeline','failed',e.message);}catch(e2){}
  }
}

async function runCompose(video,channel){
  // Called after manual approval — just compose + stage for publish
  // (voice+assets already done)
}
