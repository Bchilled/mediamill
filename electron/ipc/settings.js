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
      if(service==='grok'){
        const r=await req({hostname:'api.x.ai',path:'/v1/models',method:'GET',
          headers:{'Authorization':'Bearer '+key}},{});
        return{ok:r.status===200};
      }
      if(service==='mistral'){
        const r=await req({hostname:'api.mistral.ai',path:'/v1/models',method:'GET',
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

  ipcMain.handle('system:status',async()=>{
    const{getDb,get,all}=require('./db');
    await getDb();
    const s={};
    const rows=all('SELECT key,value FROM settings');
    const keys={};
    rows.forEach(r=>{try{keys[r.key]=JSON.parse(r.value);}catch(e){keys[r.key]=r.value;}});
    const apiKeys=keys.apiKeys||{};

    // AI keys — each gets an action code the frontend can route directly
    s.claude=apiKeys.claude?'ok':'none';
    s.gemini=apiKeys.gemini?'ok':'none';
    s.openai=apiKeys.openai?'ok':'none';
    if(apiKeys.claude)s.claude='ok';
    if(apiKeys.gemini)s.gemini='ok';
    if(!apiKeys.claude&&!apiKeys.gemini&&!apiKeys.openai&&!apiKeys.grok&&!apiKeys.mistral){
      s.claude='error';
      s.claude_msg='No AI model connected';
      s.claude_fix='Connect at least one AI model to generate content';
      s.claude_action='settings:ai';
    }

    // Media
    s.pexels=apiKeys.pexels?'ok':'none';
    if(!apiKeys.pexels){s.pexels_msg='Optional — adds stock video clips';s.pexels_action='settings:media:pexels';}
    s.pixabay=apiKeys.pixabay?'ok':'none';
    if(!apiKeys.pixabay){s.pixabay_msg='Optional — adds stock images';s.pixabay_action='settings:media:pixabay';}
    s.elevenlabs=apiKeys.elevenlabs?'ok':'none';
    if(!apiKeys.elevenlabs){s.elevenlabs_msg='Optional — premium AI voices';s.elevenlabs_action='settings:media:elevenlabs';}

    // YouTube
    const ytTokens=Object.keys(keys).some(k=>k.startsWith('yt_tokens.'));
    s.youtube=ytTokens?'ok':'none';
    if(!ytTokens){s.youtube_msg='Not connected — videos save locally only';s.youtube_action='settings:youtube';}

    // FFmpeg
    const{execSync}=require('child_process');
    const{app}=require('electron');
    const path=require('path');
    const fs=require('fs');
    try{
      const ffmpegPath=path.join(app.getPath('userData'),'ffmpeg.exe');
      const candidates=[ffmpegPath,'ffmpeg'];
      let found=false;
      for(const c of candidates){try{execSync(`"${c}" -version`,{stdio:'ignore',timeout:3000});found=true;break;}catch(e){}}
      s.ffmpeg=found?'ok':'warn';
      if(!found){s.ffmpeg_msg='Not found in PATH';s.ffmpeg_fix='FFmpeg will be bundled with the final release build';}
    }catch(e){s.ffmpeg='warn';}

    // DB
    try{
      const count=get('SELECT count(*) as n FROM channels');
      s.db='ok';
    }catch(e){s.db='error';s.db_msg=e.message;}

    return s;
  });

  // Open folder/file picker dialog
  const{dialog,app}=require('electron');
  const path=require('path');
  const fs=require('fs');

  ipcMain.handle('dialog:openFolder',async(_,acceptType)=>{
    const filters=[];
    if(acceptType==='image')filters.push({name:'Images',extensions:['png','jpg','jpeg','gif','webp','svg']});
    else if(acceptType==='video')filters.push({name:'Video',extensions:['mp4','mov','avi','mkv','webm','m4v']});
    else if(acceptType==='audio')filters.push({name:'Audio',extensions:['mp3','wav','m4a','aac','ogg','flac']});
    else if(acceptType==='document')filters.push({name:'Documents',extensions:['pdf','txt','md','srt','vtt','csv','docx']});
    else filters.push({name:'All Media',extensions:['png','jpg','jpeg','gif','mp4','mov','mp3','wav','m4a','pdf','txt','srt']});
    filters.push({name:'All Files',extensions:['*']});

    const{filePaths,canceled}=await dialog.showOpenDialog({
      properties:['openFile','multiSelections'],
      filters,
    });
    if(canceled||!filePaths.length)return{files:[]};

    const files=filePaths.map(p=>{
      try{
        const stat=fs.statSync(p);
        const ext=path.extname(p).slice(1).toLowerCase();
        const typeMap={png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',gif:'image/gif',webp:'image/webp',
          mp4:'video/mp4',mov:'video/quicktime',avi:'video/avi',mkv:'video/x-matroska',webm:'video/webm',
          mp3:'audio/mpeg',wav:'audio/wav',m4a:'audio/m4a',aac:'audio/aac',ogg:'audio/ogg',flac:'audio/flac',
          pdf:'application/pdf',txt:'text/plain',srt:'text/srt',vtt:'text/vtt',md:'text/markdown'};
        const mimeType=typeMap[ext]||'application/octet-stream';
        const data=fs.readFileSync(p);
        const b64=data.toString('base64');
        return{name:path.basename(p),path:p,dataUri:`data:${mimeType};base64,${b64}`,type:mimeType,size:stat.size};
      }catch(e){return{name:path.basename(p),path:p,type:'unknown',size:0};}
    });
    return{files};
  });

  // Import file from URL
  const https=require('https');
  const http=require('http');
  ipcMain.handle('media:importFromUrl',async(_,url)=>{
    return new Promise((resolve,reject)=>{
      const client=url.startsWith('https')?https:http;
      client.get(url,{headers:{'User-Agent':'MediaMill/1.0'}},res=>{
        if(res.statusCode!==200){reject(new Error(`HTTP ${res.statusCode}`));return;}
        const chunks=[];
        res.on('data',c=>chunks.push(c));
        res.on('end',()=>{
          const buf=Buffer.concat(chunks);
          const ct=res.headers['content-type']||'application/octet-stream';
          const ext=ct.split('/')[1]?.split(';')[0]||'bin';
          const name=url.split('/').pop().split('?')[0]||`import.${ext}`;
          const b64=buf.toString('base64');
          resolve({name,path:url,dataUri:`data:${ct};base64,${b64}`,type:ct,size:buf.length});
        });
        res.on('error',reject);
      }).on('error',reject);
    });
  });

  // Error logging
  const fs=require('fs');
  const path=require('path');
  const{app}=require('electron');
  const errorLogPath=path.join(app.getPath('userData'),'error-log.jsonl');

  ipcMain.handle('log:error',async(_,entry)=>{
    try{fs.appendFileSync(errorLogPath,JSON.stringify(entry)+'\n','utf8');}catch(e){}
    return{ok:true};
  });

  ipcMain.handle('log:save',async(_,text)=>{
    const{dialog}=require('electron');
    const{filePath,canceled}=await dialog.showSaveDialog({
      defaultPath:'mediamill-errors.txt',
      filters:[{name:'Text',extensions:['txt']},{name:'All',extensions:['*']}],
    });
    if(!canceled&&filePath){fs.writeFileSync(filePath,text,'utf8');return{ok:true};}
    return{ok:false};
  });
};
