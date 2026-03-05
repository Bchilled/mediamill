const https=require('https');
const http=require('http');
const fs=require('fs');
const path=require('path');
const{exec}=require('child_process');
const{v4:uuid}=require('uuid');

// Windows TTS via PowerShell — free, no API key needed
function renderWindowsTTS(text,outputPath,voice='en-US'){
  return new Promise((resolve,reject)=>{
    const safe=text.replace(/'/g,"\\'").replace(/"/g,'\\"').replace(/`/g,'');
    const ps=`
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.SetOutputToWaveFile('${outputPath.replace(/\\/g,'\\\\')}')
$synth.Speak('${safe}')
$synth.Dispose()
`;
    const tmpScript=path.join(require('os').tmpdir(),'tts_'+uuid()+'.ps1');
    fs.writeFileSync(tmpScript,ps,'utf8');
    exec(`powershell -ExecutionPolicy Bypass -File "${tmpScript}"`,{timeout:60000},(err,stdout,stderr)=>{
      try{fs.unlinkSync(tmpScript);}catch(e){}
      if(err)return reject(new Error('Windows TTS failed: '+stderr));
      if(!fs.existsSync(outputPath))return reject(new Error('TTS output file not created'));
      resolve(outputPath);
    });
  });
}

// ElevenLabs TTS
async function renderElevenLabs(text,outputPath,apiKey,voiceId='21m00Tcm4TlvDq8ikWAM'){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({text,model_id:'eleven_monolingual_v1',voice_settings:{stability:0.5,similarity_boost:0.75}});
    const req=https.request({
      hostname:'api.elevenlabs.io',path:`/v1/text-to-speech/${voiceId}`,method:'POST',
      headers:{'Content-Type':'application/json','xi-api-key':apiKey,'Accept':'audio/mpeg','Content-Length':Buffer.byteLength(body)},
    },res=>{
      if(res.statusCode!==200)return reject(new Error('ElevenLabs error: '+res.statusCode));
      const chunks=[];
      res.on('data',c=>chunks.push(c));
      res.on('end',()=>{fs.writeFileSync(outputPath,Buffer.concat(chunks));resolve(outputPath);});
    });
    req.on('error',reject);req.write(body);req.end();
  });
}

// Play.ht TTS
async function renderPlayHT(text,outputPath,apiKey,userId){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({text,voice:'en-US-JennyNeural',output_format:'mp3',speed:1});
    const req=https.request({
      hostname:'api.play.ht',path:'/api/v2/tts',method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey,'X-USER-ID':userId||'','Content-Length':Buffer.byteLength(body)},
    },res=>{
      let data='';
      res.on('data',c=>data+=c);
      res.on('end',()=>{
        try{
          const d=JSON.parse(data);
          if(d.audioUrl)resolve(d.audioUrl);// Would need second fetch to download
          else reject(new Error('PlayHT: no audio URL'));
        }catch(e){reject(e);}
      });
    });
    req.on('error',reject);req.write(body);req.end();
  });
}

async function renderVoice(text,outputPath,settings,engine='auto'){
  const pick=engine==='auto'?pickEngine(settings):engine;
  console.log('[Voice] Using engine:',pick);

  switch(pick){
    case'elevenlabs':
      if(!settings.apiKeys?.elevenlabs)throw new Error('ElevenLabs key not configured');
      return renderElevenLabs(text,outputPath,settings.apiKeys.elevenlabs);
    case'playht':
      if(!settings.apiKeys?.playht)throw new Error('Play.ht key not configured');
      return renderPlayHT(text,outputPath,settings.apiKeys.playht);
    case'windows':
    default:
      return renderWindowsTTS(text,outputPath);
  }
}

function pickEngine(settings){
  if(settings.apiKeys?.elevenlabs)return'elevenlabs';
  if(settings.apiKeys?.playht)return'playht';
  return'windows';
}

// Render full script — one audio file per segment, then merge
async function renderScriptVoice(script,voiceDir,settings,engine='auto'){
  const segments=script.script||[];
  const audioFiles=[];

  for(const seg of segments){
    if(!seg.narration?.trim())continue;
    const filename=uuid()+'.wav';
    const outPath=path.join(voiceDir,filename);
    try{
      await renderVoice(seg.narration,outPath,settings,engine);
      audioFiles.push({segId:seg.id,path:outPath,duration:seg.duration_seconds});
    }catch(e){
      console.error('[Voice] Segment',seg.id,'failed:',e.message);
    }
  }
  return audioFiles;
}

module.exports={renderVoice,renderScriptVoice,renderWindowsTTS,renderElevenLabs};
