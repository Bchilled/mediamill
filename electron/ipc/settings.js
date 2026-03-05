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

  // Open URL in system browser (prevents Electron popup windows)
  const{shell}=require('electron');
  ipcMain.handle('shell:openExternal',async(_,url)=>{
    await shell.openExternal(url);
    return{ok:true};
  });

  // Test an API key is valid
  ipcMain.handle('settings:testKey',async(_,service,key)=>{
    const https=require('https');
    function req(options,body){
      return new Promise((resolve,reject)=>{
        const r=https.request(options,res=>{
          let d='';res.on('data',c=>d+=c);
          res.on('end',()=>resolve({status:res.statusCode,body:d}));
        });
        r.on('error',reject);
        if(body)r.write(body);
        r.end();
      });
    }
    try{
      if(service==='claude'){
        const body=JSON.stringify({model:'claude-haiku-4-5-20251001',max_tokens:10,messages:[{role:'user',content:'hi'}]});
        const r=await req({hostname:'api.anthropic.com',path:'/v1/messages',method:'POST',
          headers:{'Content-Type':'application/json','x-api-key':key,'anthropic-version':'2023-06-01','Content-Length':Buffer.byteLength(body)}},body);
        return{ok:r.status===200};
      }
      if(service==='gemini'){
        const r=await req({hostname:'generativelanguage.googleapis.com',path:`/v1beta/models?key=${key}`,method:'GET'},{});
        return{ok:r.status===200};
      }
      if(service==='openai'){
        const r=await req({hostname:'api.openai.com',path:'/v1/models',method:'GET',
          headers:{'Authorization':'Bearer '+key}},{});
        return{ok:r.status===200};
      }
      if(service==='pexels'){
        const r=await req({hostname:'api.pexels.com',path:'/v1/search?query=test&per_page=1',method:'GET',
          headers:{'Authorization':key}},{});
        return{ok:r.status===200};
      }
      if(service==='pixabay'){
        const r=await req({hostname:'pixabay.com',path:`/api/?key=${key}&q=test&per_page=3`,method:'GET'},{});
        return{ok:r.status===200};
      }
      if(service==='elevenlabs'){
        const r=await req({hostname:'api.elevenlabs.io',path:'/v1/user',method:'GET',
          headers:{'xi-api-key':key}},{});
        return{ok:r.status===200};
      }
      return{ok:false,error:'Unknown service'};
    }catch(e){return{ok:false,error:e.message};}
  });

};
