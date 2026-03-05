import React,{useState}from 'react';
import{useApp}from '../../context/AppContext';

function openBrowser(url){try{window.forge.openExternal(url);}catch(e){console.error(e);}}

function Screen({isDark,children,title,subtitle,back,next,nextLabel,nextDisabled,skip,saving}){
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  const accent=isDark?'#C8FF00':'#4400CC';
  return(
    <div style={{display:'flex',flexDirection:'column',minHeight:'100%'}}>
      {title&&(<div style={{marginBottom:24,textAlign:'center'}}>
        <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:6,letterSpacing:'-0.01em'}}>{title}</h2>
        {subtitle&&<p style={{fontSize:12,color:muted,lineHeight:1.6,maxWidth:380,margin:'0 auto'}}>{subtitle}</p>}
      </div>)}
      <div style={{flex:1}}>{children}</div>
      <div style={{marginTop:20}}>
        {next&&(<button onClick={next} disabled={nextDisabled||saving} className="btn btn-primary"
          style={{width:'100%',padding:'13px',fontSize:14,fontWeight:700,opacity:nextDisabled||saving?0.4:1,marginBottom:skip?8:0}}>
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

function KeyInput({isDark,placeholder,value,onChange,onTest,testResult,testing}){
  const[show,setShow]=useState(false);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const ok=testResult==='ok';const fail=testResult==='fail';
  return(
    <div>
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
        {onTest&&(<button onClick={onTest} disabled={testing||!value}
          style={{padding:'11px 14px',borderRadius:10,background:accent+'15',border:'1px solid '+accent+'30',
            color:accent,cursor:'pointer',fontSize:11,fontWeight:700,flexShrink:0,opacity:testing||!value?0.4:1}}>
          {testing?'⟳':'Test'}
        </button>)}
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
    <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:14}}>
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

// ── Main SystemSetup component ────────────────────────────────────────

export default function SystemSetup({onClose}){
  const{theme}=useApp();
  const isDark=theme==='dark';
  const[screen,setScreen]=useState('ai');
  const[keys,setKeys]=useState({});
  const[testing,setTesting]=useState({});
  const[testResults,setTestResults]=useState({});
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');

  const setK=(k,v)=>setKeys(ks=>({...ks,[k]:v}));
  const go=(s)=>{setError('');setScreen(s);};

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';

  async function testKey(service,key){
    if(!key)return;
    setTesting(t=>({...t,[service]:true}));
    try{
      const r=await window.forge.testApiKey(service,key);
      setTestResults(t=>({...t,[service]:r.ok?'ok':'fail'}));
    }catch(e){setTestResults(t=>({...t,[service]:'fail'}));}
    setTesting(t=>({...t,[service]:false}));
  }

  async function saveAndGo(next){
    setSaving(true);setError('');
    try{
      const clean={};Object.entries(keys).forEach(([k,v])=>{if(v?.trim())clean[k]=v.trim();});
      if(Object.keys(clean).length>0)await window.forge.updateSettings({apiKeys:clean});
      if(next)go(next);
      else onClose();
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  const AI_PROVIDERS=[
    {id:'claude',  label:'Claude',   sub:'Best quality · ~$0.01/script · Best for scripts and SEO',badge:'Recommended',color:'#C8FF00'},
    {id:'gemini',  label:'Gemini',   sub:'Google · Free tier · Fast research and B-roll matching',badge:'Free tier',color:'#00C8FF'},
    {id:'openai',  label:'OpenAI',   sub:'GPT-4o · Strong fallback · Great for SEO titles',badge:'Optional',color:'#888'},
    {id:'grok',    label:'Grok',     sub:'xAI · Real-time web access · Breaking news',badge:'Optional',color:'#FF8040'},
    {id:'mistral', label:'Mistral',  sub:'European AI · Privacy-focused · Budget friendly',badge:'Optional',color:'#A060FF'},
  ];

  const AI_INFO={
    claude:{title:'Connect Claude',ph:'sk-ant-api03-...',steps:[
      {text:'Open Anthropic Console',url:'https://console.anthropic.com'},
      {text:'Left sidebar →',highlight:'API Keys'},
      {text:'Click',highlight:'+ Create Key'},
      'Name it MediaMill and click Create',
      'Copy the key (starts with sk-ant-)',
      'Paste below and click Test',
    ]},
    gemini:{title:'Connect Gemini',ph:'AIzaSy...',steps:[
      {text:'Open Google AI Studio',url:'https://aistudio.google.com/app/apikey'},
      {text:'Click',highlight:'+ Create API key'},
      'Choose any existing Google project',
      'Copy the key (starts with AIzaSy)',
      'Paste below and click Test',
    ]},
    openai:{title:'Connect OpenAI',ph:'sk-proj-...',steps:[
      {text:'Open OpenAI Platform',url:'https://platform.openai.com/api-keys'},
      {text:'Click',highlight:'+ Create new secret key'},
      'Name it MediaMill',
      'Copy the key (starts with sk-)',
      'Paste below and click Test',
    ]},
    grok:{title:'Connect Grok',ph:'xai-...',steps:[
      {text:'Open xAI Console',url:'https://console.x.ai'},
      'Sign in with your X account',
      {text:'Go to',highlight:'API Keys'},
      'Create a key and copy it',
      'Paste below and click Test',
    ]},
    mistral:{title:'Connect Mistral',ph:'...',steps:[
      {text:'Open Mistral Console',url:'https://console.mistral.ai'},
      {text:'Go to',highlight:'API Keys'},
      'Create a new key and copy it',
      'Paste below and click Test',
    ]},
  };

  const MEDIA_KEYS=[
    {key:'pexels',    label:'Pexels',    badge:'Free',color:'#00C8FF',url:'https://www.pexels.com/api/',ph:'...',what:'Stock photos and videos'},
    {key:'pixabay',   label:'Pixabay',   badge:'Free',color:'#00E676',url:'https://pixabay.com/api/docs/',ph:'...',what:'Stock photos and videos'},
    {key:'elevenlabs',label:'ElevenLabs',badge:'Paid',color:'#FF8040',url:'https://elevenlabs.io',ph:'...',what:'Premium AI voice narration'},
  ];

  const connected=AI_PROVIDERS.filter(p=>testResults[p.id]==='ok');
  const anyConnected=connected.length>0;

  // Which AI provider detail screen is open
  const aiDetail=AI_PROVIDERS.find(p=>screen==='ai_'+p.id);

  const screens={
    ai:()=>(
      <Screen isDark={isDark} title="AI Models"
        subtitle="MediaMill auto-assigns each task to the best available model. Add as many as you like — more = more resilience and capability."
        skip={onClose}>
        <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:10}}>
          {AI_PROVIDERS.map(p=>(
            <div key={p.id} onClick={()=>go('ai_'+p.id)}
              style={{padding:'11px 14px',borderRadius:11,
                border:'2px solid '+(testResults[p.id]==='ok'?'rgba(0,230,118,0.4)':cardBorder),
                cursor:'pointer',background:testResults[p.id]==='ok'?'rgba(0,230,118,0.04)':card,
                transition:'all 0.12s',display:'flex',alignItems:'center',gap:11}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=p.color+'50';e.currentTarget.style.background=p.color+'07';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=testResults[p.id]==='ok'?'rgba(0,230,118,0.4)':cardBorder;e.currentTarget.style.background=testResults[p.id]==='ok'?'rgba(0,230,118,0.04)':card;}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',gap:7,alignItems:'center',marginBottom:2}}>
                  <span style={{fontSize:13,fontWeight:800,color:text}}>{p.label}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:'1px 6px',borderRadius:99,background:p.color+'15',color:p.color,border:'1px solid '+p.color+'25'}}>{p.badge}</span>
                  {testResults[p.id]==='ok'&&<span style={{fontSize:10,fontWeight:700,color:'#00E676'}}>✓ Connected</span>}
                </div>
                <div style={{fontSize:11,color:muted}}>{p.sub}</div>
              </div>
              <span style={{fontSize:13,color:testResults[p.id]==='ok'?'#00E676':muted}}>{testResults[p.id]==='ok'?'✓':'→'}</span>
            </div>
          ))}
        </div>
        <div style={{background:accent+'06',border:'1px solid '+accent+'15',borderRadius:9,padding:'9px 12px',fontSize:11,color:muted,lineHeight:1.5,marginBottom:10}}>
          💡 You only need one to start. More models = MediaMill picks the cheapest and most capable for each job automatically.
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={()=>go('media')}
            style={{flex:1,padding:'10px',borderRadius:9,background:card,border:'1px solid '+cardBorder,color:muted,cursor:'pointer',fontSize:12}}>
            Next: Media Sources →
          </button>
          <button onClick={()=>saveAndGo(null)}
            style={{flex:1,padding:'10px',borderRadius:9,background:anyConnected?accent+'15':'transparent',
              border:'1px solid '+(anyConnected?accent+'30':cardBorder),
              color:anyConnected?accent:muted,cursor:'pointer',fontSize:12,fontWeight:anyConnected?700:400}}>
            {anyConnected?'Save & Done ✓':'Done (no keys)'}
          </button>
        </div>
      </Screen>
    ),

    ...Object.fromEntries(AI_PROVIDERS.map(p=>{
      const info=AI_INFO[p.id];
      return['ai_'+p.id,()=>(
        <Screen isDark={isDark} title={info.title}
          back={()=>go('ai')}
          skip={()=>go('ai')}>
          <Steps isDark={isDark} items={info.steps}/>
          <KeyInput isDark={isDark} placeholder={info.ph} value={keys[p.id]||''} onChange={v=>setK(p.id,v)}
            onTest={()=>testKey(p.id,keys[p.id]||'')} testResult={testResults[p.id]} testing={testing[p.id]}/>
          {testResults[p.id]==='ok'&&(
            <button onClick={()=>{saveAndGo('ai');}} className="btn btn-primary" style={{width:'100%',padding:'12px',marginTop:12,fontSize:13}}>
              ✓ Saved — Back to models →
            </button>
          )}
        </Screen>
      )];
    })),

    media:()=>(
      <Screen isDark={isDark} title="Media Sources"
        subtitle="Where MediaMill gets stock footage and images. Free sources are always included."
        back={()=>go('ai')}
        next={()=>saveAndGo(null)} nextLabel="Save & Done ✓"
        skip={onClose}>
        <div style={{background:'rgba(0,230,118,0.06)',border:'1px solid rgba(0,230,118,0.15)',borderRadius:10,padding:'10px 13px',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:'#00E676',marginBottom:6}}>✓ Always Free — No Key Needed</div>
          <div style={{fontSize:11,color:muted}}>Wikimedia Commons · Internet Archive · Unsplash Basic</div>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:7}}>
          {MEDIA_KEYS.map(m=>(
            <div key={m.key} style={{padding:'11px 14px',borderRadius:10,border:'1px solid '+cardBorder,background:card}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:13,fontWeight:700,color:text}}>{m.label}</span>
                <span style={{fontSize:9,padding:'1px 6px',borderRadius:99,background:m.color+'15',color:m.color,fontWeight:700}}>{m.badge}</span>
                <a onClick={()=>openBrowser(m.url)} style={{fontSize:10,color:muted,cursor:'pointer',marginLeft:'auto',textDecoration:'underline'}}>Get key ↗</a>
                {testResults[m.key]==='ok'&&<span style={{fontSize:10,color:'#00E676',fontWeight:700}}>✓</span>}
              </div>
              <div style={{fontSize:11,color:sub,marginBottom:8}}>{m.what}</div>
              <KeyInput isDark={isDark} placeholder={m.ph} value={keys[m.key]||''} onChange={v=>setK(m.key,v)}
                onTest={()=>testKey(m.key,keys[m.key]||'')} testResult={testResults[m.key]} testing={testing[m.key]}/>
            </div>
          ))}
        </div>
      </Screen>
    ),
  };

  const bg=isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)';
  const TABS=[{id:'ai',label:'🤖 AI Models'},{id:'media',label:'🎬 Media Sources'}];
  const topTab=screen.startsWith('ai')?'ai':'media';

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:9999,padding:24,backdropFilter:'blur(4px)'}}>
      <div style={{width:'100%',maxWidth:460,background:isDark?'rgba(12,12,22,0.98)':'rgba(255,255,255,0.98)',
        border:'1px solid '+(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'),
        borderRadius:20,padding:28,boxShadow:'0 24px 60px rgba(0,0,0,0.55)',maxHeight:'85vh',display:'flex',flexDirection:'column'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:900,color:text}}>⚙️ System Setup</div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:muted,cursor:'pointer',fontSize:18,padding:'0 4px'}}>✕</button>
        </div>
        {/* Tab bar */}
        <div style={{display:'flex',gap:4,marginBottom:20,background:card,borderRadius:10,padding:4}}>
          {TABS.map(tab=>{
            const active=topTab===tab.id;
            return(
              <button key={tab.id} onClick={()=>go(tab.id)}
                style={{flex:1,padding:'7px',borderRadius:8,border:'none',cursor:'pointer',fontSize:11,fontWeight:active?700:400,
                  background:active?(isDark?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.9)'):'transparent',
                  color:active?text:muted,transition:'all 0.1s'}}>
                {tab.label}
              </button>
            );
          })}
        </div>
        <div style={{overflowY:'auto',flex:1}}>
          {screens[screen]?.()}
        </div>
      </div>
    </div>
  );
}
