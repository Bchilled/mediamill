import React,{useState}from 'react';
import{useApp}from '../../context/AppContext';

const STEPS=[
  {id:'welcome',group:null},
  {id:'ai_keys',group:'App Setup'},
  {id:'media',group:'App Setup'},
  {id:'youtube',group:'YouTube'},
  {id:'channel',group:'Channel'},
  {id:'done',group:null},
];

function openBrowser(url){
  try{window.forge.openExternal(url);}catch(e){console.error(e);}
}

function NavDots({current,isDark}){
  const accent=isDark?'#C8FF00':'#4400CC';
  const muted=isDark?'rgba(255,255,255,0.18)':'rgba(0,0,0,0.15)';
  const groups=[...new Set(STEPS.filter(s=>s.group).map(s=>s.group))];
  const curIdx=STEPS.findIndex(s=>s.id===current);
  return(
    <div style={{display:'flex',gap:24,justifyContent:'center',marginBottom:24}}>
      {groups.map(g=>{
        const gs=STEPS.filter(s=>s.group===g);
        const active=gs.some(s=>s.id===current);
        const done=gs.every(s=>STEPS.findIndex(x=>x.id===s.id)<curIdx);
        return(
          <div key={g} style={{textAlign:'center'}}>
            <div style={{display:'flex',gap:3,marginBottom:4}}>
              {gs.map(s=>{
                const idx=STEPS.findIndex(x=>x.id===s.id);
                const isA=s.id===current,isDone=idx<curIdx;
                return<div key={s.id} style={{height:6,width:isA?22:isDone?10:7,borderRadius:99,background:isA?accent:isDone?accent+'70':muted,transition:'all 0.3s'}}/>;
              })}
            </div>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.1em',textTransform:'uppercase',color:active?accent:done?accent+'60':muted}}>{g}</div>
          </div>
        );
      })}
    </div>
  );
}

// Visual step-by-step instruction block
function Steps({items,isDark}){
  const muted=isDark?'rgba(255,255,255,0.5)':'rgba(0,0,20,0.55)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const rowBg=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  return(
    <div style={{display:'flex',flexDirection:'column',gap:4}}>
      {items.map((item,i)=>(
        <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'8px 10px',background:rowBg,borderRadius:8}}>
          <div style={{width:20,height:20,borderRadius:'50%',background:accent+'15',border:'1px solid '+accent+'30',
            display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:800,color:accent,flexShrink:0,marginTop:1}}>
            {i+1}
          </div>
          <div style={{flex:1,fontSize:12,color:muted,lineHeight:1.5}}>
            {typeof item==='string'?item:item.text}
            {item.url&&<> — <button onClick={()=>openBrowser(item.url)}
              style={{color:accent,background:'none',border:'none',cursor:'pointer',fontSize:12,padding:0,textDecoration:'underline'}}>
              open ↗</button></>}
            {item.highlight&&<> <strong style={{color:isDark?'#E8E6FF':'#111122',background:accent+'20',padding:'1px 5px',borderRadius:4}}>{item.highlight}</strong></>}
          </div>
        </div>
      ))}
    </div>
  );
}

function KeyField({isDark,label,value,onChange,placeholder,onTest,testResult,testing,hint,wide}){
  const[show,setShow]=useState(false);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const inputStyle={
    flex:1,padding:'9px 12px',borderRadius:8,fontFamily:'monospace',fontSize:11,
    background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
    border:'1px solid '+(testResult==='ok'?'rgba(0,230,118,0.4)':testResult==='fail'?'rgba(238,34,68,0.4)':isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),
    color:text,outline:'none',width:wide?'100%':'auto',boxSizing:'border-box',
  };
  const btnStyle=(col)=>({padding:'8px 11px',borderRadius:8,background:col?col+'12':'transparent',border:'1px solid '+(col?col+'30':isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:col||muted,cursor:'pointer',fontSize:11,flexShrink:0,fontWeight:600});
  return(
    <div style={{marginBottom:12}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5}}>
        <div style={{fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.1em'}}>{label}</div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {testResult==='ok'&&<span style={{fontSize:11,fontWeight:700,color:'#00E676'}}>✓ Connected</span>}
          {testResult==='fail'&&<span style={{fontSize:11,fontWeight:700,color:'#EE2244'}}>✗ Invalid key</span>}
        </div>
      </div>
      {hint&&<div style={{fontSize:11,color:muted,marginBottom:6,lineHeight:1.4,fontStyle:'italic'}}>{hint}</div>}
      <div style={{display:'flex',gap:7}}>
        {wide?(
          <input type={show?'text':'password'} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={inputStyle}/>
        ):(
          <input type={show?'text':'password'} value={value||''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={{...inputStyle,flex:1}}/>
        )}
        <button onClick={()=>setShow(s=>!s)} style={btnStyle(null)}>{show?'Hide':'Show'}</button>
        {onTest&&(
          <button onClick={onTest} disabled={testing||!value} style={{...btnStyle(accent),opacity:testing||!value?0.4:1}}>
            {testing?'⟳':'Test'}
          </button>
        )}
      </div>
    </div>
  );
}

function Section({title,isDark,children,collapsible,defaultOpen=true}){
  const[open,setOpen]=useState(defaultOpen);
  const text=isDark?'#E8E6FF':'#111122';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const bg=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  return(
    <div style={{border:'1px solid '+border,borderRadius:12,overflow:'hidden',marginBottom:10}}>
      {title&&(
        <div onClick={collapsible?()=>setOpen(o=>!o):undefined}
          style={{padding:'11px 14px',background:bg,display:'flex',justifyContent:'space-between',alignItems:'center',cursor:collapsible?'pointer':'default'}}>
          <div style={{fontSize:12,fontWeight:700,color:text}}>{title}</div>
          {collapsible&&<span style={{fontSize:10,color:isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.3)'}}>{open?'▲':'▼'}</span>}
        </div>
      )}
      {(!collapsible||open)&&<div style={{padding:'12px 14px'}}>{children}</div>}
    </div>
  );
}

export default function FirstRun({onComplete}){
  const{theme,loadChannels}=useApp();
  const isDark=theme==='dark';
  const[step,setStep]=useState('welcome');
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const[testResults,setTestResults]=useState({});
  const[testing,setTesting]=useState({});
  const[ytConnected,setYtConnected]=useState(false);
  const[ytConnecting,setYtConnecting]=useState(false);
  const[ytTested,setYtTested]=useState(false);

  const[keys,setKeys]=useState({claude:'',gemini:'',pexels:'',pixabay:'',elevenlabs:'',youtube_client_id:'',youtube_client_secret:''});
  const[channel,setChannel]=useState({name:'',topic:'',preset:'long',voice_engine:'auto',auto_approve:false});

  const setK=(k,v)=>setKeys(ks=>({...ks,[k]:v}));
  const setCh=(k,v)=>setChannel(c=>({...c,[k]:v}));

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.22)':'rgba(0,0,20,0.3)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const border=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';

  const stepIdx=STEPS.findIndex(s=>s.id===step);
  function next(){setError('');setStep(STEPS[stepIdx+1].id);}
  function back(){setError('');setStep(STEPS[stepIdx-1].id);}

  async function testKey(service,key){
    if(!key)return;
    setTesting(t=>({...t,[service]:true}));
    try{
      const r=await window.forge.testApiKey(service,key);
      setTestResults(t=>({...t,[service]:r.ok?'ok':'fail'}));
    }catch(e){setTestResults(t=>({...t,[service]:'fail'}));}
    setTesting(t=>({...t,[service]:false}));
  }

  async function saveKeys(){
    setSaving(true);setError('');
    try{
      const clean={};
      Object.entries(keys).forEach(([k,v])=>{if(v&&v.trim())clean[k]=v.trim();});
      await window.forge.updateSettings({apiKeys:clean});
      next();
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  async function connectYouTube(){
    setYtConnecting(true);setError('');
    try{
      await window.forge.updateSettings({apiKeys:{youtube_client_id:keys.youtube_client_id,youtube_client_secret:keys.youtube_client_secret}});
      await window.forge.youtubeConnect('__setup__');
      setYtConnected(true);setYtTested(true);
    }catch(e){setError(e.message);}
    setYtConnecting(false);
  }

  async function createChannel(){
    setSaving(true);setError('');
    try{
      if(!channel.name.trim())throw new Error('Channel name is required.');
      if(!channel.topic.trim())throw new Error('Topic is required — the AI needs this to find content.');
      await window.forge.createChannel({...channel,style_prompt:channel.topic});
      await loadChannels();
      next();
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  const hasAI=!!(keys.claude||keys.gemini);

  // ─── STEPS ───────────────────────────────────────────────────────

  function renderWelcome(){
    return(
      <div style={{textAlign:'center',padding:'8px 0'}}>
        <div style={{fontSize:64,marginBottom:16}}>🎬</div>
        <h1 style={{fontSize:26,fontWeight:900,color:text,marginBottom:10,letterSpacing:'-0.02em'}}>Welcome to MediaMill</h1>
        <p style={{fontSize:13,color:muted,lineHeight:1.7,maxWidth:380,margin:'0 auto 10px'}}>
          Automatically turns ideas into published YouTube videos.
        </p>
        <p style={{fontSize:11,color:sub,maxWidth:340,margin:'0 auto 28px',lineHeight:1.6}}>
          This wizard connects your AI and media accounts. Most steps are optional — you can skip anything and add it later in Settings.
        </p>
        <button onClick={next} className="btn btn-primary" style={{fontSize:13,padding:'11px 32px'}}>Start Setup →</button>
        <div style={{fontSize:10,color:sub,marginTop:8}}>~3 minutes</div>
      </div>
    );
  }

  function renderAIKeys(){
    const allTested=Object.values(testResults).some(v=>v==='ok');
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:18}}>
          <h2 style={{fontSize:18,fontWeight:900,color:text,marginBottom:6}}>🤖 Connect AI</h2>
          <p style={{fontSize:12,color:muted}}>AI writes your scripts, titles, descriptions, and tags.<br/><strong style={{color:text}}>Add at least one. Claude is the best choice.</strong></p>
        </div>

        {/* Claude */}
        <Section title="Claude — Anthropic (Recommended)" isDark={isDark}>
          <Steps isDark={isDark} items={[
            {text:'Go to Anthropic Console',url:'https://console.anthropic.com'},
            'Click "Get API Keys" in the left sidebar',
            {text:'Click',highlight:'+ Create Key'},
            'Copy the key — it starts with sk-ant-',
            'Paste it below and click Test',
          ]}/>
          <div style={{marginTop:10}}>
            <KeyField isDark={isDark} label="Claude API Key" placeholder="sk-ant-api03-..."
              value={keys.claude} onChange={v=>setK('claude',v)}
              onTest={()=>testKey('claude',keys.claude)} testResult={testResults.claude} testing={testing.claude}/>
          </div>
        </Section>

        {/* Gemini */}
        <Section title="Gemini — Google (Free Tier)" isDark={isDark} collapsible defaultOpen={!keys.claude}>
          <Steps isDark={isDark} items={[
            {text:'Go to Google AI Studio',url:'https://aistudio.google.com/app/apikey'},
            {text:'Click',highlight:'+ Create API key'},
            'In the dropdown, choose any existing project (e.g. "Default" or "openclaw")',
            'Copy the key — it starts with AIzaSy-',
            'Paste it below and click Test',
          ]}/>
          <div style={{marginTop:10}}>
            <KeyField isDark={isDark} label="Gemini API Key" placeholder="AIzaSy..."
              value={keys.gemini} onChange={v=>setK('gemini',v)}
              onTest={()=>testKey('gemini',keys.gemini)} testResult={testResults.gemini} testing={testing.gemini}/>
          </div>
        </Section>

        <div style={{fontSize:11,color:sub,textAlign:'center',marginBottom:4}}>
          You only need one. Both work fine together.
        </div>
      </div>
    );
  }

  function renderMedia(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:900,color:text,marginBottom:6}}>🖼 Media Sources</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.5}}>Video clips and images used in your videos.<br/><strong style={{color:'#00E676'}}>All of these are optional.</strong> Free sources are always used automatically.</p>
        </div>

        {/* Always free */}
        <div style={{background:'rgba(0,230,118,0.06)',border:'1px solid rgba(0,230,118,0.2)',borderRadius:12,padding:'11px 14px',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:'#00E676',marginBottom:7}}>✓ Always Included — No Account Needed</div>
          {[
            {icon:'📖',name:'Wikimedia Commons',desc:'Millions of free photos and historical images'},
            {icon:'🗄',name:'Internet Archive',desc:'Public domain newsreels and historical footage'},
            {icon:'🎙',name:'Windows TTS',desc:'Free built-in voice narration — works immediately'},
          ].map(s=>(
            <div key={s.name} style={{display:'flex',gap:9,alignItems:'center',marginBottom:5,fontSize:11}}>
              <span style={{fontSize:15}}>{s.icon}</span>
              <span style={{fontWeight:600,color:text}}>{s.name}</span>
              <span style={{color:muted}}>— {s.desc}</span>
            </div>
          ))}
        </div>

        {/* Pexels */}
        <Section title="Pexels — Free Stock Video (Optional)" isDark={isDark} collapsible defaultOpen={false}>
          <Steps isDark={isDark} items={[
            {text:'Go to Pexels API page',url:'https://www.pexels.com/api/'},
            'Click "Get Started" and create a free account',
            'After signing in, your API key is shown on the API page',
            'Copy it and paste below',
          ]}/>
          <div style={{marginTop:10}}>
            <KeyField isDark={isDark} label="Pexels API Key" placeholder="paste key..."
              value={keys.pexels} onChange={v=>setK('pexels',v)}
              onTest={()=>testKey('pexels',keys.pexels)} testResult={testResults.pexels} testing={testing.pexels}/>
          </div>
        </Section>

        {/* Pixabay */}
        <Section title="Pixabay — Free Stock Video (Optional)" isDark={isDark} collapsible defaultOpen={false}>
          <Steps isDark={isDark} items={[
            {text:'Go to Pixabay',url:'https://pixabay.com/accounts/register/'},
            'Create a free account and sign in',
            {text:'Go to',url:'https://pixabay.com/api/docs/'},
            'Your API key is shown at the top of the page when logged in',
          ]}/>
          <div style={{marginTop:10}}>
            <KeyField isDark={isDark} label="Pixabay API Key" placeholder="paste key..."
              value={keys.pixabay} onChange={v=>setK('pixabay',v)}
              onTest={()=>testKey('pixabay',keys.pixabay)} testResult={testResults.pixabay} testing={testing.pixabay}/>
          </div>
        </Section>

        {/* ElevenLabs */}
        <Section title="ElevenLabs — Realistic AI Voices (Optional, Paid)" isDark={isDark} collapsible defaultOpen={false}>
          <div style={{background:'rgba(255,170,0,0.08)',border:'1px solid rgba(255,170,0,0.2)',borderRadius:8,padding:'8px 12px',marginBottom:10,fontSize:11,color:'#FFAA00'}}>
            ⚠ ElevenLabs requires a paid plan (~$5/mo). Windows TTS is free and works fine for testing.
          </div>
          <Steps isDark={isDark} items={[
            {text:'Sign up at ElevenLabs',url:'https://elevenlabs.io/sign-up'},
            'Go to your Profile (top right corner)',
            {text:'Click',highlight:'Profile + API Key'},
            'Copy the API key shown there',
          ]}/>
          <div style={{marginTop:10}}>
            <KeyField isDark={isDark} label="ElevenLabs API Key" placeholder="paste key..."
              value={keys.elevenlabs} onChange={v=>setK('elevenlabs',v)}
              onTest={()=>testKey('elevenlabs',keys.elevenlabs)} testResult={testResults.elevenlabs} testing={testing.elevenlabs}/>
          </div>
        </Section>
      </div>
    );
  }

  function renderYouTube(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:900,color:text,marginBottom:6}}>▶️ Connect YouTube</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.5}}>Lets MediaMill upload videos directly to your channel.<br/><strong style={{color:text}}>Optional — skip and connect later in Settings.</strong></p>
        </div>

        <Section title="Step 1 — Create OAuth Credentials in Google Cloud" isDark={isDark}>
          <div style={{fontSize:11,color:muted,marginBottom:10,lineHeight:1.5}}>
            This is a one-time setup. You're creating a "key" that lets MediaMill talk to YouTube on your behalf.
          </div>
          <Steps isDark={isDark} items={[
            {text:'Open Google Cloud Console',url:'https://console.cloud.google.com'},
            {text:'At the top, make sure you\'re in your project (e.g.',highlight:'openclaw',url:null},
            'Left menu → APIs & Services → Library → search "YouTube Data API v3" → Enable it',
            'Left menu → APIs & Services → Credentials → + Create Credentials → OAuth client ID',
            {text:'Application type:',highlight:'Desktop app'},
            'Name it MediaMill → click Create',
            'A popup shows your Client ID and Client Secret — copy both',
          ]}/>

          {/* Visual mock of what they'll see */}
          <div style={{background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',border:'1px solid '+border,borderRadius:8,padding:'10px 12px',marginTop:10,fontSize:11}}>
            <div style={{color:muted,marginBottom:6,fontWeight:600}}>📋 What the popup looks like:</div>
            <div style={{fontFamily:'monospace',fontSize:10,lineHeight:1.8,color:isDark?'rgba(255,255,255,0.5)':'rgba(0,0,0,0.5)'}}>
              <div><span style={{color:'#00E676'}}>Client ID:</span> 123456789-abc123.apps.googleusercontent.com</div>
              <div><span style={{color:'#00E676'}}>Client Secret:</span> GOCSPX-xxxxxxxxxxxxxxxx</div>
            </div>
          </div>
        </Section>

        <Section title="Step 2 — Paste Your Credentials" isDark={isDark}>
          <KeyField isDark={isDark} label="OAuth Client ID"
            hint="Looks like: 123456789-abc123.apps.googleusercontent.com"
            placeholder="xxxxxxxxxx.apps.googleusercontent.com"
            value={keys.youtube_client_id} onChange={v=>setK('youtube_client_id',v)}/>
          <KeyField isDark={isDark} label="OAuth Client Secret"
            hint="Looks like: GOCSPX-xxxxxxxxxxxxxxxx"
            placeholder="GOCSPX-..."
            value={keys.youtube_client_secret} onChange={v=>setK('youtube_client_secret',v)}/>
        </Section>

        <Section title="Step 3 — Authorize MediaMill" isDark={isDark}>
          {ytConnected?(
            <div style={{textAlign:'center',padding:'12px 0'}}>
              <div style={{fontSize:28,marginBottom:6}}>✅</div>
              <div style={{fontSize:13,fontWeight:700,color:'#00E676',marginBottom:4}}>YouTube Connected!</div>
              <div style={{fontSize:11,color:muted}}>MediaMill can now upload to your channel.</div>
            </div>
          ):(
            <div>
              <div style={{fontSize:11,color:muted,marginBottom:12,lineHeight:1.5}}>
                Click below — <strong style={{color:text}}>your browser opens</strong>, you sign in to Google and click Allow, then the window closes automatically and you're connected.
              </div>
              <button onClick={connectYouTube}
                disabled={ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret}
                className="btn btn-primary"
                style={{width:'100%',padding:'11px',fontSize:12,opacity:ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret?0.45:1}}>
                {ytConnecting?'⟳ Waiting for browser authorization…':'🔗 Authorize YouTube — opens browser'}
              </button>
              {(!keys.youtube_client_id||!keys.youtube_client_secret)&&(
                <div style={{fontSize:10,color:sub,marginTop:6,textAlign:'center'}}>Fill in Client ID and Secret above first</div>
              )}
            </div>
          )}
        </Section>
      </div>
    );
  }

  function renderChannel(){
    const PC={short:'#C8FF00',mid:'#00C8FF',long:'#FF8040'};
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:16}}>
          <h2 style={{fontSize:18,fontWeight:900,color:text,marginBottom:6}}>📡 Create Your First Channel</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.5}}>Each channel is a separate YouTube presence with its own topic and schedule. You can create more later.</p>
        </div>

        <Section isDark={isDark}>
          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:sub,marginBottom:6}}>Channel Name</div>
            <input value={channel.name} onChange={e=>setCh('name',e.target.value)} placeholder="e.g. Due North News"
              style={{width:'100%',padding:'9px 12px',borderRadius:8,boxSizing:'border-box',fontSize:13,
                background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
                border:'1px solid '+(isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),color:text,outline:'none'}}/>
          </div>

          <div style={{marginBottom:12}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:sub,marginBottom:4}}>Topic *</div>
            <div style={{fontSize:11,color:muted,marginBottom:6}}>The AI uses this to find content and write scripts. Be specific.</div>
            <textarea value={channel.topic} onChange={e=>setCh('topic',e.target.value)} rows={3}
              placeholder="e.g. Unbiased Canadian political news, federal government accountability, Parliament Hill coverage"
              style={{width:'100%',padding:'9px 12px',borderRadius:8,boxSizing:'border-box',resize:'none',fontSize:12,
                background:isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)',
                border:'1px solid '+(isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.12)'),color:text,outline:'none',marginBottom:8}}/>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {['Canadian political news','Canadian WWII history','True crime from Canada','Canadian economic news','Indigenous Canadian history'].map(ex=>(
                <button key={ex} onClick={()=>setCh('topic',ex)}
                  style={{fontSize:10,padding:'3px 9px',borderRadius:7,border:'1px solid '+border,background:'transparent',color:muted,cursor:'pointer',transition:'all 0.1s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accent;e.currentTarget.style.color=accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=border;e.currentTarget.style.color=muted;}}>{ex}</button>
              ))}
            </div>
          </div>

          <div>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',color:sub,marginBottom:8}}>Video Format</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {[{id:'short',label:'Shorts',desc:'Under 60s',icon:'⚡'},{id:'mid',label:'Mid-Form',desc:'5–20 min',icon:'📰'},{id:'long',label:'Long-Form',desc:'20–90 min',icon:'🎬'}].map(p=>{
                const sel=channel.preset===p.id;const col=PC[p.id];
                return(
                  <div key={p.id} onClick={()=>setCh('preset',p.id)} style={{padding:'10px 6px',textAlign:'center',cursor:'pointer',borderRadius:10,
                    background:sel?col+'10':'transparent',border:'1px solid '+(sel?col+'50':border),transition:'all 0.1s'}}>
                    <div style={{fontSize:16,marginBottom:2}}>{p.icon}</div>
                    <div style={{fontSize:11,fontWeight:700,color:sel?col:text}}>{p.label}</div>
                    <div style={{fontSize:10,color:muted}}>{p.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Section>
      </div>
    );
  }

  function renderDone(){
    return(
      <div style={{textAlign:'center',padding:'8px 0'}}>
        <div style={{fontSize:64,marginBottom:16}}>🚀</div>
        <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:10}}>You're all set!</h2>
        <div style={{display:'flex',flexDirection:'column',gap:7,maxWidth:300,margin:'0 auto 24px',textAlign:'left'}}>
          {[
            {icon:'💡',text:'Go to Ideas → scan for content'},
            {icon:'✓', text:'Approve an idea you like'},
            {icon:'▶', text:'Hit "Run Full Pipeline"'},
            {icon:'👁', text:'Review before it publishes'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',gap:10,padding:'8px 12px',background:card,border:'1px solid '+border,borderRadius:9}}>
              <span style={{fontSize:15,flexShrink:0}}>{s.icon}</span>
              <span style={{fontSize:12,color:text}}>{s.text}</span>
            </div>
          ))}
        </div>
        <div style={{fontSize:11,color:sub,marginBottom:16}}>
          You can add more keys and settings anytime in <strong style={{color:text}}>Settings</strong>.
        </div>
        <button onClick={onComplete} className="btn btn-primary" style={{fontSize:13,padding:'11px 32px'}}>Open MediaMill →</button>
      </div>
    );
  }

  const renders={welcome:renderWelcome,ai_keys:renderAIKeys,media:renderMedia,youtube:renderYouTube,channel:renderChannel,done:renderDone};

  // Nav button logic per step
  function renderNav(){
    if(step==='welcome'||step==='done')return null;
    const backBtn=(
      <button onClick={back} style={{padding:'10px 18px',borderRadius:9,background:'transparent',
        border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:muted,cursor:'pointer',fontSize:12,flexShrink:0}}>
        ← Back
      </button>
    );
    if(step==='ai_keys'){
      return(
        <div style={{display:'flex',gap:10,marginTop:16}}>
          {backBtn}
          <button onClick={hasAI?saveKeys:undefined} disabled={saving||!hasAI} className="btn btn-primary"
            style={{flex:1,padding:'10px',fontSize:12,opacity:saving||!hasAI?0.45:1}}>
            {saving?'Saving…':'Save & Continue →'}
          </button>
        </div>
      );
    }
    if(step==='media'||step==='youtube'){
      return(
        <div style={{display:'flex',gap:10,marginTop:16}}>
          {backBtn}
          <button onClick={async()=>{
            if(step==='media'){const c={};Object.entries(keys).forEach(([k,v])=>{if(v)c[k]=v;});try{await window.forge.updateSettings({apiKeys:c});}catch(e){}};
            next();
          }} className="btn btn-primary" style={{flex:1,padding:'10px',fontSize:12}}>
            {step==='youtube'&&!ytConnected?'Skip YouTube →':'Continue →'}
          </button>
        </div>
      );
    }
    if(step==='channel'){
      return(
        <div style={{display:'flex',gap:10,marginTop:16}}>
          {backBtn}
          <button onClick={createChannel} disabled={saving||!channel.name||!channel.topic}
            className="btn btn-primary" style={{flex:1,padding:'10px',fontSize:12,opacity:saving||!channel.name||!channel.topic?0.45:1}}>
            {saving?'Creating…':'Create Channel →'}
          </button>
        </div>
      );
    }
    return null;
  }

  const bg=isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)';

  return(
    <div style={{position:'fixed',inset:0,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',zIndex:9999,padding:'24px 16px',overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:560,paddingTop:step==='welcome'?'10vh':8}}>
        {step!=='welcome'&&step!=='done'&&<NavDots current={step} isDark={isDark}/>}
        <div style={{
          background:isDark?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.8)',
          border:'1px solid '+(isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'),
          borderRadius:20,padding:step==='welcome'||step==='done'?32:20,
          boxShadow:isDark?'0 24px 60px rgba(0,0,0,0.55)':'0 12px 40px rgba(0,0,0,0.1)',
          backdropFilter:'blur(20px)',
        }}>
          {renders[step]?.()}
          {error&&<div style={{marginTop:12,padding:'9px 13px',borderRadius:9,background:'rgba(238,34,68,0.08)',border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',fontSize:12}}>{error}</div>}
          {renderNav()}
        </div>
        {step!=='welcome'&&step!=='done'&&(
          <div style={{textAlign:'center',marginTop:12,fontSize:11,color:sub}}>
            Step {stepIdx} of {STEPS.length-2}
            {step!=='ai_keys'&&<span> · <button onClick={next} style={{color:sub,background:'none',border:'none',cursor:'pointer',fontSize:11,textDecoration:'underline',padding:0}}>skip this step</button></span>}
          </div>
        )}
      </div>
    </div>
  );
}
