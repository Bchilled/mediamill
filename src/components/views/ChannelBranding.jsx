import React,{useState,useEffect,useRef}from 'react';
import{useApp}from '../../context/AppContext';

const ASSETS=[
  {
    id:'logo',label:'Profile Picture',icon:'👤',
    desc:'Appears next to your videos and comments on YouTube.',
    spec:'At least 98×98px · PNG or GIF · Max 4MB',
    size:'800x800',aspect:'1:1',shape:'circle',
    promptType:'logo',
  },
  {
    id:'banner',label:'Channel Banner',icon:'🖼',
    desc:'Appears across the top of your channel page on all devices.',
    spec:'At least 2048×1152px · PNG or JPG · Max 6MB',
    size:'2048x1152',aspect:'16:9',shape:'rect',
    promptType:'banner',
  },
  {
    id:'watermark',label:'Video Watermark',icon:'💧',
    desc:'Small logo shown in the corner of every video while it plays.',
    spec:'150×150px · PNG, GIF, BMP or JPG · Max 1MB',
    size:'150x150',aspect:'1:1',shape:'circle',
    promptType:'watermark',
  },
];

function AssetCard({asset,channel,isDark,onGenerate,onUpload,currentImage,generating}){
  const fileRef=useRef();
  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.22)':'rgba(0,0,20,0.3)';
  const accent='#7C6EFA';
  const card=isDark?'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))':'linear-gradient(145deg,#fff,#f8f8ff)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  const cardShadow=isDark?'0 4px 24px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.07)':'0 2px 16px rgba(0,0,0,0.07),inset 0 1px 0 #fff';

  // Preview dimensions
  const previewW=asset.id==='banner'?220:80;
  const previewH=asset.id==='banner'?62:80;
  const previewR=asset.shape==='circle'?'50%':asset.id==='banner'?8:12;

  return(
    <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:18,boxShadow:cardShadow,overflow:'hidden',marginBottom:16}}>
      <div style={{padding:'18px 20px',display:'flex',gap:20,alignItems:'flex-start'}}>

        {/* Preview */}
        <div style={{flexShrink:0}}>
          <div style={{
            width:previewW,height:previewH,borderRadius:previewR,
            background:currentImage?'transparent':(isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)'),
            border:'2px dashed '+(currentImage?accent+'40':isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),
            display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',
            transition:'all 0.2s',
          }}>
            {currentImage?(
              <img src={currentImage.dataUri||currentImage} alt={asset.label}
                style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            ):(
              <span style={{fontSize:asset.id==='banner'?28:22,opacity:0.4}}>{asset.icon}</span>
            )}
          </div>
          {currentImage&&(
            <div style={{fontSize:9,color:accent,textAlign:'center',marginTop:4,fontWeight:600}}>✓ Set</div>
          )}
        </div>

        {/* Info + actions */}
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:14,fontWeight:700,color:text,marginBottom:3}}>{asset.label}</div>
          <div style={{fontSize:11,color:muted,marginBottom:4,lineHeight:1.4}}>{asset.desc}</div>
          <div style={{fontSize:10,color:sub,fontFamily:'monospace',marginBottom:14}}>{asset.spec}</div>

          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button onClick={()=>onGenerate(asset)} disabled={generating===asset.id}
              className="btn btn-primary" style={{fontSize:11,padding:'6px 14px',opacity:generating===asset.id?0.6:1}}>
              {generating===asset.id?'⟳ Generating…':'✨ Generate with AI'}
            </button>
            <button onClick={()=>fileRef.current?.click()}
              className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:11,padding:'6px 12px'}}>
              📁 Upload File
            </button>
            {currentImage&&(
              <button onClick={()=>onGenerate(asset,true)} disabled={generating===asset.id}
                className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:11,padding:'6px 12px',opacity:generating===asset.id?0.5:1}}>
                ↻ New Options
              </button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{display:'none'}}
            onChange={e=>{
              const f=e.target.files[0];
              if(!f)return;
              const reader=new FileReader();
              reader.onload=ev=>onUpload(asset.id,ev.target.result,f.name);
              reader.readAsDataURL(f);
            }}/>
        </div>
      </div>
    </div>
  );
}

function OptionsPicker({options,selected,onSelect,onClose,onMore,loading,isDark,shape}){
  const accent='#7C6EFA';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  return(
    <div style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',backdropFilter:'blur(8px)',
      display:'flex',alignItems:'center',justifyContent:'center',zIndex:9000,padding:24,
    }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{
        background:isDark?'#0C0C0E':'#EEEEFF',
        border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),
        borderRadius:20,padding:28,maxWidth:520,width:'100%',
        boxShadow:'0 32px 80px rgba(0,0,0,0.6)',
      }}>
        <div style={{fontSize:16,fontWeight:800,color:isDark?'#F0EFFF':'#0C0C0E',marginBottom:6}}>Choose an option</div>
        <div style={{fontSize:12,color:muted,marginBottom:20}}>Click one to select, or generate more options</div>
        <div style={{display:'flex',gap:16,justifyContent:'center',flexWrap:'wrap',marginBottom:20}}>
          {options.map((opt,i)=>(
            <div key={i} onClick={()=>onSelect(opt)}
              style={{
                width:120,height:120,borderRadius:shape==='circle'?'50%':14,overflow:'hidden',cursor:'pointer',
                border:'3px solid '+(selected?.path===opt.path?accent:'transparent'),
                boxShadow:selected?.path===opt.path?`0 0 0 2px ${accent}40,0 8px 24px rgba(0,0,0,0.5)`:'0 4px 16px rgba(0,0,0,0.4)',
                transition:'all 0.15s',
              }}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.05)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <img src={opt.dataUri} alt={`Option ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
          ))}
          {loading&&[...Array(3-options.length)].map((_,i)=>(
            <div key={'l'+i} style={{width:120,height:120,borderRadius:shape==='circle'?'50%':14,background:'rgba(255,255,255,0.05)',animation:'pulse 1.2s ease-in-out infinite'}}/>
          ))}
        </div>
        <div style={{display:'flex',gap:10}}>
          <button onClick={onMore} disabled={loading} className="btn btn-primary" style={{flex:1,fontSize:12,padding:'9px',opacity:loading?0.6:1}}>
            {loading?'⟳ Generating…':'↻ Generate 3 More'}
          </button>
          <button onClick={onClose} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'9px 18px',fontSize:12}}>Done</button>
        </div>
      </div>
    </div>
  );
}

export default function ChannelBranding(){
  const{activeChannel,theme,loadChannels}=useApp();
  const isDark=theme==='dark';
  const[images,setImages]=useState({logo:null,banner:null,watermark:null});
  const[generating,setGenerating]=useState(null);
  const[picker,setPicker]=useState(null);// {assetId, options, shape}
  const[saving,setSaving]=useState(false);
  const[saved,setSaved]=useState(false);
  const[pushingYT,setPushingYT]=useState(false);
  const[ytStatus,setYtStatus]=useState(null);
  const[error,setError]=useState('');

  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const accent='#7C6EFA';

  useEffect(()=>{
    if(!activeChannel)return;
    window.forge.youtubeStatus(activeChannel.id).then(setYtStatus).catch(()=>setYtStatus({connected:false}));
    // Load existing saved images
    if(activeChannel.branding){
      try{setImages(JSON.parse(activeChannel.branding));}catch(e){}
    }
  },[activeChannel?.id]);

  async function generate(asset,regenerate=false){
    setGenerating(asset.id);setError('');
    try{
      let options=[];
      if(asset.id==='logo'||asset.id==='watermark'){
        options=await window.forge.generateChannelLogos(activeChannel.name,activeChannel.topic||'');
      } else if(asset.id==='banner'){
        options=await window.forge.generateChannelBanner(activeChannel.name,activeChannel.topic||'');
      }
      if(options.length===0)throw new Error('No images generated — check your API keys in Settings.');
      // Show picker modal
      setPicker({assetId:asset.id,options,shape:asset.shape,currentAsset:asset});
      // Auto-select first if none selected
      if(!images[asset.id])setImages(imgs=>({...imgs,[asset.id]:options[0]}));
    }catch(e){setError(e.message);}
    setGenerating(null);
  }

  async function generateMore(){
    if(!picker)return;
    setGenerating(picker.assetId);
    try{
      let newOptions=[];
      const asset=picker.currentAsset;
      if(asset.id==='logo'||asset.id==='watermark'){
        newOptions=await window.forge.generateChannelLogos(activeChannel.name,activeChannel.topic||'');
      } else {
        newOptions=await window.forge.generateChannelBanner(activeChannel.name,activeChannel.topic||'');
      }
      setPicker(p=>({...p,options:newOptions}));
    }catch(e){setError(e.message);}
    setGenerating(null);
  }

  function handleUpload(assetId,dataUri,filename){
    setImages(imgs=>({...imgs,[assetId]:{dataUri,path:filename,source:'upload'}}));
  }

  function selectFromPicker(opt){
    if(!picker)return;
    setImages(imgs=>({...imgs,[picker.assetId]:opt}));
  }

  async function saveAll(){
    setSaving(true);setError('');
    try{
      await window.forge.updateChannel(activeChannel.id,{branding:JSON.stringify(images)});
      await loadChannels();
      setSaved(true);setTimeout(()=>setSaved(false),2500);
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  async function pushToYouTube(){
    if(!ytStatus?.connected){setError('Connect YouTube in Settings first.');return;}
    setPushingYT(true);setError('');
    try{
      await window.forge.pushBrandingToYouTube(activeChannel.id,images);
      setSaved(true);setTimeout(()=>setSaved(false),3000);
    }catch(e){setError(e.message);}
    setPushingYT(false);
  }

  if(!activeChannel)return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:muted}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:40,marginBottom:12}}>🎨</div><div>Select a channel first</div></div>
    </div>
  );

  const hasAny=Object.values(images).some(Boolean);

  return(
    <div style={{flex:1,overflowY:'auto',padding:28}}>
      <div style={{maxWidth:680,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:24}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:4}}>Channel Branding</h2>
            <div style={{fontSize:12,color:muted}}>{activeChannel.name} · Profile photo, banner, watermark</div>
          </div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            {saved&&<span style={{fontSize:12,fontWeight:600,color:'#30C85E'}}>✓ Saved</span>}
            <button onClick={saveAll} disabled={saving||!hasAny} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:12,opacity:!hasAny?0.4:1}}>
              {saving?'Saving…':'Save'}
            </button>
            <button onClick={pushToYouTube} disabled={pushingYT||!hasAny} className="btn btn-primary" style={{fontSize:12,opacity:!hasAny?0.4:1}}>
              {pushingYT?'⟳ Uploading…':'▶ Push to YouTube'}
            </button>
          </div>
        </div>

        {/* YouTube status */}
        {!ytStatus?.connected&&(
          <div style={{padding:'10px 16px',borderRadius:10,background:'rgba(255,149,0,0.08)',border:'1px solid rgba(255,149,0,0.2)',fontSize:12,color:'#FF9500',marginBottom:20}}>
            ⚠ YouTube not connected — images will save locally but won't push to your channel until you connect in Settings.
          </div>
        )}

        {error&&(
          <div style={{padding:'10px 16px',borderRadius:10,background:'rgba(255,64,64,0.08)',border:'1px solid rgba(255,64,64,0.2)',fontSize:12,color:'#FF4040',marginBottom:20}}>{error}</div>
        )}

        {/* Asset cards */}
        {ASSETS.map(asset=>(
          <AssetCard key={asset.id} asset={asset} channel={activeChannel} isDark={isDark}
            currentImage={images[asset.id]} generating={generating}
            onGenerate={generate} onUpload={handleUpload}/>
        ))}

        {/* Tips */}
        <div style={{padding:'14px 18px',borderRadius:14,background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',border:'1px solid '+(isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)'),marginTop:8}}>
          <div style={{fontSize:11,fontWeight:700,color:muted,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>Tips</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[
              '✨ Add an OpenAI key in Settings to generate higher-quality AI images',
              '📐 Banner safe zone: keep important content in the center 1546×423px area — edges get cropped on mobile',
              '💧 Watermark shows in bottom-right corner of every video — keep it simple and recognizable',
              '🔁 You can regenerate and change images any time — click "Push to YouTube" to update your channel',
            ].map((t,i)=>(
              <div key={i} style={{fontSize:11,color:muted,lineHeight:1.5}}>{t}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Options picker modal */}
      {picker&&(
        <OptionsPicker
          options={picker.options}
          selected={images[picker.assetId]}
          shape={picker.shape}
          loading={generating===picker.assetId}
          isDark={isDark}
          onSelect={selectFromPicker}
          onMore={generateMore}
          onClose={()=>setPicker(null)}/>
      )}
    </div>
  );
}
