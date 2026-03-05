import React,{useState,useRef}from 'react';
import{useApp}from '../../context/AppContext';

const STEPS=[
  {id:'welcome',   title:'Welcome',        group:null},
  {id:'ai_keys',   title:'AI Models',      group:'App Setup'},
  {id:'media_keys',title:'Media & Assets', group:'App Setup'},
  {id:'budget',    title:'Spending Limits',group:'App Setup'},
  {id:'youtube',   title:'YouTube',        group:'YouTube'},
  {id:'channel',   title:'Channel',        group:'Channel'},
  {id:'done',      title:'Ready',          group:null},
];

// Opens link in system browser, NOT in an Electron popup window
function openExternal(url){
  try{window.forge?.openExternal?.(url);}
  catch(e){window.open(url,'_blank');}
}

function NavDots({steps,current,isDark}){
  const accent=isDark?'#C8FF00':'#4400CC';
  const muted=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)';
  const groups=[...new Set(steps.filter(s=>s.group).map(s=>s.group))];
  return(
    <div style={{display:'flex',gap:20,alignItems:'center',marginBottom:32,justifyContent:'center',flexWrap:'wrap'}}>
      {groups.map(g=>{
        const groupSteps=steps.filter(s=>s.group===g);
        const curIdx=steps.findIndex(x=>x.id===current);
        const isActive=groupSteps.some(s=>s.id===current);
        const isDone=groupSteps.every(s=>steps.findIndex(x=>x.id===s.id)<curIdx);
        return(
          <div key={g} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:5}}>
            <div style={{display:'flex',gap:4}}>
              {groupSteps.map(s=>{
                const idx=steps.findIndex(x=>x.id===s.id);
                const done=idx<curIdx;const active=s.id===current;
                return<div key={s.id} style={{width:active?28:done?10:8,height:8,borderRadius:99,background:active?accent:done?accent+'80':muted,transition:'all 0.3s'}}/>;
              })}
            </div>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',
              color:isActive?accent:isDone?accent+'60':muted,transition:'all 0.3s'}}>{g}</div>
          </div>
        );
      })}
    </div>
  );
}

// Provider entry — handles test, sign-in link, key input, status
function ProviderRow({isDark,label,sub,badge,badgeColor,signupUrl,signupLabel,placeholder,value,onChange,testable,onTest,testResult,noKey,linked,signInNote}){
  const[show,setShow]=useState(false);
  const[testing,setTesting]=useState(false);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const rowBg=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const rowBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)';
  const accent=isDark?'#C8FF00':'#4400CC';

  async function runTest(){
    setTesting(true);
    await onTest?.();
    setTesting(false);
  }

  const statusColor=testResult==='ok'?'#00E676':testResult==='fail'?'#EE2244':null;

  return(
    <div style={{background:rowBg,border:'1px solid '+(statusColor?statusColor+'30':rowBorder),borderRadius:12,padding:'13px 15px',marginBottom:10,transition:'border-color 0.2s'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:noKey||linked?0:8}}>
        <div style={{flex:1}}>
          <div style={{display:'flex',gap:7,alignItems:'center',marginBottom:2,flexWrap:'wrap'}}>
            <span style={{fontSize:13,fontWeight:700,color:text}}>{label}</span>
            {badge&&<span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99,background:badgeColor+'18',color:badgeColor,border:'1px solid '+badgeColor+'30'}}>{badge}</span>}
            {testResult==='ok'&&<span style={{fontSize:9,fontWeight:700,color:'#00E676'}}>✓ Key works</span>}
            {testResult==='fail'&&<span style={{fontSize:9,fontWeight:700,color:'#EE2244'}}>✗ Invalid key</span>}
          </div>
          <div style={{fontSize:11,color:muted,lineHeight:1.4}}>{sub}</div>
        </div>
        {/* Sign up button — opens in SYSTEM browser */}
        {signupUrl&&(
          <button onClick={()=>openExternal(signupUrl)}
            style={{fontSize:10,padding:'5px 11px',background:'rgba(200,255,0,0.07)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',borderRadius:7,cursor:'pointer',flexShrink:0,marginLeft:10,whiteSpace:'nowrap'}}>
            {signupLabel||'Sign Up ↗'}
          </button>
        )}
      </div>

      {/* Linked/no-key status */}
      {(noKey||linked)&&(
        <div style={{fontSize:11,color:muted,fontStyle:'italic',marginTop:4}}>
          {linked?'✓ No API key needed — links directly to your account':noKey}
        </div>
      )}

      {/* Sign-in note */}
      {signInNote&&(
        <div style={{fontSize:11,color:muted,marginTop:6,padding:'7px 10px',background:'rgba(255,255,255,0.03)',borderRadius:8,lineHeight:1.5}}>
          {signInNote}
        </div>
      )}

      {/* Key input */}
      {!noKey&&!linked&&(
        <div style={{display:'flex',gap:8,marginTop:8}}>
          <input type={show?'text':'password'} value={value||''} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder}
            style={{flex:1,fontFamily:'monospace',fontSize:12,padding:'8px 12px',borderRadius:8,
              background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
              border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),
              color:text,outline:'none'}}/>
          <button onClick={()=>setShow(s=>!s)}
            style={{padding:'8px 12px',borderRadius:8,background:'transparent',border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:muted,cursor:'pointer',fontSize:11,flexShrink:0}}>
            {show?'Hide':'Show'}
          </button>
          {testable&&value&&(
            <button onClick={runTest} disabled={testing}
              style={{padding:'8px 12px',borderRadius:8,background:accent+'10',border:'1px solid '+accent+'30',color:accent,cursor:'pointer',fontSize:11,flexShrink:0,opacity:testing?0.6:1}}>
              {testing?'⟳':'Test'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function FirstRun({onComplete}){
  const{theme,loadChannels}=useApp();
  const isDark=theme==='dark';
  const[step,setStep]=useState('welcome');
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const[ytConnected,setYtConnected]=useState(false);
  const[ytConnecting,setYtConnecting]=useState(false);
  const[testResults,setTestResults]=useState({});

  const[keys,setKeys]=useState({claude:'',gemini:'',openai:'',pexels:'',pixabay:'',youtube_client_id:'',youtube_client_secret:'',elevenlabs:''});
  const[budget,setBudget]=useState({daily:5,weekly:20,monthly:80});
  const[channel,setChannel]=useState({name:'',topic:'',preset:'long',voice_engine:'auto',auto_approve:false});
  const[selectedLogo,setSelectedLogo]=useState(null);

  const setK=(k,v)=>setKeys(ks=>({...ks,[k]:v}));
  const setCh=(k,v)=>setChannel(c=>({...c,[k]:v}));

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.25)':'rgba(0,0,20,0.3)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const cardBorder=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)';
  const bg=isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)';

  const stepIdx=STEPS.findIndex(s=>s.id===step);
  function next(){setError('');setStep(STEPS[stepIdx+1].id);}
  function back(){setError('');setStep(STEPS[stepIdx-1].id);}

  async function testKey(service,key){
    if(!key)return;
    try{
      const result=await window.forge.testApiKey(service,key);
      setTestResults(r=>({...r,[service]:result.ok?'ok':'fail'}));
    }catch(e){setTestResults(r=>({...r,[service]:'fail'}));}
  }

  async function saveAndNext(){
    setSaving(true);setError('');
    try{
      if(step==='ai_keys'){
        if(!keys.claude&&!keys.gemini)throw new Error('Add at least one AI key to continue.');
        const clean={};Object.entries(keys).forEach(([k,v])=>{if(v)clean[k]=v;});
        await window.forge.updateSettings({apiKeys:clean});
        next();
      } else if(step==='media_keys'){
        const clean={};Object.entries(keys).forEach(([k,v])=>{if(v)clean[k]=v;});
        await window.forge.updateSettings({apiKeys:clean});
        next();
      } else if(step==='budget'){
        await window.forge.updateSettings({budget});
        next();
      } else if(step==='channel'){
        if(!channel.name.trim())throw new Error('Channel name is required.');
        if(!channel.topic.trim())throw new Error('Channel topic is required.');
        await window.forge.createChannel({...channel,style_prompt:channel.topic,logo_path:selectedLogo?.path||null});
        await loadChannels();
        next();
      }
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  async function connectYouTube(){
    if(!keys.youtube_client_id||!keys.youtube_client_secret){
      setError('Add Client ID and Secret above first.');return;
    }
    setYtConnecting(true);setError('');
    try{
      await window.forge.updateSettings({apiKeys:{...keys}});
      await window.forge.youtubeConnect('__setup__');
      setYtConnected(true);
    }catch(e){setError(e.message);}
    setYtConnecting(false);
  }

  const canProceed={
    welcome:true,ai_keys:!!(keys.claude||keys.gemini),
    media_keys:true,budget:true,youtube:true,
    channel:!!(channel.name&&channel.topic),done:true,
  }[step];

  // ── Step renders ─────────────────────────────────────────────────

  function renderWelcome(){
    return(
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:72,marginBottom:20}}>🎬</div>
        <h1 style={{fontSize:28,fontWeight:900,color:text,marginBottom:12,letterSpacing:'-0.02em'}}>Welcome to MediaMill</h1>
        <p style={{fontSize:14,color:muted,lineHeight:1.7,maxWidth:400,margin:'0 auto 10px'}}>
          Turns ideas into published YouTube videos — automatically.
        </p>
        <p style={{fontSize:12,color:sub,maxWidth:360,margin:'0 auto 32px',lineHeight:1.6}}>
          Finds Canadian content, writes AI scripts, gathers footage, records narration, composes the video, uploads to YouTube.
        </p>
        <button onClick={next} className="btn btn-primary" style={{fontSize:14,padding:'12px 36px'}}>Get started →</button>
        <div style={{fontSize:11,color:sub,marginTop:10}}>Takes about 3 minutes</div>
      </div>
    );
  }

  function renderAIKeys(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:10}}>🤖</div>
          <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:6}}>Connect AI Models</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.6}}>AI writes your scripts, titles, descriptions, and tags.<br/><strong style={{color:text}}>Add at least one.</strong></p>
        </div>

        <div style={{background:isDark?'rgba(200,255,0,0.04)':'rgba(68,0,204,0.04)',border:'1px solid '+(isDark?'rgba(200,255,0,0.1)':'rgba(68,0,204,0.1)'),borderRadius:10,padding:'9px 13px',marginBottom:14,fontSize:11,color:muted,lineHeight:1.5}}>
          💡 Click <strong style={{color:accent}}>Sign Up ↗</strong> — it opens in your browser. Create an account, find API Keys, copy and paste it back here. Then click <strong style={{color:accent}}>Test</strong> to verify it works.
        </div>

        <ProviderRow isDark={isDark} label="Claude" badge="Recommended" badgeColor="#C8FF00"
          sub="Anthropic · Best quality for scripts and SEO"
          signupUrl="https://console.anthropic.com" signupLabel="Get API Key ↗"
          placeholder="sk-ant-api03-..." value={keys.claude} onChange={v=>setK('claude',v)}
          testable onTest={()=>testKey('claude',keys.claude)} testResult={testResults.claude}/>

        <ProviderRow isDark={isDark} label="Gemini" badge="Recommended" badgeColor="#00C8FF"
          sub="Google · Free tier available · Good fallback"
          signupUrl="https://aistudio.google.com/app/apikey" signupLabel="Get API Key ↗"
          placeholder="AIzaSy..."
          signInNote="On the Google AI Studio page: click '+ Create API key' → choose an existing project (e.g. 'Default') → copy the key."
          value={keys.gemini} onChange={v=>setK('gemini',v)}
          testable onTest={()=>testKey('gemini',keys.gemini)} testResult={testResults.gemini}/>

        <ProviderRow isDark={isDark} label="OpenAI (GPT-4)" badge="Optional" badgeColor="#888"
          sub="Fallback if Claude/Gemini hit rate limits"
          signupUrl="https://platform.openai.com/api-keys" signupLabel="Get API Key ↗"
          placeholder="sk-proj-..."
          value={keys.openai} onChange={v=>setK('openai',v)}
          testable onTest={()=>testKey('openai',keys.openai)} testResult={testResults.openai}/>
      </div>
    );
  }

  function renderMediaKeys(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:10}}>🖼</div>
          <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:6}}>Media & Assets</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.6}}>Video clips and images for your videos.<br/>All steps here are optional — free sources are always used automatically.</p>
        </div>

        {/* Always-free sources */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'12px 15px',marginBottom:12}}>
          <div style={{fontSize:11,fontWeight:700,color:text,marginBottom:8}}>✓ Always Free — No Setup Needed</div>
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            {[
              {icon:'📖',name:'Wikimedia Commons',desc:'Millions of free photos, maps, historical images'},
              {icon:'🗄',name:'Internet Archive',desc:'Historical footage, newsreels, public domain video'},
              {icon:'🎙',name:'Windows TTS',desc:'Free built-in voice — no account needed'},
            ].map(s=>(
              <div key={s.name} style={{display:'flex',gap:10,alignItems:'center',fontSize:11}}>
                <span style={{fontSize:16,flexShrink:0}}>{s.icon}</span>
                <div><span style={{fontWeight:600,color:text}}>{s.name}</span><span style={{color:muted}}> — {s.desc}</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* Optional paid/free-with-key sources */}
        <div style={{fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8}}>Optional — Better Stock Video</div>

        <ProviderRow isDark={isDark} label="Pexels" badge="Free API" badgeColor="#00E676"
          sub="High quality stock video matched to your B-roll cues"
          signupUrl="https://www.pexels.com/api/" signupLabel="Sign Up & Get Key ↗"
          placeholder="paste API key..."
          signInNote="Sign up at Pexels → go to pexels.com/api → click 'Your API Key' — it's shown on the page, no payment needed."
          value={keys.pexels} onChange={v=>setK('pexels',v)}
          testable onTest={()=>testKey('pexels',keys.pexels)} testResult={testResults.pexels}/>

        <ProviderRow isDark={isDark} label="Pixabay" badge="Free API" badgeColor="#00E676"
          sub="Additional free stock video as a fallback"
          signupUrl="https://pixabay.com/accounts/register/" signupLabel="Sign Up & Get Key ↗"
          placeholder="paste API key..."
          signInNote="Sign up → go to pixabay.com/api/docs → your API key is shown at the top of the page when logged in."
          value={keys.pixabay} onChange={v=>setK('pixabay',v)}
          testable onTest={()=>testKey('pixabay',keys.pixabay)} testResult={testResults.pixabay}/>

        <div style={{fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:8,marginTop:14}}>Optional — Better Voices</div>

        <ProviderRow isDark={isDark} label="ElevenLabs" badge="Optional" badgeColor="#888"
          sub="Most realistic AI voices — costs per character used"
          signupUrl="https://elevenlabs.io/sign-up" signupLabel="Sign Up ↗"
          placeholder="paste API key..."
          signInNote="Sign up at elevenlabs.io → click your profile (top right) → Profile + API Key → copy the key shown there."
          value={keys.elevenlabs} onChange={v=>setK('elevenlabs',v)}
          testable onTest={()=>testKey('elevenlabs',keys.elevenlabs)} testResult={testResults.elevenlabs}/>

        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:10,padding:'10px 13px',fontSize:11,color:muted,marginTop:4}}>
          💡 All of these can be added or changed later in <strong style={{color:text}}>Settings → Media & Assets</strong>. Skip anything you're not sure about.
        </div>
      </div>
    );
  }

  function renderBudget(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:10}}>💰</div>
          <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:6}}>Spending Limits</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.6}}>AI charges per use. These limits auto-pause all AI tasks if spending gets too high.</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:14}}>
          {[
            {key:'daily',label:'Daily Limit',desc:'Resets at midnight',suggested:'$2–$5'},
            {key:'weekly',label:'Weekly Limit',desc:'Resets Monday',suggested:'$10–$25'},
            {key:'monthly',label:'Monthly Limit',desc:'Hard ceiling',suggested:'$30–$80'},
          ].map(l=>(
            <div key={l.key} style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'13px 15px',display:'flex',alignItems:'center',gap:12}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:text,marginBottom:2}}>{l.label}</div>
                <div style={{fontSize:11,color:muted}}>{l.desc} · <span style={{color:isDark?'rgba(200,255,0,0.5)':'rgba(68,0,204,0.5)'}}>suggested {l.suggested}</span></div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:5,flexShrink:0}}>
                <span style={{fontSize:14,color:muted}}>$</span>
                <input type="number" min={0} step={1} value={budget[l.key]}
                  onChange={e=>setBudget(b=>({...b,[l.key]:parseFloat(e.target.value)||0}))}
                  style={{width:72,padding:'7px 10px',borderRadius:8,fontFamily:'monospace',textAlign:'right',fontSize:13,
                    background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
                    border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:text,outline:'none'}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:10,padding:'10px 13px',fontSize:11,color:muted}}>
          💡 A typical 10-min video costs $0.10–$0.50 in AI fees. Change these anytime in Settings → Budget.
        </div>
      </div>
    );
  }

  function renderYouTube(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:10}}>▶️</div>
          <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:6}}>Connect YouTube</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.6}}>MediaMill uploads finished videos directly to YouTube.<br/>Optional — skip and connect later in Settings.</p>
        </div>

        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,overflow:'hidden',marginBottom:12}}>
          <div style={{padding:'13px 15px',borderBottom:'1px solid '+cardBorder}}>
            <div style={{fontSize:13,fontWeight:700,color:text,marginBottom:4}}>Step 1 — Create OAuth Credentials (one-time)</div>
            <div style={{fontSize:11,color:muted,lineHeight:1.6,marginBottom:10}}>
              You need a free Google Cloud project. This sounds scary but takes 3 minutes.
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:7,marginBottom:12}}>
              {[
                ['1','Go to Google Cloud Console','https://console.cloud.google.com'],
                ['2','Create a new project — call it "MediaMill"',null],
                ['3','APIs & Services → Enable APIs → search "YouTube Data API v3" → Enable',null],
                ['4','APIs & Services → Credentials → Create OAuth Client ID → Desktop app',null],
                ['5','Copy the Client ID and Client Secret below',null],
              ].map(([n,s,url])=>(
                <div key={n} style={{display:'flex',gap:9,alignItems:'flex-start',fontSize:11,color:muted}}>
                  <span style={{width:18,height:18,borderRadius:'50%',background:accent+'20',color:accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0,marginTop:1}}>{n}</span>
                  <span style={{flex:1}}>{s}{url&&<> — <button onClick={()=>openExternal(url)} style={{color:accent,background:'transparent',border:'none',cursor:'pointer',fontSize:11,padding:0,textDecoration:'underline'}}>open ↗</button></>}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:'13px 15px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
              {[
                {k:'youtube_client_id',label:'OAuth Client ID',ph:'xxxxxxxxxx.apps.googleusercontent.com'},
                {k:'youtube_client_secret',label:'OAuth Client Secret',ph:'GOCSPX-...'},
              ].map(f=>(
                <div key={f.k}>
                  <div style={{fontSize:10,fontWeight:600,color:muted,marginBottom:4}}>{f.label}</div>
                  <input type="text" value={keys[f.k]||''} onChange={e=>setK(f.k,e.target.value)}
                    placeholder={f.ph}
                    style={{width:'100%',padding:'8px 12px',borderRadius:8,fontFamily:'monospace',fontSize:11,boxSizing:'border-box',
                      background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
                      border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:text,outline:'none'}}/>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{background:card,border:'1px solid '+(ytConnected?'rgba(0,230,118,0.3)':cardBorder),borderRadius:14,padding:'16px',textAlign:'center'}}>
          {ytConnected?(
            <div>
              <div style={{fontSize:22,marginBottom:6}}>✅</div>
              <div style={{fontSize:13,fontWeight:700,color:'#00E676'}}>YouTube Connected!</div>
            </div>
          ):(
            <div>
              <div style={{fontSize:12,color:muted,marginBottom:12,lineHeight:1.5}}>
                Step 2 — Authorize MediaMill to access your YouTube account.<br/>
                <strong style={{color:text}}>Your browser will open</strong> — sign in and click Allow. The window will close automatically.
              </div>
              <button onClick={connectYouTube} disabled={ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret}
                className="btn btn-primary" style={{fontSize:12,padding:'9px 22px',opacity:ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret?0.5:1}}>
                {ytConnecting?'⟳ Waiting for authorization…':'🔗 Authorize YouTube'}
              </button>
              {(!keys.youtube_client_id||!keys.youtube_client_secret)&&(
                <div style={{fontSize:10,color:sub,marginTop:8}}>Fill in Client ID and Secret above first</div>
              )}
            </div>
          )}
        </div>

        <div style={{textAlign:'center',marginTop:14}}>
          <button onClick={next} style={{fontSize:11,color:sub,background:'transparent',border:'none',cursor:'pointer',textDecoration:'underline'}}>
            Skip — connect YouTube later in Settings
          </button>
        </div>
      </div>
    );
  }

  function renderChannel(){
    const PC={short:'#C8FF00',mid:'#00C8FF',long:'#FF8040'};
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:20}}>
          <div style={{fontSize:40,marginBottom:10}}>📡</div>
          <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:6}}>Create Your First Channel</h2>
          <p style={{fontSize:12,color:muted,lineHeight:1.6}}>Each channel is a separate YouTube presence with its own topic and style.</p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'13px 15px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:sub,marginBottom:7}}>Channel Name</div>
            <input value={channel.name} onChange={e=>setCh('name',e.target.value)} placeholder="e.g. Due North News"
              style={{width:'100%',padding:'8px 12px',borderRadius:8,boxSizing:'border-box',
                background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
                border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:text,fontSize:13,outline:'none'}}/>
          </div>
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'13px 15px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:sub,marginBottom:4}}>Topic *</div>
            <div style={{fontSize:11,color:muted,marginBottom:7}}>The AI uses this to find content and write scripts. Be specific.</div>
            <textarea value={channel.topic} onChange={e=>setCh('topic',e.target.value)} rows={3}
              placeholder="e.g. Unbiased Canadian political news, federal government accountability and policy decisions"
              style={{width:'100%',padding:'8px 12px',borderRadius:8,boxSizing:'border-box',resize:'none',
                background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
                border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:text,fontSize:12,outline:'none',marginBottom:8}}/>
            <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
              {['Canadian political news','Canadian WWII history','True crime from Canada','Canadian economic news','Indigenous Canadian history'].map(ex=>(
                <button key={ex} onClick={()=>setCh('topic',ex)}
                  style={{fontSize:10,padding:'3px 9px',borderRadius:7,border:'1px solid '+cardBorder,background:'transparent',color:muted,cursor:'pointer'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accent;e.currentTarget.style.color=accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=cardBorder;e.currentTarget.style.color=muted;}}>{ex}</button>
              ))}
            </div>
          </div>
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'13px 15px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:sub,marginBottom:8}}>Format</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {[{id:'short',label:'Shorts',desc:'< 60 sec',icon:'⚡'},{id:'mid',label:'Mid-Form',desc:'5–20 min',icon:'📰'},{id:'long',label:'Long-Form',desc:'20–90 min',icon:'🎬'}].map(p=>{
                const sel=channel.preset===p.id;const color=PC[p.id];
                return(
                  <div key={p.id} onClick={()=>setCh('preset',p.id)} style={{padding:'12px 8px',textAlign:'center',cursor:'pointer',borderRadius:10,
                    background:sel?color+'10':'transparent',border:'1px solid '+(sel?color+'50':cardBorder),transition:'all 0.12s'}}>
                    <div style={{fontSize:18,marginBottom:3}}>{p.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,color:sel?color:text}}>{p.label}</div>
                    <div style={{fontSize:10,color:muted}}>{p.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDone(){
    return(
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:72,marginBottom:20}}>🚀</div>
        <h2 style={{fontSize:24,fontWeight:900,color:text,marginBottom:10}}>You're all set!</h2>
        <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:320,margin:'0 auto 28px',textAlign:'left'}}>
          {[
            {icon:'💡',text:'Go to Ideas → scan for content'},
            {icon:'✓', text:'Approve an idea you like'},
            {icon:'▶', text:'Hit "Run Full Pipeline" and wait'},
            {icon:'👁', text:'Review the video before it publishes'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',padding:'9px 12px',background:card,border:'1px solid '+cardBorder,borderRadius:9}}>
              <span style={{fontSize:16,flexShrink:0}}>{s.icon}</span>
              <span style={{fontSize:12,color:text,lineHeight:1.4}}>{s.text}</span>
            </div>
          ))}
        </div>
        <button onClick={onComplete} className="btn btn-primary" style={{fontSize:14,padding:'12px 36px'}}>Open MediaMill →</button>
      </div>
    );
  }

  const renders={welcome:renderWelcome,ai_keys:renderAIKeys,media_keys:renderMediaKeys,budget:renderBudget,youtube:renderYouTube,channel:renderChannel,done:renderDone};

  return(
    <div style={{position:'fixed',inset:0,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:9999,padding:24,overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:540}}>
        {step!=='welcome'&&step!=='done'&&<NavDots steps={STEPS} current={step} isDark={isDark}/>}
        <div style={{
          background:isDark?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.75)',
          border:'1px solid '+(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'),
          borderRadius:20,padding:step==='welcome'||step==='done'?36:24,
          boxShadow:isDark?'0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06)':'0 16px 48px rgba(0,0,0,0.12)',
          backdropFilter:'blur(20px)',
        }}>
          {renders[step]?.()}

          {error&&<div style={{marginTop:12,padding:'9px 13px',borderRadius:9,background:'rgba(238,34,68,0.08)',border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',fontSize:12}}>{error}</div>}

          {step!=='welcome'&&step!=='done'&&step!=='youtube'&&(
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={back} style={{padding:'10px 18px',borderRadius:9,background:'transparent',border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:muted,cursor:'pointer',fontSize:12}}>← Back</button>
              <button onClick={saveAndNext} disabled={saving||!canProceed} className="btn btn-primary"
                style={{flex:1,padding:'10px',fontSize:12,opacity:saving||!canProceed?0.5:1}}>
                {saving?'Saving…':step==='channel'?'Create Channel →':'Save & Continue →'}
              </button>
            </div>
          )}
          {step==='youtube'&&(
            <div style={{display:'flex',gap:10,marginTop:20}}>
              <button onClick={back} style={{padding:'10px 18px',borderRadius:9,background:'transparent',border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),color:muted,cursor:'pointer',fontSize:12}}>← Back</button>
              <button onClick={saveAndNext} className="btn btn-primary" style={{flex:1,padding:'10px',fontSize:12}}>
                {ytConnected?'Continue →':'Skip for now →'}
              </button>
            </div>
          )}
        </div>
        {step!=='welcome'&&step!=='done'&&(
          <div style={{textAlign:'center',marginTop:14,fontSize:11,color:sub}}>
            Step {stepIdx} of {STEPS.length-2} — {STEPS[stepIdx].title}
          </div>
        )}
      </div>
    </div>
  );
}
