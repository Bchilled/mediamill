const{getDb,run,all}=require('./db');
module.exports=(ipcMain)=>{
  ipcMain.handle('tasks:getAll',async(_,filters={})=>{
    await getDb();
    return all('SELECT * FROM tasks ORDER BY created_at DESC LIMIT 100');
  });
  ipcMain.handle('tasks:cancel',async(_,id)=>{
    await getDb();
    run("UPDATE tasks SET status='cancelled',updated_at=datetime('now') WHERE id=?",[id]);
    return{ok:true};
  });
  ipcMain.handle('tasks:retry',async(_,id)=>{
    await getDb();
    run("UPDATE tasks SET status='queued',updated_at=datetime('now') WHERE id=?",[id]);
    return{ok:true};
  });
};
