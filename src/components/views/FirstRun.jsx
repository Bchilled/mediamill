import React,{useState}from 'react';
import{useApp}from '../../context/AppContext';

// ─── Step definitions ───────────────────────────────────────────────
const STEPS=[
  {id:'welcome',    title:'Welcome',          icon:'🎬', group:null},
  {id:'ai_keys',   title:'AI Models',         icon:'🤖', group:'App Setup'},
  {id:'media_keys',title:'Media & Assets',    icon:'🖼',  group:'App Setup'},
  {id:'budget',    title:'Spending Limits',   icon:'💰', group:'App Setup'},
  {id:'youtube',   title:'YouTube Account',   icon:'▶️',  group:'YouTube'},
  {id:'channel',   title:'Channel Details',   icon:'📡', group:'Channel'},
  {id:'done',      title:'Ready',             icon:'🚀', group:null},
];

// ─── Reusable bits ───────────────────────────────────────────────────
function KeyInput({label,sub,link,linkLabel,placeholder,value,onChange,isDark,badge,badgeColor}){
  const[show,setShow]=useState(false);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub2=isDark?'rgba(255,255,255,0.25)':'rgba(0,0,20,0.3)';
  const rowBg=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.025)';
  const rowBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)';
  const noKey=!placeholder||placeholder.startsWith('built')||placeholder.startsWith('local')||placeholder.startsWith('n/a');
  return(
    <div style={{background:rowBg,border:'1px solid '+rowBorder,borderRadius:12,padding:'14px 16px',marginBottom:10}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div>
          <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:2}}>
            <span style={{fontSize:13,fontWeight:700,color:text}}>{label}</span>
            {badge&&<span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99,background:badgeColor+'18',color:badgeColor,border:'1px solid '+badgeColor+'30'}}>{badge}</span>}
          </div>
          {sub&&<div style={{fontSize:11,color:muted}}>{sub}</div>}
        </div>
        {link&&<a href={link} target="_blank" rel="noreferrer" style={{fontSize:10,padding:'4px 10px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',borderRadius:7,textDecoration:'none',flexShrink:0}}>Get Key ↗</a>}
      </div>
      {!noKey&&(
        <div style={{display:'flex',gap:8}}>
          <input type={show?'text':'password'} value={value||''} onChange={e=>onChange(e.target.value)}
            placeholder={placeholder} className={isDark?'input-dark':'input-light'}
            style={{flex:1,fontFamily:'monospace',fontSize:12}}/>
          <button onClick={()=>setShow(s=>!s)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'8px 12px',fontSize:11,flexShrink:0}}>
            {show?'Hide':'Show'}
          </button>
        </div>
      )}
      {noKey&&<div style={{fontSize:11,color:sub2,fontStyle:'italic'}}>{placeholder}</div>}
    </div>
  );
}

function NavDots({steps,current,isDark}){
  const accent=isDark?'#C8FF00':'#4400CC';
  const muted=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.15)';
  // Group steps visually
  const groups=[...new Set(steps.filter(s=>s.group).map(s=>s.group))];
  return(
    <div style={{display:'flex',gap:20,alignItems:'center',marginBottom:36,justifyContent:'center',flexWrap:'wrap'}}>
      {groups.map((g,gi)=>{
        const groupSteps=steps.filter(s=>s.group===g);
        const isActive=groupSteps.some(s=>s.id===current);
        const isDone=groupSteps.every(s=>steps.findIndex(x=>x.id===s.id)<steps.findIndex(x=>x.id===current));
        return(
          <div key={g} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
            <div style={{display:'flex',gap:4}}>
              {groupSteps.map(s=>{
                const idx=steps.findIndex(x=>x.id===s.id);
                const curIdx=steps.findIndex(x=>x.id===current);
                const done=idx<curIdx;
                const active=s.id===current;
                return(
                  <div key={s.id} style={{
                    width:active?28:done?10:8,height:8,borderRadius:99,
                    background:active?accent:done?accent+'80':muted,
                    transition:'all 0.3s',
                  }}/>
                );
              })}
            </div>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.12em',textTransform:'uppercase',
              color:isActive?accent:isDone?accent+'60':muted,transition:'all 0.3s'}}>
              {g}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main wizard ─────────────────────────────────────────────────────
export default function FirstRun({onComplete}){
  const{theme,loadChannels}=useApp();
  const isDark=theme==='dark';
  const[step,setStep]=useState('welcome');
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const[ytConnected,setYtConnected]=useState(false);
  const[ytConnecting,setYtConnecting]=useState(false);

  // Form state
  const[keys,setKeys]=useState({claude:'',gemini:'',openai:'',pexels:'',pixabay:'',youtube_client_id:'',youtube_client_secret:'',elevenlabs:''});
  const[budget,setBudget]=useState({daily:5,weekly:20,monthly:80});
  const[channel,setChannel]=useState({name:'',topic:'',preset:'long',voice_engine:'auto',auto_approve:false});

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
  const isFirst=stepIdx===0;
  const isLast=stepIdx===STEPS.length-1;

  function next(){setError('');setStep(STEPS[stepIdx+1].id);}
  function back(){setError('');setStep(STEPS[stepIdx-1].id);}

  async function saveAndNext(){
    setSaving(true);setError('');
    try{
      if(step==='ai_keys'){
        if(!keys.claude&&!keys.gemini)throw new Error('Add at least one AI key — Claude or Gemini — to continue.');
        const clean={};
        Object.entries(keys).forEach(([k,v])=>{if(v)clean[k]=v;});
        await window.forge.updateSettings({apiKeys:clean});
        next();
      } else if(step==='media_keys'){
        const clean={};
        Object.entries(keys).forEach(([k,v])=>{if(v)clean[k]=v;});
        await window.forge.updateSettings({apiKeys:clean});
        next();
      } else if(step==='budget'){
        await window.forge.updateSettings({budget});
        next();
      } else if(step==='youtube'){
        // YouTube is optional at setup
        next();
      } else if(step==='channel'){
        if(!channel.name.trim())throw new Error('Channel name is required.');
        if(!channel.topic.trim())throw new Error('Channel topic is required — the AI needs this to find and write relevant content.');
        await window.forge.createChannel({
          name:channel.name,topic:channel.topic,
          style_prompt:channel.topic,
          preset:channel.preset,
          voice_engine:channel.voice_engine,
          auto_approve:channel.auto_approve,
        });
        await loadChannels();
        next();
      }
    }catch(e){setError(e.message);}
    setSaving(false);
  }

  async function connectYouTube(){
    if(!keys.youtube_client_id||!keys.youtube_client_secret){
      setError('Add your YouTube OAuth Client ID and Secret above first, then click Connect.');
      return;
    }
    setYtConnecting(true);setError('');
    try{
      // Save keys first so the backend has them
      await window.forge.updateSettings({apiKeys:{...keys}});
      // We need a channelId for tokens but we don't have one yet — use a temp placeholder
      await window.forge.youtubeConnect('__setup__');
      setYtConnected(true);
    }catch(e){setError(e.message);}
    setYtConnecting(false);
  }

  const canProceed={
    welcome:true,
    ai_keys:!!(keys.claude||keys.gemini),
    media_keys:true,// optional
    budget:true,
    youtube:true,// optional
    channel:!!(channel.name&&channel.topic),
    done:true,
  }[step];

  // ── Render each step ──────────────────────────────────────────────

  function renderWelcome(){
    return(
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:80,marginBottom:24,lineHeight:1}}>🎬</div>
        <h1 style={{fontSize:32,fontWeight:900,color:text,marginBottom:12,letterSpacing:'-0.02em'}}>Welcome to MediaMill</h1>
        <p style={{fontSize:15,color:muted,lineHeight:1.7,marginBottom:8,maxWidth:420,margin:'0 auto 12px'}}>
          MediaMill turns ideas into published YouTube videos — automatically.
        </p>
        <p style={{fontSize:13,color:sub,lineHeight:1.6,maxWidth:380,margin:'0 auto 36px'}}>
          It finds Canadian content, writes scripts with AI, gathers footage, records narration, composes the video, and uploads to YouTube.
        </p>
        <div style={{display:'flex',flexDirection:'column',gap:8,maxWidth:280,margin:'0 auto'}}>
          <button onClick={next} className="btn btn-primary" style={{fontSize:15,padding:'13px 32px'}}>
            Let's get started →
          </button>
          <div style={{fontSize:11,color:sub}}>Setup takes about 5 minutes</div>
        </div>
      </div>
    );
  }

  function renderAIKeys(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:12}}>🤖</div>
          <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8}}>Connect AI Models</h2>
          <p style={{fontSize:13,color:muted,lineHeight:1.6}}>
            AI writes your scripts, SEO titles, descriptions, and tags.<br/>
            <strong style={{color:text}}>Claude + Gemini is the recommended combination.</strong>
          </p>
        </div>
        <div style={{background:isDark?'rgba(200,255,0,0.04)':'rgba(68,0,204,0.04)',border:'1px solid '+(isDark?'rgba(200,255,0,0.12)':'rgba(68,0,204,0.1)'),borderRadius:10,padding:'10px 14px',marginBottom:16,fontSize:11,color:muted,lineHeight:1.5}}>
          💡 Click <strong style={{color:accent}}>"Get Key ↗"</strong> to sign up, find the API section, copy your key, paste it here.
        </div>
        <KeyInput label="Claude" sub="Anthropic · Best for writing scripts and SEO" badge="Recommended" badgeColor="#C8FF00"
          link="https://console.anthropic.com" placeholder="sk-ant-..." value={keys.claude} onChange={v=>setK('claude',v)} isDark={isDark}/>
        <KeyInput label="Gemini" sub="Google · Free tier · Good for research and asset matching" badge="Recommended" badgeColor="#00C8FF"
          link="https://aistudio.google.com/app/apikey" placeholder="AIza..." value={keys.gemini} onChange={v=>setK('gemini',v)} isDark={isDark}/>
        <KeyInput label="OpenAI" sub="Optional fallback if Claude or Gemini hit rate limits" badge="Optional" badgeColor="#888"
          link="https://platform.openai.com/api-keys" placeholder="sk-..." value={keys.openai} onChange={v=>setK('openai',v)} isDark={isDark}/>
      </div>
    );
  }

  function renderMediaKeys(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:12}}>🖼</div>
          <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8}}>Media & Assets</h2>
          <p style={{fontSize:13,color:muted,lineHeight:1.6}}>
            These provide the video clips and images used in your videos.<br/>
            Wikipedia, Wikimedia Commons, and Internet Archive are always free — no key needed.
          </p>
        </div>
        <KeyInput label="Pexels" sub="Free stock video clips — matched to your script's B-roll cues" badge="Free API" badgeColor="#00E676"
          link="https://www.pexels.com/api/" placeholder="paste key..." value={keys.pexels} onChange={v=>setK('pexels',v)} isDark={isDark}/>
        <KeyInput label="Pixabay" sub="Additional free stock video when Pexels doesn't have a match" badge="Free API" badgeColor="#00E676"
          link="https://pixabay.com/api/docs/" placeholder="paste key..." value={keys.pixabay} onChange={v=>setK('pixabay',v)} isDark={isDark}/>
        <KeyInput label="ElevenLabs" sub="Most realistic AI voices for narration — costs per character" badge="Optional" badgeColor="#888"
          link="https://elevenlabs.io" placeholder="paste key..." value={keys.elevenlabs} onChange={v=>setK('elevenlabs',v)} isDark={isDark}/>
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'12px 16px',fontSize:11,color:muted}}>
          💡 No keys? That's fine. MediaMill will use <strong style={{color:text}}>Windows TTS</strong> (free, built-in) for voice and <strong style={{color:text}}>Wikimedia Commons + Internet Archive</strong> for footage. You can add these later in Settings.
        </div>
      </div>
    );
  }

  function renderBudget(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:12}}>💰</div>
          <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8}}>Set Spending Limits</h2>
          <p style={{fontSize:13,color:muted,lineHeight:1.6}}>
            AI models charge per use. These limits automatically stop all AI tasks if spending gets too high.
            You'll be notified before anything is paused.
          </p>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:16}}>
          {[
            {key:'daily',label:'Daily Limit',desc:'Resets at midnight. Hard stop on all AI tasks.',suggested:'$2 – $5'},
            {key:'weekly',label:'Weekly Limit',desc:'Resets Monday. Safety net if daily keeps getting hit.',suggested:'$10 – $25'},
            {key:'monthly',label:'Monthly Limit',desc:'Hard ceiling — nothing runs until next month.',suggested:'$30 – $80'},
          ].map(l=>(
            <div key={l.key} style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16}}>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:text,marginBottom:2}}>{l.label}</div>
                <div style={{fontSize:11,color:muted,marginBottom:3}}>{l.desc}</div>
                <div style={{fontSize:10,color:isDark?'rgba(200,255,0,0.5)':'rgba(68,0,204,0.5)'}}>Suggested: {l.suggested}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
                <span style={{fontSize:16,color:muted}}>$</span>
                <input type="number" min={0} step={1} value={budget[l.key]}
                  onChange={e=>setBudget(b=>({...b,[l.key]:parseFloat(e.target.value)||0}))}
                  className={isDark?'input-dark':'input-light'} style={{width:80,fontFamily:'monospace',textAlign:'right',fontSize:14}}/>
              </div>
            </div>
          ))}
        </div>
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'12px 16px',fontSize:11,color:muted}}>
          💡 These are conservative defaults. A typical 10-minute video costs about $0.10–$0.50 in AI fees depending on the model. You can change these any time in Settings → Budget.
        </div>
      </div>
    );
  }

  function renderYouTube(){
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:12}}>▶️</div>
          <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8}}>Connect YouTube</h2>
          <p style={{fontSize:13,color:muted,lineHeight:1.6}}>
            MediaMill uploads finished videos directly to your YouTube channel.<br/>
            This step is optional — you can always connect later in Settings.
          </p>
        </div>

        {/* OAuth credential setup */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,overflow:'hidden',marginBottom:14}}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid '+cardBorder}}>
            <div style={{fontSize:13,fontWeight:700,color:text,marginBottom:4}}>Step 1 — Create OAuth Credentials</div>
            <div style={{fontSize:11,color:muted,lineHeight:1.5}}>
              You need a free Google Cloud project with OAuth 2.0 credentials.
              This is a one-time setup — takes about 3 minutes.
            </div>
          </div>
          <div style={{padding:'14px 16px'}}>
            <div style={{display:'flex',flexDirection:'column',gap:8,marginBottom:12}}>
              {[
                'Go to Google Cloud Console → Create a new project',
                'Enable the YouTube Data API v3',
                'Go to APIs & Services → Credentials → Create OAuth Client ID',
                'Choose "Desktop app" as the application type',
                'Download or copy the Client ID and Client Secret',
              ].map((s,i)=>(
                <div key={i} style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:11,color:muted}}>
                  <span style={{width:18,height:18,borderRadius:'50%',background:accent+'20',color:accent,display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,fontWeight:700,flexShrink:0,marginTop:1}}>{i+1}</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer"
              className="btn" style={{fontSize:11,padding:'7px 14px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',textDecoration:'none',display:'inline-flex'}}>
              Open Google Cloud Console ↗
            </a>
          </div>
        </div>

        <KeyInput label="OAuth Client ID" sub="From Google Cloud → APIs & Services → Credentials"
          placeholder="xxxxxx.apps.googleusercontent.com" value={keys.youtube_client_id} onChange={v=>setK('youtube_client_id',v)} isDark={isDark}/>
        <KeyInput label="OAuth Client Secret" sub="From the same credential in Google Cloud"
          placeholder="GOCSPX-..." value={keys.youtube_client_secret} onChange={v=>setK('youtube_client_secret',v)} isDark={isDark}/>

        {/* Connect button */}
        <div style={{background:card,border:'1px solid '+(ytConnected?'rgba(0,230,118,0.3)':cardBorder),borderRadius:14,padding:'16px',textAlign:'center',marginTop:4}}>
          {ytConnected?(
            <div>
              <div style={{fontSize:24,marginBottom:8}}>✅</div>
              <div style={{fontSize:14,fontWeight:700,color:'#00E676',marginBottom:4}}>YouTube Connected!</div>
              <div style={{fontSize:11,color:muted}}>Your account is authorized. Videos will upload automatically.</div>
            </div>
          ):(
            <div>
              <div style={{fontSize:13,color:muted,marginBottom:12}}>
                Step 2 — Click below to open your browser and authorize MediaMill.<br/>
                <span style={{fontSize:11,color:sub}}>You'll be redirected back automatically.</span>
              </div>
              <button onClick={connectYouTube} disabled={ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret}
                className="btn btn-primary" style={{fontSize:13,padding:'10px 24px',opacity:ytConnecting||!keys.youtube_client_id||!keys.youtube_client_secret?0.5:1}}>
                {ytConnecting?'⟳ Waiting for authorization…':'🔗 Connect YouTube Account'}
              </button>
              {(!keys.youtube_client_id||!keys.youtube_client_secret)&&(
                <div style={{fontSize:10,color:sub,marginTop:8}}>Add Client ID and Secret above first</div>
              )}
            </div>
          )}
        </div>

        <div style={{textAlign:'center',marginTop:14}}>
          <button onClick={next} style={{fontSize:11,color:sub,background:'transparent',border:'none',cursor:'pointer',textDecoration:'underline'}}>
            Skip for now — connect YouTube later in Settings
          </button>
        </div>
      </div>
    );
  }

  function renderChannel(){
    const PC={short:'#C8FF00',mid:'#00C8FF',long:'#FF8040'};
    return(
      <div>
        <div style={{textAlign:'center',marginBottom:24}}>
          <div style={{fontSize:48,marginBottom:12}}>📡</div>
          <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8}}>Create Your First Channel</h2>
          <p style={{fontSize:13,color:muted,lineHeight:1.6}}>
            Each channel is a separate YouTube presence with its own topic, style, and upload schedule.
            You can create more channels later.
          </p>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {/* Name */}
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'14px 16px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:sub,marginBottom:8}}>Channel Name</div>
            <input value={channel.name} onChange={e=>setCh('name',e.target.value)}
              placeholder="e.g. Due North News" className={isDark?'input-dark':'input-light'}/>
          </div>

          {/* Topic */}
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'14px 16px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:sub,marginBottom:4}}>Channel Topic *</div>
            <div style={{fontSize:11,color:muted,marginBottom:8}}>
              The AI uses this to find relevant content and write scripts. The more specific, the better.
            </div>
            <textarea value={channel.topic} onChange={e=>setCh('topic',e.target.value)} rows={3}
              placeholder="e.g. Unbiased Canadian political news, focusing on federal government accountability and policy decisions"
              className={isDark?'input-dark':'input-light'} style={{resize:'none',marginBottom:10}}/>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['Canadian political news','Canadian WWII history and veterans','True crime stories from Canada','Canadian economic news and analysis','Indigenous Canadian history and culture'].map(ex=>(
                <button key={ex} onClick={()=>setCh('topic',ex)}
                  style={{fontSize:10,padding:'3px 10px',borderRadius:8,border:'1px solid '+cardBorder,background:'transparent',color:muted,cursor:'pointer',transition:'all 0.1s'}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor=accent;e.currentTarget.style.color=accent;}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor=cardBorder;e.currentTarget.style.color=muted;}}>
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'14px 16px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:sub,marginBottom:10}}>Video Format</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
              {[{id:'short',label:'Shorts',desc:'Under 60 seconds',icon:'⚡'},{id:'mid',label:'Mid-Form',desc:'5 – 20 minutes',icon:'📰'},{id:'long',label:'Long-Form',desc:'20 – 90 minutes',icon:'🎬'}].map(p=>{
                const sel=channel.preset===p.id;const color=PC[p.id];
                return(
                  <div key={p.id} onClick={()=>setCh('preset',p.id)} style={{
                    padding:'14px 10px',textAlign:'center',cursor:'pointer',borderRadius:10,
                    background:sel?color+'10':'transparent',
                    border:'1px solid '+(sel?color+'50':cardBorder),
                    boxShadow:sel?'0 0 14px '+color+'20':'none',transition:'all 0.12s',
                  }}>
                    <div style={{fontSize:22,marginBottom:4}}>{p.icon}</div>
                    <div style={{fontSize:12,fontWeight:700,color:sel?color:text,marginBottom:2}}>{p.label}</div>
                    <div style={{fontSize:10,color:muted}}>{p.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Voice */}
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'14px 16px'}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.16em',textTransform:'uppercase',color:sub,marginBottom:8}}>Voice Engine</div>
            <select value={channel.voice_engine} onChange={e=>setCh('voice_engine',e.target.value)}
              className={isDark?'input-dark':'input-light'}>
              <option value="auto">Auto — AI picks cheapest available</option>
              <option value="windows">Windows TTS (free, built-in)</option>
              <option value="elevenlabs">ElevenLabs (most realistic)</option>
              <option value="playht">Play.ht</option>
              <option value="coqui">Coqui TTS (free, local)</option>
            </select>
          </div>

          {/* Auto-approve */}
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,padding:'14px 16px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:text,marginBottom:3}}>Auto-approve videos</div>
              <div style={{fontSize:11,color:muted}}>Pipeline runs fully automatically without manual review. You can change this later.</div>
            </div>
            <div onClick={()=>setCh('auto_approve',!channel.auto_approve)}
              className="toggle"
              style={{background:channel.auto_approve?'rgba(200,255,0,0.12)':'rgba(255,255,255,0.06)',border:'1px solid '+(channel.auto_approve?'rgba(200,255,0,0.3)':'rgba(255,255,255,0.1)')}}>
              <div className="toggle-thumb" style={{left:channel.auto_approve?20:3,background:channel.auto_approve?'#C8FF00':'rgba(255,255,255,0.3)'}}/>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderDone(){
    return(
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:80,marginBottom:24,lineHeight:1}}>🚀</div>
        <h2 style={{fontSize:26,fontWeight:900,color:text,marginBottom:12}}>You're all set!</h2>
        <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:340,margin:'0 auto 32px',textAlign:'left'}}>
          {[
            {icon:'💡',text:'Go to Pipeline → Ideas and scan for content'},
            {icon:'✓',text:'Approve an idea you like'},
            {icon:'▶',text:'Hit "Run Full Pipeline" — sit back'},
            {icon:'👁',text:'Review the finished video before it publishes'},
          ].map((s,i)=>(
            <div key={i} style={{display:'flex',gap:12,alignItems:'flex-start',padding:'10px 14px',background:card,border:'1px solid '+cardBorder,borderRadius:10}}>
              <span style={{fontSize:18,flexShrink:0}}>{s.icon}</span>
              <span style={{fontSize:13,color:text,lineHeight:1.4}}>{s.text}</span>
            </div>
          ))}
        </div>
        <button onClick={onComplete} className="btn btn-primary" style={{fontSize:15,padding:'13px 40px'}}>
          Open MediaMill →
        </button>
      </div>
    );
  }

  const renderStep={welcome:renderWelcome,ai_keys:renderAIKeys,media_keys:renderMediaKeys,budget:renderBudget,youtube:renderYouTube,channel:renderChannel,done:renderDone};

  return(
    <div style={{position:'fixed',inset:0,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:9999,padding:24,overflowY:'auto'}}>
      <div style={{width:'100%',maxWidth:560}}>

        {/* Nav dots */}
        {step!=='welcome'&&step!=='done'&&<NavDots steps={STEPS} current={step} isDark={isDark}/>}

        {/* Card */}
        <div style={{
          background:isDark?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.7)',
          border:'1px solid '+(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'),
          borderRadius:20,
          boxShadow:isDark?'0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.06)':'0 16px 48px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,1)',
          padding:step==='welcome'||step==='done'?40:28,
          backdropFilter:'blur(20px)',
        }}>
          {renderStep[step]?.()}

          {/* Error */}
          {error&&<div style={{marginTop:14,padding:'10px 14px',borderRadius:10,background:'rgba(238,34,68,0.08)',border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',fontSize:12,lineHeight:1.4}}>{error}</div>}

          {/* Nav buttons */}
          {step!=='welcome'&&step!=='done'&&step!=='youtube'&&(
            <div style={{display:'flex',gap:10,marginTop:24}}>
              {!isFirst&&<button onClick={back} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'10px 20px'}}>← Back</button>}
              <button onClick={saveAndNext} disabled={saving||!canProceed}
                className="btn btn-primary"
                style={{flex:1,padding:'11px',fontSize:13,opacity:saving||!canProceed?0.5:1}}>
                {saving?'Saving…':step==='channel'?'Create Channel →':'Save & Continue →'}
              </button>
            </div>
          )}
          {step==='youtube'&&(
            <div style={{display:'flex',gap:10,marginTop:24}}>
              <button onClick={back} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'10px 20px'}}>← Back</button>
              <button onClick={saveAndNext} className="btn btn-primary" style={{flex:1,padding:'11px',fontSize:13}}>
                {ytConnected?'Continue →':'Skip for now →'}
              </button>
            </div>
          )}
        </div>

        {/* Step label */}
        {step!=='welcome'&&step!=='done'&&(
          <div style={{textAlign:'center',marginTop:16,fontSize:11,color:sub}}>
            Step {stepIdx} of {STEPS.length-2} — {STEPS[stepIdx].title}
          </div>
        )}
      </div>
    </div>
  );
}
