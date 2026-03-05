const{getDb,run,all,get}=require('./db');
const{v4:uuid}=require('uuid');
const STAGES=['ingest','script','assets','voice','compose','thumbnail','publish'];
module.exports=(ipcMain)=>{
  ipcMain.handle('pipeline:start',async(_,videoId)=>{
    await getDb();
    run("UPDATE videos SET stage='ingest',status='processing',updated_at=datetime('now') WHERE id=?",[videoId]);
    const taskId=uuid();
    run("INSERT INTO tasks(id,type,video_id,agent,status)VALUES(?,'ingest',?,'gemini','queued')",[taskId,videoId]);
    return{ok:true,taskId};
  });
  ipcMain.handle('pipeline:status',async(_,videoId)=>{
    await getDb();
    return{video:get('SELECT * FROM videos WHERE id=?',[videoId]),tasks:all('SELECT * FROM tasks WHERE video_id=? ORDER BY created_at ASC',[videoId])};
  });
  ipcMain.handle('pipeline:advance',async(_,videoId,stage)=>{
    await getDb();const next=STAGES[STAGES.indexOf(stage)+1]||'complete';
    run("UPDATE videos SET stage=?,updated_at=datetime('now') WHERE id=?",[next,videoId]);
    return{ok:true,nextStage:next};
  });
  ipcMain.handle('videos:getAll',async(_,channelId,f)=>{
    f=f||{};await getDb();let sql='SELECT * FROM videos WHERE channel_id=?';const p=[channelId];
    if(f.status){sql+=' AND status=?';p.push(f.status);}
    return all(sql+' ORDER BY created_at DESC',p);
  });
  ipcMain.handle('videos:get',async(_,id)=>{await getDb();return get('SELECT * FROM videos WHERE id=?',[id]);});
  ipcMain.handle('videos:create',async(_,d)=>{
    await getDb();const id=uuid();
    run("INSERT INTO videos(id,channel_id,title,preset,target_length,status,stage)VALUES(?,?,?,?,?,'pending','ingest')",[id,d.channel_id,d.title||'Untitled',d.preset||'long',d.target_length||60]);
    return get('SELECT * FROM videos WHERE id=?',[id]);
  });
  ipcMain.handle('videos:update',async(_,id,d)=>{
    await getDb();const f=Object.keys(d).map(k=>k+'=?').join(',');
    run('UPDATE videos SET '+f+",updated_at=datetime('now') WHERE id=?",[...Object.values(d),id]);
    return get('SELECT * FROM videos WHERE id=?',[id]);
  });
  ipcMain.handle('videos:delete',async(_,id)=>{await getDb();run('DELETE FROM videos WHERE id=?',[id]);return{ok:true};});
  ipcMain.handle('videos:approve',async(_,id)=>{await getDb();run("UPDATE videos SET status='approved',approved_at=datetime('now'),updated_at=datetime('now') WHERE id=?",[id]);return{ok:true};});
};