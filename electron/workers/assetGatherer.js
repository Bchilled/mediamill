const https=require('https');
const http=require('http');
const fs=require('fs');
const path=require('path');
const{v4:uuid}=require('uuid');

function fetch(url,opts={}){
  return new Promise((resolve,reject)=>{
    try{
      const lib=url.startsWith('https')?https:http;
      const req=lib.get(url,{headers:{'User-Agent':'MediaMill/1.0 (Canadian Content Platform)',...(opts.headers||{})},timeout:15000},res=>{
        if(res.statusCode>=300&&res.statusCode<400&&res.headers.location)return fetch(res.headers.location,opts).then(resolve).catch(reject);
        let data=[];
        res.on('data',c=>data.push(c));
        res.on('end',()=>resolve({status:res.statusCode,body:Buffer.concat(data),headers:res.headers}));
      });
      req.on('error',reject);req.on('timeout',()=>{req.destroy();reject(new Error('Timeout'));});
    }catch(e){reject(e);}
  });
}

async function downloadFile(url,dest){
  const r=await fetch(url);
  if(r.status!==200)throw new Error('Download failed: '+r.status);
  fs.writeFileSync(dest,r.body);
  return dest;
}

async function searchPexelsVideo(query,apiKey,perPage=3){
  try{
    const r=await fetch(`https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,{headers:{Authorization:apiKey}});
    const d=JSON.parse(r.body.toString());
    return(d.videos||[]).map(v=>({
      id:v.id,type:'video',source:'pexels',
      url:v.video_files?.find(f=>f.quality==='hd'||f.quality==='sd')?.link||v.video_files?.[0]?.link,
      thumb:v.image,duration:v.duration,query,
      credit:`Pexels / ${v.user?.name||'Unknown'}`,
    })).filter(v=>v.url);
  }catch(e){return[];}
}

async function searchPexelsPhoto(query,apiKey,perPage=3){
  try{
    const r=await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape`,{headers:{Authorization:apiKey}});
    const d=JSON.parse(r.body.toString());
    return(d.photos||[]).map(p=>({
      id:p.id,type:'image',source:'pexels',
      url:p.src?.large||p.src?.original,
      thumb:p.src?.small,query,
      credit:`Pexels / ${p.photographer||'Unknown'}`,
    })).filter(p=>p.url);
  }catch(e){return[];}
}

async function searchPixabay(query,apiKey,perPage=3){
  try{
    const r=await fetch(`https://pixabay.com/api/videos/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${perPage}&video_type=film`);
    const d=JSON.parse(r.body.toString());
    return(d.hits||[]).map(v=>({
      id:v.id,type:'video',source:'pixabay',
      url:v.videos?.medium?.url||v.videos?.small?.url,
      thumb:v.userImageURL,duration:v.duration,query,
      credit:`Pixabay / ${v.user||'Unknown'}`,
    })).filter(v=>v.url);
  }catch(e){return[];}
}

async function searchWikimediaCommons(query,limit=3){
  try{
    const r=await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${encodeURIComponent(query+' Canada')}&gsrnamespace=6&gsrlimit=${limit}&prop=imageinfo&iiprop=url|mime|size|extmetadata&format=json`);
    const d=JSON.parse(r.body.toString());
    const pages=Object.values(d.query?.pages||{});
    return pages.filter(p=>p.imageinfo?.[0]?.url).map(p=>{
      const info=p.imageinfo[0];
      const isVideo=info.mime?.startsWith('video');
      return{
        id:p.pageid,type:isVideo?'video':'image',source:'wikimedia',
        url:info.url,thumb:info.thumburl||info.url,query,
        credit:'Wikimedia Commons / '+(info.extmetadata?.Artist?.value||'Unknown'),
        license:info.extmetadata?.LicenseShortName?.value||'CC',
      };
    });
  }catch(e){return[];}
}

async function gatherAssetsForScript(script,settings,assetsDir){
  const brollCues=[];
  for(const seg of(script.script||[])){
    for(const b of(seg.broll||[])){
      brollCues.push({...b,segId:seg.id});
    }
  }

  const results=[];
  for(const cue of brollCues.slice(0,20)){// limit to 20 assets
    const candidates=[];
    // Try all sources in parallel
    const searches=await Promise.all([
      settings.apiKeys?.pexels?searchPexelsVideo(cue.query,settings.apiKeys.pexels):Promise.resolve([]),
      settings.apiKeys?.pexels?searchPexelsPhoto(cue.query,settings.apiKeys.pexels):Promise.resolve([]),
      settings.apiKeys?.pixabay?searchPixabay(cue.query,settings.apiKeys.pixabay):Promise.resolve([]),
      searchWikimediaCommons(cue.query),
    ]);
    candidates.push(...searches.flat());

    if(candidates.length>0){
      const best=candidates[0];
      // Download the asset
      try{
        const ext=best.type==='video'?'.mp4':'.jpg';
        const filename=uuid()+ext;
        const dest=path.join(assetsDir,filename);
        await downloadFile(best.url,dest);
        results.push({...best,localPath:dest,cue,segId:cue.segId});
      }catch(e){
        results.push({...best,localPath:null,cue,segId:cue.segId,downloadError:e.message});
      }
    }else{
      results.push({type:'missing',query:cue.query,segId:cue.segId});
    }
  }
  return results;
}

module.exports={gatherAssetsForScript,searchPexelsVideo,searchPexelsPhoto,searchPixabay,searchWikimediaCommons};
