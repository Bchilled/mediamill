const cron=require('node-cron');
const{getDb,run,all}=require('./db');
const jobs=new Map();
module.exports=(ipcMain)=>{
  ipcMain.handle('tasks:getAll',async(_,f)=>{
    f=f||{};await getDb();let sql='SELECT * FROM tasks WHERE 1=1';const p=[];
    if(f.status){sql+=' AND status=?';p.push(f.status);}
    if(f.channel_id){sql+=' AND channel_id=?';p.push(f.channel_id);}
    return all(sql+' ORDER BY created_at DESC LIMIT 100',p);
  });
  ipcMain.handle('tasks:cancel',async(_,id)=>{await getDb();run("UPDATE tasks SET status='cancelled' WHERE id=?",[id]);return{ok:true};});
  ipcMain.handle('tasks:retry',async(_,id)=>{await getDb();run("UPDATE tasks SET status='queued',error=NULL WHERE id=?",[id]);return{ok:true};});
  if(!jobs.has('ingest'))jobs.set('ingest',cron.schedule('0 6 * * *',()=>console.log('[Scheduler] ingest')));
  if(!jobs.has('upload'))jobs.set('upload',cron.schedule('0 18 * * *',()=>console.log('[Scheduler] upload')));
  if(!jobs.has('analytics'))jobs.set('analytics',cron.schedule('0 23 * * *',()=>console.log('[Scheduler] analytics')));
};