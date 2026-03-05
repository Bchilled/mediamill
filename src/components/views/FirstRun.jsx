import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

// One question per screen — iPhone-style setup
const SCREENS=[
  'welcome',
  'need_ai',        // Do you have an AI key?
  'add_claude',     // Paste Claude key
  'add_gemini',     // Paste Gemini key  
  'media_intro',    // Media sources explainer
  'youtube_intro',  // YouTube — do you want to connect?
  'youtube_setup',  // YouTube credentials
  'youtube_auth',   // Authorize
  'channel_name',   // What's your channel name?
  'channel_topic',  // What's it about?
  'channel_format', // What formats? (multi-select)
  'channel_logo',   // Pick a logo
  'done',
];

function openBrowser(url){
  try{window.forge.openExternal(url);}catch(e){console.error(e);}
}

function Screen({isDark,children,title,subtitle,back,next,nextLabel,nextDisabled,skip,saving}){
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  const accent=isDark?'#C8FF00':'#4400CC';
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100%'}}>
      {/* Title */}
      {title&&(
        <div style={{marginBottom:28,textAlign:'center'}}>
          <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8,letterSpacing:'-0.01em'}}>{title}</h2>
          {subtitle&&<p style={{fontSize:13,color:muted,lineHeight:1.6,maxWidth:380,margin:'0 auto'}}>{subtitle}</p>}
        </div>
      )}
      {/* Content */}
      <div style={{flex:1}}>{children}</div>
      {/* Nav */}
      <div style={{marginTop:24}}>
        {next&&(
          <button onClick={next} disabled={nextDisabled||saving}
            className="btn btn-primary"
            style={{width:'100%',padding:'13px',fontSize:14,fontWeight:700,letterSpacing:'0.01em',
              opacity:nextDisabled||saving?0.4:1,marginBottom:skip?8:0}}>
            {saving?'⟳ Saving…':nextLabel||'Continue →'}
          </button>
        )}
        {skip&&(
          <button onClick={skip}
            style={{width:'100%',padding:'9px',fontSize:12,color:sub,background:'transparent',border:'none',cursor:'pointer',textDecoration:'none'}}>
            {typeof skip==='string'?skip:'Skip for now'}
          </button>
        )}
        {back&&(
          <button onClick={back}
            style={{width:'100%',padding:'8px',fontSize:12,color:sub,background:'transparent',border:'none',cursor:'pointer',marginTop:4}}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

function KeyInput({isDark,placeholder,value,onChange,onTest,testResult,testing,hint}){
  const[show,setShow]=useState(false);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const ok=testResult==='ok';const fail=testResult==='fail';
  return(
    <div>
      {hint&&<div style={{fontSize:12,color:muted,marginBottom:10,lineHeight:1.5,fontStyle:'italic'}}>{hint}</div>}
      <div style={{display:'flex',gap:8,marginBottom:6}}>
        <input type={show?'text':'password'} value={value||''} onChange={e=>onChange(e.target.value)}
          placeholder={placeholder}
          style={{flex:1,padding:'11px 13px',borderRadius:10,fontFamily:'monospace',fontSize:12,
            background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
            border:'2px solid '+(ok?'#00E676':fail?'#EE2244':isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),
            color:text,outline:'none',transition:'border-color 0.2s'}}/>
        <button onClick={()=>setShow(s=>!s)}
          style={{padding:'11px 13px',borderRadius:10,background:'transparent',border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:muted,cursor:'pointer',fontSize:11,flexShrink:0}}>
          {show?'Hide':'Show'}
        </button>
        {onTest&&(
          <button onClick={onTest} disabled={testing||!value}
            style={{padding:'11px 14px',borderRadius:10,background:accent+'15',border:'1px solid '+accent+'30',
              color:accent,cursor:'pointer',fontSize:11,fontWeight:700,flexShrink:0,opacity:testing||!value?0.4:1}}>
            {testing?'⟳':'Test'}
          </button>
        )}
      </div>
      {ok&&<div style={{fontSize:12,fontWeight:700,color:'#00E676'}}>✓ Key verified and working</div>}
      {fail&&<div style={{fontSize:12,fontWeight:700,color:'#EE2244'}}>✗ Key not working — check and try again</div>}
    </div>
  );
}

function Steps({isDark,items}){
  const muted=isDark?'rgba(255,255,255,0.55)':'rgba(0,0,20,0.6)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const bg=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  return(
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:16}}>
      {items.map((item,i)=>{
        const t=typeof item==='string'?{text:item}:item;
        return(
          <div key={i} style={{display:'flex',gap:10,padding:'9px 11px',background:bg,borderRadius:9,alignItems:'flex-start'}}>
            <div style={{width:20,height:20,borderRadius:'50%',background:accent+'15',border:'1px solid '+accent+'25',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:accent,flexShrink:0,marginTop:1}}>
              {i+1}
            </div>
            <div style={{fontSize:12,color:muted,lineHeight:1.5,flex:1}}>
              {t.text}
              {t.highlight&&<strong style={{color:isDark?'#E8E6FF':'#111122',background:accent+'20',padding:'0 5px',borderRadius:4,margin:'0 3px'}}>{t.highlight}</strong>}
              {t.url&&<button onClick={()=>openBrowser(t.url)} style={{color:accent,background:'none',border:'none',cursor:'pointer',fontSize:12,padding:'0 3px',textDecoration:'underline'}}>open ↗</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function FirstRun({onComplete}){
  const{theme,loadChannels}=useApp();
  const isDark=theme==='dark';
  const[screen,setScreen]=useState('welcome');
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const[testing,setTesting]=useState({});
  const[testResults,setTestResults]=useState({});
  const[ytConnected,setYtConnected]=useState(false);
  const[ytConnecting,setYtConnecting]=useState(false);

  const[keys,setKeys]=useState({claude:'',gemini:'',pexels:'',pixabay:'',elevenlabs:'',youtube_client_id:'',youtube_client_secret:''});
  const[channel,setChannel]=useState({name:'',topic:'',formats:['long'],voice_engine:'auto',auto_approve:false,logo:null});
  const[logoOptions,setLogoOptions]=useState([]);
  const[generatingLogos,setGeneratingLogos]=useState(false);
  const[topicSuggestions,setTopicSuggestions]=useState([]);

  const setK=(k,v)=>setKeys(ks=>({...ks,[k]:v}));
  const setCh=(k,v)=>setChannel(c=>({...c,[k]:v}));

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';

  const go=(s)=>{setError('');setScreen(s);};

  async function testKey(service,key){
    if(!key)return;
    setTesting(t=>({...t,[service]:true}));
    try{
      const r=await window.forge.testApiKey(service,key);
      setTestResults(t=>({...t,[service]:r.ok?'ok':'fail'}));
    }catch(e){setTestResults(t=>({...t,[service]:'fail'}));}
    setTesting(t=>({...t,[service]:false}));
  }

  async function saveKeysAndGo(next){
    setSaving(true);setError('');
    try{
      const clean={};Object.entries(keys).forEach(([k,v])=>{if(v?.trim())clean[k]=v.trim();});
      await window.forge.updateSettings({apiKeys:clean});
      go(next);
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  async function connectYouTube(){
    setYtConnecting(true);setError('');
    try{
      await window.forge.updateSettings({apiKeys:{youtube_client_id:keys.youtube_client_id,youtube_client_secret:keys.youtube_client_secret}});
      await window.forge.youtubeConnect('__setup__');
      setYtConnected(true);
    }catch(e){
      // If timeout or access_denied, show helpful message
      const msg=e.message||'';
      if(msg.includes('access_denied')||msg.includes('403')){
        setError('Access denied — you need to add your Google account as a Test User. Go to Google Cloud → APIs & Services → OAuth consent screen → Test users → Add your Gmail.');
      } else if(msg.includes('timeout')){
        setError('Timed out waiting for authorization. Try again — make sure to click Allow in the browser window.');
      } else {
        setError(msg);
      }
    }
    setYtConnecting(false);
  }

  async function generateLogos(){
    if(!channel.name)return;
    setGeneratingLogos(true);
    try{
      const opts=await window.forge.generateChannelLogos(channel.name,channel.topic||'');
      setLogoOptions(opts);
      if(opts.length>0&&!channel.logo)setCh('logo',opts[0]);
    }catch(e){console.error(e);}
    setGeneratingLogos(false);
  }

  // Generate logo when entering logo screen
  useEffect(()=>{
    if(screen==='channel_logo'&&logoOptions.length===0)generateLogos();
  },[screen]);

  // Generate topic suggestions when topic changes
  useEffect(()=>{
    if(!channel.topic||channel.topic.length<8)return;
    const timer=setTimeout(async()=>{
      try{
        const base=channel.topic.toLowerCase();
        const name=(channel.name||'').toLowerCase();
        // Build contextual suggestions based on what they typed
        const suggestions=buildSuggestions(channel.name,channel.topic);
        setTopicSuggestions(suggestions);
      }catch(e){}
    },600);
    return()=>clearTimeout(timer);
  },[channel.topic,channel.name]);

  function buildSuggestions(name,topic){
    const t=topic.toLowerCase();
    const suggestions=[];
    if(t.includes('news')||t.includes('canada')||t.includes('canadian')){
      suggestions.push('Breaking Canadian federal politics and Parliament Hill coverage');
      suggestions.push('Canadian provincial news and policy decisions');
      suggestions.push('Unbiased Canadian news analysis — no spin, just facts');
    }
    if(t.includes('history')||t.includes('war')||t.includes('wwii')){
      suggestions.push('Canadian military history from WWI through modern peacekeeping');
      suggestions.push('Untold stories of Canadian heroes in World War II');
      suggestions.push('Canadian history — from Indigenous peoples to Confederation');
    }
    if(t.includes('crime')||t.includes('true crime')){
      suggestions.push('Unsolved Canadian cold cases and true crime investigations');
      suggestions.push('Canada\'s most notorious crimes and the stories behind them');
    }
    if(t.includes('econom')||t.includes('financ')||t.includes('money')){
      suggestions.push('Canadian economy — housing crisis, inflation, Bank of Canada decisions');
      suggestions.push('How government spending affects everyday Canadians');
    }
    if(suggestions.length===0){
      suggestions.push(`${name||'Channel'} — in-depth Canadian stories with verified facts`);
      suggestions.push(`${name||'Channel'} — unbiased reporting on what matters to Canadians`);
    }
    return suggestions.slice(0,3);
  }

  async function createChannel(){
    setSaving(true);setError('');
    try{
      if(!channel.name.trim())throw new Error('Channel name is required.');
      if(!channel.topic.trim())throw new Error('Topic is required.');
      // Save all keys first
      const clean={};Object.entries(keys).forEach(([k,v])=>{if(v?.trim())clean[k]=v.trim();});
      if(Object.keys(clean).length>0)await window.forge.updateSettings({apiKeys:clean});
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
      go('done');
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  // ── SCREEN RENDERS ────────────────────────────────────────────────

  const screens={

    welcome:()=>(
      <Screen isDark={isDark} next={()=>go('need_ai')} nextLabel="Get Started →">
        <div style={{textAlign:'center',padding:'24px 0 8px'}}>
          <div style={{fontSize:72,marginBottom:20}}>🎬</div>
          <h1 style={{fontSize:28,fontWeight:900,color:text,marginBottom:12,letterSpacing:'-0.02em'}}>Welcome to MediaMill</h1>
          <p style={{fontSize:14,color:muted,lineHeight:1.7,maxWidth:340,margin:'0 auto 12px'}}>
            Turns Canadian news into published YouTube videos — automatically.
          </p>
          <p style={{fontSize:11,color:sub,maxWidth:300,margin:'0 auto'}}>
            We'll set up your AI, media sources, and YouTube connection. Most steps take 30 seconds. Everything can be changed later.
          </p>
        </div>
      </Screen>
    ),

    need_ai:()=>(
      <Screen isDark={isDark} title="First — connect an AI" subtitle="MediaMill needs AI to write scripts and find content. Claude is best. Gemini is free."
        back={()=>go('welcome')}>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {[
            {id:'claude',label:'Claude',sub:'Anthropic · Best quality · ~$0.01/script',badge:'Recommended',color:'#C8FF00',url:'https://console.anthropic.com'},
            {id:'gemini',label:'Gemini',sub:'Google · Free tier available · Good fallback',badge:'Free tier',color:'#00C8FF',url:'https://aistudio.google.com/app/apikey'},
          ].map(p=>(
            <div key={p.id} onClick={()=>go('add_'+p.id)}
              style={{padding:'16px 18px',borderRadius:14,border:'2px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),
                cursor:'pointer',background:card,transition:'all 0.15s',display:'flex',alignItems:'center',gap:14}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color+'60';e.currentTarget.style.background=p.color+'08';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';e.currentTarget.style.background=card;}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
                  <span style={{fontSize:14,fontWeight:800,color:text}}>{p.label}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:'1px 7px',borderRadius:99,background:p.color+'18',color:p.color,border:'1px solid '+p.color+'30'}}>{p.badge}</span>
                  {testResults[p.id]==='ok'&&<span style={{fontSize:10,fontWeight:700,color:'#00E676'}}>✓ Connected</span>}
                </div>
                <div style={{fontSize:11,color:muted}}>{p.sub}</div>
              </div>
              <span style={{fontSize:18,color:muted}}>→</span>
            </div>
          ))}
          <div style={{textAlign:'center',paddingTop:4}}>
            <div style={{fontSize:11,color:sub,marginBottom:8}}>You only need one. You can add both later.</div>
            {(testResults.claude==='ok'||testResults.gemini==='ok')&&(
              <button onClick={()=>saveKeysAndGo('media_intro')} className="btn btn-primary" style={{fontSize:12,padding:'10px 28px'}}>
                Continue with connected AI →
              </button>
            )}
          </div>
        </div>
      </Screen>
    ),

    add_claude:()=>(
      <Screen isDark={isDark} title="Connect Claude" subtitle="Anthropic's API — best quality for writing scripts and SEO."
        back={()=>go('need_ai')}
        next={testResults.claude==='ok'?()=>saveKeysAndGo('need_ai'):null}
        nextLabel="Save & Continue →"
        skip={()=>go('need_ai')}>
        <Steps isDark={isDark} items={[
          {text:'Open Anthropic Console',url:'https://console.anthropic.com'},
          {text:'Left sidebar →',highlight:'API Keys'},
          {text:'Click — name it MediaMill',highlight:'+ Create Key'},
          'Copy the key (starts with sk-ant-)',
          'Paste below and click Test',
        ]}/>
        <KeyInput isDark={isDark} placeholder="sk-ant-api03-..." value={keys.claude} onChange={v=>setK('claude',v)}
          onTest={()=>testKey('claude',keys.claude)} testResult={testResults.claude} testing={testing.claude}/>
        {testResults.claude==='ok'&&(
          <button onClick={()=>saveKeysAndGo('need_ai')} className="btn btn-primary" style={{width:'100%',padding:'12px',marginTop:12,fontSize:13}}>
            ✓ Claude connected — Continue →
          </button>
        )}
      </Screen>
    ),

    add_gemini:()=>(
      <Screen isDark={isDark} title="Connect Gemini" subtitle="Google's free AI — good for research and as a fallback."
        back={()=>go('need_ai')}
        skip={()=>go('need_ai')}>
        <Steps isDark={isDark} items={[
          {text:'Open Google AI Studio',url:'https://aistudio.google.com/app/apikey'},
          {text:'Click',highlight:'+ Create API key'},
          'In the dropdown, choose any existing project',
          'Copy the key (starts with AIzaSy)',
          'Paste below and click Test',
        ]}/>
        <KeyInput isDark={isDark} placeholder="AIzaSy..." value={keys.gemini} onChange={v=>setK('gemini',v)}
          onTest={()=>testKey('gemini',keys.gemini)} testResult={testResults.gemini} testing={testing.gemini}/>
        {testResults.gemini==='ok'&&(
          <button onClick={()=>saveKeysAndGo('need_ai')} className="btn btn-primary" style={{width:'100%',padding:'12px',marginTop:12,fontSize:13}}>
            ✓ Gemini connected — Continue →
          </button>
        )}
      </Screen>
    ),

    media_intro:()=>(
      <Screen isDark={isDark} title="Media Sources" subtitle="These provide video clips for your videos. All optional — free sources are always used."
        back={()=>go('need_ai')}
        next={()=>go('youtube_intro')} nextLabel="Continue →"
        skip={()=>go('youtube_intro')}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:'rgba(0,230,118,0.07)',border:'1px solid rgba(0,230,118,0.2)',borderRadius:12,padding:'12px 14px'}}>
            <div style={{fontSize:11,fontWeight:700,color:'#00E676',marginBottom:8}}>✓ Always Free — Already Included</div>
            {[
              {icon:'📖',name:'Wikimedia Commons',desc:'Photos, maps, historical images'},
              {icon:'🗄',name:'Internet Archive',desc:'Historical footage, public domain video'},
              {icon:'🎙',name:'Windows TTS',desc:'Free built-in voice narration'},
            ].map(s=>(
              <div key={s.name} style={{display:'flex',gap:9,alignItems:'center',marginBottom:6,fontSize:12}}>
                <span style={{fontSize:16}}>{s.icon}</span>
                <span style={{fontWeight:600,color:text}}>{s.name}</span>
                <span style={{color:muted}}>— {s.desc}</span>
              </div>
            ))}
          </div>
          {[
            {name:'Pexels',desc:'Free HD stock video',url:'https://www.pexels.com/api/',key:'pexels',ph:'paste API key...'},
            {name:'Pixabay',desc:'Additional free stock video',url:'https://pixabay.com/accounts/register/',key:'pixabay',ph:'paste API key...'},
            {name:'ElevenLabs',desc:'Realistic AI voices — paid plan required',url:'https://elevenlabs.io/sign-up',key:'elevenlabs',ph:'paste API key...',paid:true},
          ].map(s=>(
            <div key={s.name} style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'12px 14px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:s.paid?6:0}}>
                <div>
                  <span style={{fontSize:13,fontWeight:700,color:text}}>{s.name}</span>
                  {s.paid&&<span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:99,background:'rgba(255,170,0,0.12)',color:'#FFAA00',border:'1px solid rgba(255,170,0,0.25)',marginLeft:7}}>Paid</span>}
                  <div style={{fontSize:11,color:muted,marginTop:2}}>{s.desc}</div>
                </div>
                <button onClick={()=>openBrowser(s.url)} style={{fontSize:10,padding:'5px 10px',background:'rgba(200,255,0,0.07)',color:accent,border:'1px solid '+accent+'25',borderRadius:7,cursor:'pointer',flexShrink:0,marginLeft:10}}>Sign Up ↗</button>
              </div>
              <KeyInput isDark={isDark} placeholder={s.ph} value={keys[s.key]} onChange={v=>setK(s.key,v)}
                onTest={()=>testKey(s.key,keys[s.key])} testResult={testResults[s.key]} testing={testing[s.key]}/>
            </div>
          ))}
        </div>
      </Screen>
    ),

    youtube_intro:()=>(
      <Screen isDark={isDark} title="Connect YouTube?" subtitle="Lets MediaMill upload finished videos directly to your channel."
        back={()=>go('media_intro')}
        skip={()=>go('channel_name')}>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div onClick={()=>go('youtube_setup')} style={{padding:'18px',borderRadius:14,border:'2px solid rgba(255,0,0,0.2)',background:'rgba(255,0,0,0.04)',cursor:'pointer',transition:'all 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(255,0,0,0.4)'}
            onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,0,0,0.2)'}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{fontSize:32}}>▶️</span>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:text,marginBottom:3}}>Yes, connect YouTube</div>
                <div style={{fontSize:12,color:muted}}>Takes ~5 minutes. Requires a Google Cloud project.</div>
              </div>
              <span style={{fontSize:18,color:muted,marginLeft:'auto'}}>→</span>
            </div>
          </div>
          <div onClick={()=>go('channel_name')} style={{padding:'16px',borderRadius:14,border:'2px solid '+cardBorder,background:card,cursor:'pointer',transition:'all 0.15s'}}
            onMouseEnter={e=>e.currentTarget.style.borderColor=accent+'40'}
            onMouseLeave={e=>e.currentTarget.style.borderColor=cardBorder}>
            <div style={{display:'flex',gap:12,alignItems:'center'}}>
              <span style={{fontSize:28}}>⏭</span>
              <div>
                <div style={{fontSize:14,fontWeight:800,color:text,marginBottom:3}}>Skip for now</div>
                <div style={{fontSize:12,color:muted}}>Connect in Settings later. Videos save locally until then.</div>
              </div>
              <span style={{fontSize:18,color:muted,marginLeft:'auto'}}>→</span>
            </div>
          </div>
        </div>
      </Screen>
    ),

    youtube_setup:()=>(
      <Screen isDark={isDark} title="YouTube Setup" subtitle="Create OAuth credentials in Google Cloud — one-time setup."
        back={()=>go('youtube_intro')}
        next={keys.youtube_client_id&&keys.youtube_client_secret?()=>go('youtube_auth'):null}
        nextLabel="I've added both credentials →"
        skip={()=>go('channel_name')}>

        {/* Access denied fix notice */}
        <div style={{background:'rgba(255,170,0,0.07)',border:'1px solid rgba(255,170,0,0.2)',borderRadius:10,padding:'10px 13px',marginBottom:14,fontSize:11,color:'#FFAA00',lineHeight:1.5}}>
          ⚠ <strong>Important:</strong> Before connecting, go to Google Cloud → APIs & Services → OAuth consent screen → <strong>Test users</strong> → add your Gmail address. Otherwise you'll get "Access blocked".
        </div>

        <Steps isDark={isDark} items={[
          {text:'Open Google Cloud Console',url:'https://console.cloud.google.com'},
          'APIs & Services → Library → search "YouTube Data API v3" → Enable',
          'APIs & Services → OAuth consent screen → Test users → + Add your Gmail',
          {text:'Credentials → + Create Credentials →',highlight:'OAuth client ID'},
          {text:'Application type: Desktop app — name it MediaMill, click Create'},
          'Copy the Client ID and Client Secret from the popup',
        ]}/>

        <div style={{background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',border:'1px solid '+cardBorder,borderRadius:9,padding:'10px 13px',marginBottom:14,fontSize:11,color:muted}}>
          📋 The popup shows two values:<br/>
          <span style={{color:'#00E676',fontFamily:'monospace'}}>Client ID:</span> <span style={{fontFamily:'monospace'}}>xxxxxxxxxx.apps.googleusercontent.com</span><br/>
          <span style={{color:'#00E676',fontFamily:'monospace'}}>Client Secret:</span> <span style={{fontFamily:'monospace'}}>GOCSPX-xxxxx</span>
        </div>

        <div style={{marginBottom:10}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:muted,marginBottom:5}}>OAuth Client ID</div>
          <input value={keys.youtube_client_id||''} onChange={e=>setK('youtube_client_id',e.target.value)}
            placeholder="xxxxxxxxxx.apps.googleusercontent.com"
            style={{width:'100%',padding:'10px 12px',borderRadius:9,fontFamily:'monospace',fontSize:11,boxSizing:'border-box',
              background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
              border:'1px solid '+(isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),color:text,outline:'none'}}/>
        </div>
        <div>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:muted,marginBottom:5}}>OAuth Client Secret</div>
          <input value={keys.youtube_client_secret||''} onChange={e=>setK('youtube_client_secret',e.target.value)}
            placeholder="GOCSPX-..."
            style={{width:'100%',padding:'10px 12px',borderRadius:9,fontFamily:'monospace',fontSize:11,boxSizing:'border-box',
              background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
              border:'1px solid '+(isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),color:text,outline:'none'}}/>
        </div>
      </Screen>
    ),

    youtube_auth:()=>(
      <Screen isDark={isDark} title="Authorize YouTube" subtitle="Click below — your browser opens, sign in, click Allow. The window closes automatically."
        back={()=>go('youtube_setup')}
        skip={()=>go('channel_name')}>
        {ytConnected?(
          <div style={{textAlign:'center',padding:'32px 0'}}>
            <div style={{fontSize:64,marginBottom:12}}>✅</div>
            <div style={{fontSize:18,fontWeight:800,color:'#00E676',marginBottom:6}}>YouTube Connected!</div>
            <div style={{fontSize:13,color:muted,marginBottom:20}}>MediaMill can now upload to your channel.</div>
            <button onClick={()=>go('channel_name')} className="btn btn-primary" style={{fontSize:13,padding:'11px 28px'}}>Continue →</button>
          </div>
        ):(
          <div>
            {error&&(
              <div style={{padding:'12px 14px',borderRadius:10,background:'rgba(238,34,68,0.08)',border:'1px solid rgba(238,34,68,0.25)',color:'#EE2244',fontSize:12,marginBottom:14,lineHeight:1.5}}>
                {error}
              </div>
            )}
            <button onClick={connectYouTube} disabled={ytConnecting}
              className="btn btn-primary"
              style={{width:'100%',padding:'14px',fontSize:14,fontWeight:700,opacity:ytConnecting?0.6:1}}>
              {ytConnecting?'⟳ Waiting for browser authorization…':'🔗 Open Browser to Authorize'}
            </button>
            <div style={{fontSize:11,color:sub,textAlign:'center',marginTop:10,lineHeight:1.5}}>
              Your browser will open → sign in to Google → click <strong style={{color:text}}>Allow</strong> → window closes automatically
            </div>
          </div>
        )}
      </Screen>
    ),

    channel_name:()=>(
      <Screen isDark={isDark} title="What's your channel called?" subtitle="This is the name that appears on YouTube."
        back={()=>go('youtube_intro')}
        next={channel.name.trim()?()=>go('channel_topic'):null}
        nextLabel="Continue →">
        <input value={channel.name} onChange={e=>setCh('name',e.target.value)}
          placeholder="e.g. Canada News Today"
          autoFocus
          style={{width:'100%',padding:'14px 16px',borderRadius:12,fontSize:16,fontWeight:500,boxSizing:'border-box',
            background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
            border:'2px solid '+(channel.name?accent+'40':isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),
            color:text,outline:'none',transition:'border-color 0.2s'}}
          onKeyDown={e=>e.key==='Enter'&&channel.name.trim()&&go('channel_topic')}/>
        <div style={{fontSize:11,color:sub,marginTop:8}}>You can change this anytime in Settings.</div>
      </Screen>
    ),

    channel_topic:()=>(
      <Screen isDark={isDark} title="What's it about?" subtitle="Be specific — the AI uses this to find stories and write scripts."
        back={()=>go('channel_name')}
        next={channel.topic.trim()?()=>go('channel_format'):null}
        nextLabel="Continue →">
        <textarea value={channel.topic} onChange={e=>setCh('topic',e.target.value)} rows={4}
          placeholder="e.g. Unbiased Canadian political news — Parliament Hill, federal policy, provincial elections"
          autoFocus
          style={{width:'100%',padding:'13px 14px',borderRadius:12,fontSize:13,boxSizing:'border-box',resize:'none',
            background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
            border:'2px solid '+(channel.topic?accent+'40':isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),
            color:text,outline:'none',lineHeight:1.5,transition:'border-color 0.2s'}}/>

        {/* Smart suggestions based on input */}
        {topicSuggestions.length>0&&(
          <div style={{marginTop:10}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:sub,marginBottom:6}}>Suggested based on what you typed:</div>
            <div style={{display:'flex',flexDirection:'column',gap:5}}>
              {topicSuggestions.map((s,i)=>(
                <button key={i} onClick={()=>setCh('topic',s)}
                  style={{textAlign:'left',padding:'9px 12px',borderRadius:9,border:'1px solid '+cardBorder,background:card,
                    color:muted,fontSize:12,cursor:'pointer',transition:'all 0.1s',lineHeight:1.4}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accent+'50';e.currentTarget.style.color=text;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=cardBorder;e.currentTarget.style.color=muted;}}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Default suggestions if nothing typed yet */}
        {!channel.topic&&(
          <div style={{marginTop:10}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:sub,marginBottom:6}}>Common topics:</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['Canadian political news','Canadian WWII history','True crime from Canada','Canadian economic news','Indigenous Canadian history','Canadian nature and wildlife'].map(ex=>(
                <button key={ex} onClick={()=>setCh('topic',ex)}
                  style={{fontSize:11,padding:'5px 11px',borderRadius:8,border:'1px solid '+cardBorder,background:card,color:muted,cursor:'pointer',transition:'all 0.1s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accent+'50';e.currentTarget.style.color=accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=cardBorder;e.currentTarget.style.color=muted;}}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}
      </Screen>
    ),

    channel_format:()=>(
      <Screen isDark={isDark} title="What formats will you post?" subtitle="Select all that apply. MediaMill creates each format from the same content automatically."
        back={()=>go('channel_topic')}
        next={channel.formats.length>0?()=>go('channel_logo'):null}
        nextLabel="Continue →">
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
          {[
            {id:'short',icon:'⚡',label:'Shorts',desc:'Under 60 seconds — high traffic, best for clips and highlights from longer content',color:'#C8FF00'},
            {id:'mid',icon:'📰',label:'Mid-Form',desc:'5–20 minutes — news summaries, explainers, weekly recaps',color:'#00C8FF'},
            {id:'long',icon:'🎬',label:'Long-Form',desc:'20–90 minutes — deep dives, documentaries, full investigations',color:'#FF8040'},
          ].map(f=>{
            const sel=channel.formats.includes(f.id);
            return(
              <div key={f.id} onClick={()=>setCh('formats',sel?channel.formats.filter(x=>x!==f.id):[...channel.formats,f.id])}
                style={{padding:'14px 16px',borderRadius:14,border:'2px solid '+(sel?f.color+'50':cardBorder),
                  background:sel?f.color+'08':card,cursor:'pointer',transition:'all 0.15s',display:'flex',gap:14,alignItems:'flex-start'}}>
                <div style={{width:36,height:36,borderRadius:10,background:f.color+(sel?'20':'10'),
                  display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>
                  {f.icon}
                </div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3}}>
                    <span style={{fontSize:14,fontWeight:800,color:sel?f.color:text}}>{f.label}</span>
                    {sel&&<span style={{fontSize:10,color:f.color}}>✓ Selected</span>}
                  </div>
                  <div style={{fontSize:11,color:muted,lineHeight:1.4}}>{f.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{fontSize:11,color:sub,textAlign:'center'}}>
          💡 Selecting multiple formats means MediaMill automatically creates a Short, a Mid-Form and a Long-Form from the same story.
        </div>
      </Screen>
    ),

    channel_logo:()=>(
      <Screen isDark={isDark} title="Pick a logo" subtitle="Used as your YouTube profile photo. AI-generated from your channel name."
        back={()=>go('channel_format')}
        next={()=>createChannel()}
        nextLabel="Create Channel →"
        saving={saving}
        skip={()=>createChannel()}>
        {error&&<div style={{padding:'10px 13px',borderRadius:9,background:'rgba(238,34,68,0.08)',border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',fontSize:12,marginBottom:12}}>{error}</div>}

        <div style={{display:'flex',justifyContent:'center',gap:16,marginBottom:16,flexWrap:'wrap'}}>
          {generatingLogos&&[0,1,2].map(i=>(
            <div key={i} style={{width:100,height:100,borderRadius:'50%',background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)',animation:'pulse 1.2s ease-in-out infinite',animationDelay:i*0.2+'s'}}/>
          ))}
          {logoOptions.map((logo,i)=>(
            <div key={i} onClick={()=>setCh('logo',logo)}
              style={{width:100,height:100,borderRadius:'50%',overflow:'hidden',cursor:'pointer',
                border:'3px solid '+(channel.logo?.path===logo.path?accent:'transparent'),
                boxShadow:channel.logo?.path===logo.path?`0 0 0 3px ${accent}30,0 8px 24px rgba(0,0,0,0.4)`:'0 4px 16px rgba(0,0,0,0.3)',
                transition:'all 0.15s',flexShrink:0}}
              onMouseEnter={e=>e.currentTarget.style.transform='scale(1.06)'}
              onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
              <img src={logo.dataUri} alt={`Logo ${i+1}`} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
            </div>
          ))}
        </div>

        {logoOptions.length>0&&(
          <div style={{textAlign:'center',marginBottom:14}}>
            <button onClick={generateLogos} disabled={generatingLogos}
              style={{fontSize:12,padding:'7px 16px',borderRadius:9,background:card,border:'1px solid '+cardBorder,color:muted,cursor:'pointer',opacity:generatingLogos?0.5:1}}>
              {generatingLogos?'⟳ Generating…':'↻ Generate 3 More Options'}
            </button>
          </div>
        )}

        {channel.logo&&(
          <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',background:'rgba(200,255,0,0.05)',border:'1px solid rgba(200,255,0,0.15)',borderRadius:10}}>
            <img src={channel.logo.dataUri} style={{width:36,height:36,borderRadius:'50%',objectFit:'cover',border:'2px solid '+accent}}/>
            <div style={{fontSize:12,color:text}}>Logo selected — <span style={{color:muted}}>you can change this in Channel Branding later</span></div>
          </div>
        )}

        <div style={{fontSize:11,color:sub,textAlign:'center',marginTop:10}}>
          {logoOptions[0]?.source==='fallback'?'Add an OpenAI key in Settings for AI-generated logos':'AI generated from your channel name and topic'}
        </div>
      </Screen>
    ),

    done:()=>(
      <Screen isDark={isDark} next={onComplete} nextLabel="Open MediaMill →">
        <div style={{textAlign:'center',padding:'16px 0 8px'}}>
          <div style={{fontSize:64,marginBottom:16}}>🚀</div>
          <h2 style={{fontSize:24,fontWeight:900,color:text,marginBottom:10}}>You're all set!</h2>
          <div style={{display:'flex',flexDirection:'column',gap:7,maxWidth:280,margin:'0 auto 20px',textAlign:'left'}}>
            {[
              {icon:'💡',t:'Go to Ideas → scan for content'},
              {icon:'✓', t:'Approve an idea to start a video'},
              {icon:'▶', t:'Run Full Pipeline — AI does the rest'},
              {icon:'👁', t:'Review before it publishes'},
            ].map((s,i)=>(
              <div key={i} style={{display:'flex',gap:10,padding:'9px 12px',background:card,border:'1px solid '+cardBorder,borderRadius:9}}>
                <span style={{fontSize:15,flexShrink:0}}>{s.icon}</span>
                <span style={{fontSize:12,color:text}}>{s.t}</span>
              </div>
            ))}
          </div>
          <div style={{fontSize:11,color:sub}}>Add more keys and settings anytime in <strong style={{color:text}}>Settings</strong>.</div>
        </div>
      </Screen>
    ),
  };

  const bg=isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)';
  const screenIdx=SCREENS.indexOf(screen);
  const progress=screen==='welcome'||screen==='done'?null:Math.round((screenIdx/(SCREENS.length-2))*100);

  return(
    <div style={{position:'fixed',inset:0,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:9999,padding:24}}>
      <div style={{width:'100%',maxWidth:480}}>
        {/* Progress bar */}
        {progress!==null&&(
          <div style={{marginBottom:16,height:3,background:isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width:progress+'%',background:accent,borderRadius:99,transition:'width 0.4s ease'}}/>
          </div>
        )}

        {/* Card */}
        <div style={{
          background:isDark?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.85)',
          border:'1px solid '+(isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'),
          borderRadius:20,
          padding:screen==='welcome'||screen==='done'?36:24,
          boxShadow:isDark?'0 24px 60px rgba(0,0,0,0.55)':'0 12px 40px rgba(0,0,0,0.1)',
          backdropFilter:'blur(20px)',
          maxHeight:'80vh',
          overflowY:'auto',
        }}>
          {screens[screen]?.()}
        </div>
      </div>
    </div>
  );
}
