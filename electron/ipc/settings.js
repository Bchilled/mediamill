const{getDb,run,all,get}=require('./db');
const os=require('os');
module.exports=(ipcMain)=>{
  ipcMain.handle('settings:get',async()=>{
    await getDb();
    const rows=all('SELECT key,value FROM settings');
    const s={};
    rows.forEach(r=>{try{s[r.key]=JSON.parse(r.value);}catch(e){s[r.key]=r.value;}});
    return s;
  });
  ipcMain.handle('settings:update',async(_,d)=>{
    await getDb();
    for(const[k,v]of Object.entries(d)){
      run('INSERT OR REPLACE INTO settings(key,value)VALUES(?,?)',[k,JSON.stringify(v)]);
    }
    return{ok:true};
  });
  ipcMain.handle('settings:systemStats',async()=>({
    platform:os.platform(),arch:os.arch(),
    totalMem:os.totalmem(),freeMem:os.freemem(),
    cpus:os.cpus().length,uptime:os.uptime(),
  }));
};
