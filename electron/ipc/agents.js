const{getDb,run,all,get}=require('./db');
module.exports=(ipcMain)=>{
  ipcMain.handle('agents:getConfig',async()=>{
    await getDb();
    return all('SELECT * FROM agent_config');
  });
  ipcMain.handle('agents:updateConfig',async(_,config)=>{
    await getDb();
    for(const[k,v]of Object.entries(config)){
      run('INSERT OR REPLACE INTO agent_config(task_type,agent,model,enabled)VALUES(?,?,?,?)',[k,v.agent,v.model,v.enabled?1:0]);
    }
    return{ok:true};
  });
};
