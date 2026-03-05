const{getDb,run,all,get}=require('./db');
const{v4:uuid}=require('uuid');
module.exports=(ipcMain)=>{
  ipcMain.handle('channels:getAll',async()=>{await getDb();return all('SELECT * FROM channels ORDER BY created_at ASC');});
  ipcMain.handle('channels:create',async(_,d)=>{
    await getDb();const id=uuid();
    run('INSERT INTO channels(id,name,preset,style_prompt,voice_profile,publish_schedule,auto_approve,target_length_min,target_length_max)VALUES(?,?,?,?,?,?,?,?,?)',[id,d.name,d.preset||'long',d.style_prompt||'',d.voice_profile||'default',d.publish_schedule||'0 18 * * *',d.auto_approve?1:0,d.target_length_min||20,d.target_length_max||90]);
    return get('SELECT * FROM channels WHERE id=?',[id]);
  });
  ipcMain.handle('channels:update',async(_,id,d)=>{
    await getDb();const f=Object.keys(d).map(k=>k+'=?').join(',');
    run('UPDATE channels SET '+f+",updated_at=datetime('now') WHERE id=?",[...Object.values(d),id]);
    return get('SELECT * FROM channels WHERE id=?',[id]);
  });
  ipcMain.handle('channels:delete',async(_,id)=>{await getDb();run('DELETE FROM channels WHERE id=?',[id]);return{ok:true};});
};