import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

function openBrowser(url){try{window.forge.openExternal(url);}catch(e){console.error(e);}}

function Screen({isDark,children,title,subtitle,back,next,nextLabel,nextDisabled,skip,saving}){
  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100%'}}>
      {title&&(<div style={{marginBottom:20,textAlign:'center'}}>
        <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:6}}>{title}</h2>
        {subtitle&&<p style={{fontSize:12,color:muted,lineHeight:1.6,maxWidth:360,margin:'0 auto'}}>{subtitle}</p>}
      </div>)}
      <div style={{flex:1}}>{children}</div>
      <div style={{marginTop:20}}>
        {next&&(<button onClick={next} disabled={nextDisabled||saving} className="btn btn-primary"
          style={{width:'100%',padding:'13px',fontSize:14,fontWeight:700,opacity:nextDisabled||saving?0.4:1,marginBottom:skip||back?8:0}}>
          {saving?'⟳ Saving…':nextLabel||'Continue →'}
        </button>)}
        {skip&&(<button onClick={typeof skip==='function'?skip:undefined}
          style={{width:'100%',padding:'8px',fontSize:12,color:sub,background:'transparent',border:'none',cursor:'pointer'}}>
          {typeof skip==='string'?skip:'Skip for now'}
        </button>)}
        {back&&(<button onClick={back}
          style={{width:'100%',padding:'8px',fontSize:12,color:sub,background:'transparent',border:'none',cursor:'pointer',marginTop:2}}>
          ← Back
        </button>)}
      </div>
    </div>
  );
}

export default function ChannelWizard({onClose,onCreated}){
  const{theme,loadChannels}=useApp();
  const isDark=theme==='dark';
  const[screen,setScreen]=useState('name');
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const[ytConnected,setYtConnected]=useState(false);
  const[ytConnecting,setYtConnecting]=useState(false);
  const[keys,setKeys]=useState({youtube_client_id:'',youtube_client_secret:''});
  const[channel,setChannel]=useState({name:'',topic:'',formats:['long'],voice_engine:'auto',auto_approve:false,logo:null});
  const[logoOptions,setLogoOptions]=useState([]);
  const[generatingLogos,setGeneratingLogos]=useState(false);
  const[topicSuggestions,setTopicSuggestions]=useState([]);

  const setK=(k,v)=>setKeys(ks=>({...ks,[k]:v}));
  const setCh=(k,v)=>setChannel(c=>({...c,[k]:v}));
  const go=(s)=>{setError('');setScreen(s);};

  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  const accent='#7C6EFA';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';

  // Progress
  const STEPS=['name','topic','format','youtube','logo'];
  const stepIdx=STEPS.indexOf(screen);
  const progress=stepIdx>=0?Math.round(((stepIdx+1)/STEPS.length)*100):100;

  useEffect(()=>{
    if(screen==='logo'&&logoOptions.length===0)generateLogos();
  },[screen]);

  useEffect(()=>{
    if(!channel.topic||channel.topic.length<8)return;
    const timer=setTimeout(()=>{
      const t=channel.topic.toLowerCase();
      const sugg=[];
      if(t.includes('news')||t.includes('canada')){
        sugg.push('Breaking Canadian federal politics and Parliament Hill coverage');
        sugg.push('Unbiased Canadian news — no spin, just facts');
      }
      if(t.includes('history')||t.includes('war')){
        sugg.push('Untold stories of Canadian heroes in World War II');
        sugg.push('Canadian history from Indigenous peoples to Confederation');
      }
      if(t.includes('crime')){
        sugg.push('Unsolved Canadian cold cases and true crime investigations');
      }
      if(t.includes('econom')||t.includes('financ')){
        sugg.push('Canadian economy — housing, inflation, Bank of Canada decisions');
      }
      if(sugg.length===0)sugg.push(`${channel.name||'Channel'} — in-depth Canadian stories with verified facts`);
      setTopicSuggestions(sugg.slice(0,3));
    },500);
    return()=>clearTimeout(timer);
  },[channel.topic]);

  async function generateLogos(){
    if(!channel.name)return;
    setGeneratingLogos(true);
    try{
      const opts=await window.forge.generateChannelLogos(channel.name,channel.topic||'');
      setLogoOptions(opts);
      if(opts.length>0&&!channel.logo)setCh('logo',opts[0]);
    }catch(e){}
    setGeneratingLogos(false);
  }

  async function connectYouTube(){
    setYtConnecting(true);setError('');
    try{
      await window.forge.updateSettings({apiKeys:{youtube_client_id:keys.youtube_client_id,youtube_client_secret:keys.youtube_client_secret}});
      await window.forge.youtubeConnect('__setup__');
      setYtConnected(true);
    }catch(e){
      const msg=e.message||'';
      if(msg.includes('access_denied')||msg.includes('403')){
        setError('Access denied — add your Gmail as a Test User in Google Cloud → APIs → OAuth consent screen → Test users.');
      } else if(msg.includes('timeout')){
        setError('Timed out — make sure to click Allow in the browser window that opened.');
      } else {setError(msg);}
    }
    setYtConnecting(false);
  }

  async function createChannel(){
    setSaving(true);setError('');
    try{
      if(!channel.name.trim())throw new Error('Channel name is required');
      if(!channel.topic.trim())throw new Error('Topic is required');
      await window.forge.createChannel({
        name:channel.name,
        topic:channel.topic,
        style_prompt:channel.topic,
        preset:channel.formats.includes('long')?'long':channel.formats.includes('mid')?'mid':'short',
        formats:JSON.stringify(channel.formats),
        voice_engine:channel.voice_engine,
        auto_approve:channel.auto_approve,
        logo_path:channel.logo?.path||null,
      });
      await loadChannels();
      onCreated?.();
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  const screens={
    name:()=>(
      <Screen isDark={isDark} title="Channel Name" subtitle="The name that appears on YouTube. You can change this anytime."
        next={channel.name.trim()?()=>go('topic'):null} nextLabel="Continue →"
        skip={onClose}>
        <input value={channel.name} onChange={e=>setCh('name',e.target.value)} autoFocus
          placeholder="e.g. Canada News Today"
          style={{width:'100%',padding:'14px 16px',borderRadius:12,fontSize:16,fontWeight:500,boxSizing:'border-box',
            background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
            border:'2px solid '+(channel.name?accent+'40':cardBorder),
            color:text,outline:'none',transition:'border-color 0.2s'}}
          onKeyDown={e=>e.key==='Enter'&&channel.name.trim()&&go('topic')}/>
        <div style={{fontSize:11,color:sub,marginTop:8}}>This is just for your reference if you're not connecting YouTube yet.</div>
      </Screen>
    ),

    topic:()=>(
      <Screen isDark={isDark} title="What's it about?" subtitle="Be specific — the AI uses this to find stories and write scripts."
        back={()=>go('name')}
        next={channel.topic.trim()?()=>go('format'):null} nextLabel="Continue →">
        <textarea value={channel.topic} onChange={e=>setCh('topic',e.target.value)} rows={3}
          placeholder="e.g. Unbiased Canadian political news — Parliament Hill, federal policy, provincial elections"
          autoFocus
          style={{width:'100%',padding:'13px 14px',borderRadius:12,fontSize:13,boxSizing:'border-box',resize:'none',
            background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
            border:'2px solid '+(channel.topic?accent+'40':cardBorder),
            color:text,outline:'none',lineHeight:1.5,transition:'border-color 0.2s'}}/>
        {(topicSuggestions.length>0)&&(
          <div style={{marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:sub,marginBottom:5}}>Suggestions:</div>
            <div style={{display:'flex',flexDirection:'column',gap:4}}>
              {topicSuggestions.map((s,i)=>(
                <button key={i} onClick={()=>setCh('topic',s)}
                  style={{textAlign:'left',padding:'8px 11px',borderRadius:8,border:'1px solid '+cardBorder,background:card,
                    color:muted,fontSize:11,cursor:'pointer',lineHeight:1.4}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accent+'50';e.currentTarget.style.color=text;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=cardBorder;e.currentTarget.style.color=muted;}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {!channel.topic&&(
          <div style={{display:'flex',flexWrap:'wrap',gap:5,marginTop:8}}>
            {['Canadian political news','Canadian WWII history','True crime from Canada','Canadian economic news'].map(ex=>(
              <button key={ex} onClick={()=>setCh('topic',ex)}
                style={{fontSize:10,padding:'4px 10px',borderRadius:8,border:'1px solid '+cardBorder,background:card,color:muted,cursor:'pointer'}}
                onMouseEnter={e=>e.currentTarget.style.color=accent}
                onMouseLeave={e=>e.currentTarget.style.color=muted}>
                {ex}
              </button>
            ))}
          </div>
        )}
      </Screen>
    ),

    format:()=>(
      <Screen isDark={isDark} title="Video Formats" subtitle="MediaMill creates all selected formats from the same content automatically."
        back={()=>go('topic')}
        next={channel.formats.length>0?()=>go('youtube'):null} nextLabel="Continue →">
        <div style={{display:'flex',flexDirection:'column',gap:9,marginBottom:10}}>
          {[
            {id:'short',icon:'⚡',label:'Shorts',desc:'Under 60s — high traffic, clips and highlights',color:'#7C6EFA'},
            {id:'mid',  icon:'📰',label:'Mid-Form',desc:'5–20 min — news summaries, explainers',color:'#00C8FF'},
            {id:'long', icon:'🎬',label:'Long-Form',desc:'20–90 min — deep dives, documentaries',color:'#FF8040'},
          ].map(f=>{
            const sel=channel.formats.includes(f.id);
            return(
              <div key={f.id} onClick={()=>setCh('formats',sel?channel.formats.filter(x=>x!==f.id):[...channel.formats,f.id])}
                style={{padding:'12px 14px',borderRadius:12,border:'2px solid '+(sel?f.color+'50':cardBorder),
                  background:sel?f.color+'07':card,cursor:'pointer',transition:'all 0.15s',display:'flex',gap:12,alignItems:'center'}}>
                <div style={{width:32,height:32,borderRadius:9,background:f.color+(sel?'20':'10'),
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
                  {f.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:7,alignItems:'center',marginBottom:2}}>
                    <span style={{fontSize:13,fontWeight:800,color:sel?f.color:text}}>{f.label}</span>
                    {sel&&<span style={{fontSize:10,color:f.color}}>✓</span>}
                  </div>
                  <div style={{fontSize:11,color:muted}}>{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Screen>
    ),

    youtube:()=>(
      <Screen isDark={isDark} title="Connect YouTube?" subtitle="Lets MediaMill upload directly to this channel. You can do this later in Settings."
        back={()=>go('format')}
        skip={()=>go('logo')}>
        {ytConnected?(
          <div style={{textAlign:'center',padding:'24px 0'}}>
            <div style={{fontSize:56,marginBottom:10}}>✅</div>
            <div style={{fontSize:16,fontWeight:800,color:'#30C85E',marginBottom:6}}>YouTube Connected!</div>
            <div style={{fontSize:12,color:muted,marginBottom:16}}>MediaMill can now upload to this channel.</div>
            <button onClick={()=>go('logo')} className="btn btn-primary" style={{fontSize:13,padding:'11px 28px'}}>Continue →</button>
          </div>
        ):(
          <div>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
              <div style={{background:'rgba(255,149,0,0.06)',border:'1px solid rgba(255,149,0,0.2)',borderRadius:9,padding:'9px 12px',fontSize:11,color:'#FF9500',lineHeight:1.5}}>
                ⚠ Before connecting: Go to Google Cloud → OAuth consent screen → Test users → add your Gmail address.
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:5,fontSize:11,color:muted}}>
                <div style={{fontWeight:700,color:text,marginBottom:3}}>You'll need:</div>
                <div>1. A Google Cloud project with YouTube Data API v3 enabled</div>
                <div>2. OAuth 2.0 Client ID + Client Secret (Desktop app type)</div>
              </div>
            </div>
            <div style={{marginBottom:8}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:muted,marginBottom:5}}>OAuth Client ID</div>
              <input value={keys.youtube_client_id||''} onChange={e=>setK('youtube_client_id',e.target.value)}
                placeholder="xxxxxxxxxx.apps.googleusercontent.com"
                style={{width:'100%',padding:'10px 12px',borderRadius:9,fontFamily:'monospace',fontSize:11,boxSizing:'border-box',
                  background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
                  border:'1px solid '+cardBorder,color:text,outline:'none'}}/>
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',color:muted,marginBottom:5}}>OAuth Client Secret</div>
              <input value={keys.youtube_client_secret||''} onChange={e=>setK('youtube_client_secret',e.target.value)}
                placeholder="GOCSPX-..."
                style={{width:'100%',padding:'10px 12px',borderRadius:9,fontFamily:'monospace',fontSize:11,boxSizing:'border-box',
                  background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
                  border:'1px solid '+cardBorder,color:text,outline:'none'}}/>
            </div>
            {error&&<div style={{fontSize:11,color:'#FF4040',marginBottom:10,lineHeight:1.5}}>{error}</div>}
            <button onClick={connectYouTube} disabled={ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret}
              className="btn btn-primary"
              style={{width:'100%',padding:'12px',fontSize:13,opacity:ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret?0.5:1}}>
              {ytConnecting?'⟳ Waiting for browser…':'🔗 Authorize in Browser'}
            </button>
          </div>
        )}
      </Screen>
    ),

    logo:()=>(
      <Screen isDark={isDark} title="Pick a Logo" subtitle="Used as your YouTube profile photo."
        back={()=>go('youtube')}
        next={()=>createChannel()} nextLabel="Create Channel →"
        saving={saving}
        skip={()=>createChannel()}>
        {error&&<div style={{padding:'9px 12px',borderRadius:9,background:'rgba(255,64,64,0.08)',border:'1px solid rgba(255,64,64,0.2)',color:'#FF4040',fontSize:12,marginBottom:10}}>{error}</div>}
        <div style={{display:'flex',justifyContent:'center',gap:14,marginBottom:14,flexWrap:'wrap'}}>
          {generatingLogos&&[0,1,2].map(i=>(
            <div key={i} style={{width:88,height:88,borderRadius:'50%',background:card}}/>
          ))}
          {logoOptions.map((logo,i)=>(
            <div key={i} onClick={()=>setCh('logo',logo)}
              style={{width:88,height:88,borderRadius:'50%',overflow:'hidden',cursor:'pointer',
                border:'3px solid '+(channel.logo?.path===logo.path?accent:'transparent'),
                boxShadow:channel.logo?.path===logo.path?`0 0 0 3px ${accent}30`:'none',
                transition:'all 0.15s'}}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <img src={logo.dataUri} alt={`Logo ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
          ))}
        </div>
        {logoOptions.length>0&&(
          <div style={{textAlign:'center',marginBottom:10}}>
            <button onClick={generateLogos} disabled={generatingLogos}
              style={{fontSize:11,padding:'6px 14px',borderRadius:8,background:card,border:'1px solid '+cardBorder,color:muted,cursor:'pointer',opacity:generatingLogos?0.5:1}}>
              {generatingLogos?'⟳ Generating…':'↻ Generate 3 More'}
            </button>
          </div>
        )}
        <div style={{fontSize:11,color:sub,textAlign:'center'}}>You can change this anytime in Channel → Branding</div>
      </Screen>
    ),
  };

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:24,backdropFilter:'blur(4px)'}}>
      <div style={{width:'100%',maxWidth:440,background:isDark?'rgba(12,12,22,0.98)':'rgba(255,255,255,0.98)',
        border:'1px solid '+(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'),
        borderRadius:20,padding:28,boxShadow:'0 24px 60px rgba(0,0,0,0.55)',maxHeight:'88vh',display:'flex',flexDirection:'column'}}>
        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div style={{fontSize:15,fontWeight:900,color:text}}>📺 New Channel</div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:muted,cursor:'pointer',fontSize:18}}>✕</button>
        </div>
        {/* Progress */}
        <div style={{height:3,background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)',borderRadius:99,marginBottom:20,overflow:'hidden'}}>
          <div style={{height:'100%',width:progress+'%',background:accent,borderRadius:99,transition:'width 0.3s'}}/>
        </div>
        {/* Steps indicator */}
        <div style={{display:'flex',gap:4,marginBottom:18}}>
          {STEPS.map((s,i)=>(
            <div key={s} style={{flex:1,height:3,borderRadius:99,background:i<=stepIdx?accent:cardBorder,transition:'background 0.3s'}}/>
          ))}
        </div>
        <div style={{overflowY:'auto',flex:1}}>
          {screens[screen]?.()}
        </div>
      </div>
    </div>
  );
}
