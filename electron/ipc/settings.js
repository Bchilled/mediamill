const{getDb,run,all,get}=require('./db');
const os=require('os');

function flattenSettings(rows){
  const s={apiKeys:{}};
  rows.forEach(r=>{
    try{
      const val=JSON.parse(r.value);
      if(r.key.startsWith('apiKey.')){
        s.apiKeys[r.key.replace('apiKey.','')]=val;
      } else {
        s[r.key]=val;
      }
    }catch(e){s[r.key]=r.value;}
  });
  return s;
}

module.exports=(ipcMain)=>{
  ipcMain.handle('settings:get',async()=>{
    await getDb();
    const rows=all('SELECT key,value FROM settings');
    return flattenSettings(rows);
  });

  ipcMain.handle('settings:update',async(_,d)=>{
    await getDb();
    // Handle nested apiKeys object
    if(d.apiKeys){
      for(const[k,v]of Object.entries(d.apiKeys)){
        if(v!==undefined&&v!==null&&v!==''){
          run('INSERT OR REPLACE INTO settings(key,value)VALUES(?,?)',['apiKey.'+k,JSON.stringify(v)]);
        }
      }
      delete d.apiKeys;
    }
    if(d.budget){
      run('INSERT OR REPLACE INTO settings(key,value)VALUES(?,?)',['budget',JSON.stringify(d.budget)]);
      delete d.budget;
    }
    for(const[k,v]of Object.entries(d)){
      if(v!==undefined&&v!==null){
        run('INSERT OR REPLACE INTO settings(key,value)VALUES(?,?)',[k,JSON.stringify(v)]);
      }
    }
    return{ok:true};
  });

  ipcMain.handle('settings:systemStats',async()=>({
    platform:os.platform(),arch:os.arch(),
    totalMem:os.totalmem(),freeMem:os.freemem(),
    cpus:os.cpus().length,uptime:Math.floor(os.uptime()),
    nodeVersion:process.version,
  }));

  // Expose getSettings globally for workers
  global.getAppSettings=async()=>{
    await getDb();
    const rows=all('SELECT key,value FROM settings');
    return flattenSettings(rows);
  };
};
