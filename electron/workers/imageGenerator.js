const https=require('https');
const fs=require('fs');
const path=require('path');
const{v4:uuid}=require('uuid');

// Generate image via OpenAI DALL-E 3
async function generateWithDallE(prompt,apiKey,size='1024x1024',n=1){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({model:'dall-e-3',prompt,n:1,size,quality:'standard',response_format:'url'});
    const req=https.request({
      hostname:'api.openai.com',path:'/v1/images/generations',method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey,'Content-Length':Buffer.byteLength(body)},
    },res=>{
      let d='';res.on('data',c=>d+=c);
      res.on('end',()=>{
        try{
          const r=JSON.parse(d);
          if(r.error)return reject(new Error(r.error.message));
          resolve(r.data?.map(i=>i.url)||[]);
        }catch(e){reject(e);}
      });
    });
    req.on('error',reject);req.write(body);req.end();
  });
}

// Generate via Stability AI (cheaper alternative)
async function generateWithStability(prompt,apiKey){
  return new Promise((resolve,reject)=>{
    const body=JSON.stringify({
      text_prompts:[{text:prompt,weight:1}],
      cfg_scale:7,height:1024,width:1024,samples:3,steps:30,
    });
    const req=https.request({
      hostname:'api.stability.ai',
      path:'/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':'Bearer '+apiKey,'Accept':'application/json','Content-Length':Buffer.byteLength(body)},
    },res=>{
      let d='';res.on('data',c=>d+=c);
      res.on('end',()=>{
        try{
          const r=JSON.parse(d);
          if(r.message)return reject(new Error(r.message));
          // Returns base64 images
          resolve(r.artifacts?.map(a=>'data:image/png;base64,'+a.base64)||[]);
        }catch(e){reject(e);}
      });
    });
    req.on('error',reject);req.write(body);req.end();
  });
}

// Build a good prompt for a YouTube channel logo
function buildLogoPrompt(channelName,topic){
  return`Professional YouTube channel logo for "${channelName}". ${topic}. 
Circular logo design, bold and iconic, clean modern graphic design, 
high contrast, works at small sizes, no text, symbolic imagery only,
professional broadcast quality, Canadian theme where appropriate.
Style: flat design with bold colors, minimal detail, strong silhouette.`;
}

function buildBannerPrompt(channelName,topic){
  return`YouTube channel banner art for "${channelName}". ${topic}.
Wide cinematic banner 2560x1440, professional broadcast design,
bold typography space on left, dramatic imagery on right,
Canadian content creator aesthetic, news/documentary style,
dark background with accent colors, high production value.`;
}

async function downloadImage(url,destPath){
  return new Promise((resolve,reject)=>{
    const lib=url.startsWith('https')?https:require('http');
    const file=fs.createWriteStream(destPath);
    lib.get(url,res=>{
      if(res.statusCode!==200)return reject(new Error('Download failed: '+res.statusCode));
      res.pipe(file);
      file.on('finish',()=>{file.close();resolve(destPath);});
    }).on('error',e=>{fs.unlink(destPath,()=>{});reject(e);});
  });
}

// Generate multiple logo options (returns array of local file paths or data URIs)
async function generateChannelLogos(channelName,topic,settings,outputDir,count=3){
  const prompt=buildLogoPrompt(channelName,topic);
  const results=[];

  // Try DALL-E first (best quality)
  if(settings.apiKeys?.openai){
    try{
      // DALL-E 3 only does n=1 at a time, so call multiple times
      for(let i=0;i<count;i++){
        const urls=await generateWithDallE(prompt,settings.apiKeys.openai);
        if(urls[0]){
          const filename=`logo_${uuid()}.png`;
          const dest=path.join(outputDir,filename);
          await downloadImage(urls[0],dest);
          results.push({path:dest,source:'dalle3'});
        }
      }
    }catch(e){console.error('[ImageGen] DALL-E failed:',e.message);}
  }

  // Try Stability AI as fallback/supplement
  if(results.length<count&&settings.apiKeys?.stability){
    try{
      const images=await generateWithStability(prompt,settings.apiKeys.stability);
      for(const img of images.slice(0,count-results.length)){
        if(img.startsWith('data:')){
          const filename=`logo_${uuid()}.png`;
          const dest=path.join(outputDir,filename);
          const base64=img.replace(/^data:image\/\w+;base64,/,'');
          fs.writeFileSync(dest,Buffer.from(base64,'base64'));
          results.push({path:dest,source:'stability'});
        }
      }
    }catch(e){console.error('[ImageGen] Stability failed:',e.message);}
  }

  // Fallback: generate a simple SVG logo if no AI keys
  if(results.length===0){
    for(let i=0;i<count;i++){
      const svg=generateFallbackSVG(channelName,i);
      const filename=`logo_${uuid()}.svg`;
      const dest=path.join(outputDir,filename);
      fs.writeFileSync(dest,svg);
      results.push({path:dest,source:'fallback',svg:true});
    }
  }

  return results;
}

// Simple SVG fallback logos in different styles
function generateFallbackSVG(channelName,variant=0){
  const initials=channelName.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  const schemes=[
    {bg:'#C8FF00',fg:'#080810',accent:'#FFFFFF'},
    {bg:'#080810',fg:'#C8FF00',accent:'#00C8FF'},
    {bg:'#00C8FF',fg:'#080810',accent:'#C8FF00'},
  ];
  const s=schemes[variant%schemes.length];
  return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="60%">
      <stop offset="0%" stop-color="${s.bg}" stop-opacity="1"/>
      <stop offset="100%" stop-color="${adjustColor(s.bg,-30)}" stop-opacity="1"/>
    </radialGradient>
  </defs>
  <circle cx="400" cy="400" r="400" fill="url(#bg)"/>
  <circle cx="400" cy="400" r="340" fill="none" stroke="${s.accent}" stroke-width="8" opacity="0.3"/>
  <text x="400" y="460" font-family="Arial Black,Arial,sans-serif" font-size="260" font-weight="900"
    fill="${s.fg}" text-anchor="middle" dominant-baseline="middle" letter-spacing="-8">${initials}</text>
  <circle cx="400" cy="400" r="395" fill="none" stroke="${s.accent}" stroke-width="4" opacity="0.15"/>
</svg>`;
}

function adjustColor(hex,amount){
  const num=parseInt(hex.replace('#',''),16);
  const r=Math.max(0,Math.min(255,(num>>16)+amount));
  const g=Math.max(0,Math.min(255,((num>>8)&0xff)+amount));
  const b=Math.max(0,Math.min(255,(num&0xff)+amount));
  return'#'+((r<<16)|(g<<8)|b).toString(16).padStart(6,'0');
}

module.exports={generateChannelLogos,buildLogoPrompt,generateFallbackSVG};
