import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';
import{useI18n,LANGUAGES}from '../../i18n';
import{CAPTION_LANGUAGES}from '../../i18n/translations';
import ErrorLog from '../views/ErrorLog';

const SECTIONS=[
  {id:'general',  icon:'🏠',label:'General',      desc:'App behavior & startup'},
  {id:'notifs',   icon:'🔔',label:'Notifications', desc:'Alerts, sounds & log'},
  {id:'language', icon:'🌐',label:'Language',      desc:'App & subtitle languages'},
  {id:'ai',       icon:'🤖',label:'AI Models',     desc:'Who does the work'},
  {id:'media',    icon:'🎬',label:'Media Sources', desc:'Where content comes from'},
  {id:'voice',    icon:'🎙',label:'Voice & Audio', desc:'TTS engines'},
  {id:'publish',  icon:'🚀',label:'Publishing',    desc:'YouTube settings'},
  {id:'budget',   icon:'💰',label:'Budget & Limits',desc:'Spending controls'},
  {id:'storage',  icon:'💾',label:'Storage',       desc:'File locations'},
  {id:'advanced', icon:'⚙️',label:'Advanced',      desc:'Power user options'},
  {id:'errors',   icon:'🐛',label:'Error Log',     desc:'Runtime errors & warnings'},
];

const AI_KEYS=[
  {key:'claude',label:'Claude',badge:'Recommended',bc:'#C8FF00',icon:'🧠',company:'Anthropic',link:'https://console.anthropic.com',ph:'sk-ant-...',what:'Writes scripts, SEO titles, descriptions, tags, and analyzes performance.',when:'Script generation, SEO, analytics.'},
  {key:'gemini',label:'Gemini',badge:'Recommended',bc:'#00C8FF',icon:'✨',company:'Google',link:'https://aistudio.google.com/app/apikey',ph:'AIza...',what:'Research, fact-checking, asset matching, high-volume cheap tasks.',when:'Content research, asset gathering, validation.'},
  {key:'openai',label:'OpenAI (GPT-4)',badge:'Optional',bc:'#888',icon:'⚡',company:'OpenAI',link:'https://platform.openai.com/api-keys',ph:'sk-...',what:'Fallback if Claude or Gemini hit rate limits.',when:'Only when primary models are unavailable.'},
];
const MEDIA_KEYS=[
  {key:'pexels',label:'Pexels',icon:'📷',company:'Pexels',link:'https://www.pexels.com/api/',ph:'paste key...',what:'Free stock video clips matched to B-roll cues in your script.',free:true},
  {key:'pixabay',label:'Pixabay',icon:'🖼',company:'Pixabay',link:'https://pixabay.com/api/docs/',ph:'paste key...',what:'Backup free stock images and video when Pexels doesn\'t have a match.',free:true},
  {key:'youtube_data',label:'YouTube Data API',icon:'▶️',company:'Google Cloud',link:'https://console.cloud.google.com',ph:'AIza...',what:'Upload videos and pull analytics — views, watch time, revenue estimates.',free:false},
];
const VOICE_ENGINES=[
  {key:'elevenlabs',label:'ElevenLabs',icon:'🎤',link:'https://elevenlabs.io',ph:'paste key...',what:'Most realistic voices. Best quality, costs per character.',cost:'~$0.30/1K chars'},
  {key:'playht',label:'Play.ht',icon:'🔊',link:'https://play.ht',ph:'paste key...',what:'High quality, large voice library. Good cost/quality balance.',cost:'~$0.10/1K chars'},
  {key:'coqui',label:'Coqui TTS',icon:'🐸',link:'https://coqui.ai',ph:'local install — no key',what:'Runs on your PC, completely free. Requires Python installed.',cost:'Free'},
  {key:'windows_tts',label:'Windows TTS',icon:'💻',link:'',ph:'built-in — no key needed',what:'Uses Windows built-in voices. Free, lower quality, good for testing.',cost:'Free'},
];

function KeyField({ph,value,onChange,isDark,hasToggle=true}){
  const[show,setShow]=useState(false);
  return(
    <div style={{display:'flex',gap:8}}>
      <input type={show?'text':'password'} value={value||''} onChange={e=>onChange(e.target.value)}
        placeholder={ph} className={isDark?'input-dark':'input-light'}
        style={{flex:1,fontFamily:'monospace',fontSize:12}}
        readOnly={ph.startsWith('built')||ph.startsWith('local')}/>
      {hasToggle&&!ph.startsWith('built')&&!ph.startsWith('local')&&(
        <button onClick={()=>setShow(s=>!s)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'8px 12px',fontSize:11,flexShrink:0}}>
          {show?'Hide':'Show'}
        </button>
      )}
    </div>
  );
}

function Card({children,isDark}){
  return(
    <div style={{
      background:isDark?'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))':'linear-gradient(145deg,#fff,#f8f8ff)',
      border:'1px solid '+(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'),
      borderRadius:14,
      boxShadow:isDark?'0 4px 20px rgba(0,0,0,0.3),inset 0 1px 0 rgba(255,255,255,0.07)':'0 2px 12px rgba(0,0,0,0.06),inset 0 1px 0 #fff',
      overflow:'hidden',marginBottom:12,
    }}>{children}</div>
  );
}

export default function Settings(){
  const{theme,mode,setMode,settingsTab,setSettingsTab}=useApp();
  const{t,lang,setLang}=useI18n();
  const isDark=theme==='dark';
  const[active,setActive]=useState(settingsTab||'general');
  useEffect(()=>{if(settingsTab)setActive(settingsTab);},[settingsTab]);
  const[keys,setKeys]=useState({});
  const[budget,setBudget]=useState({daily:5,weekly:20,monthly:80});
  const[saved,setSaved]=useState(false);
  const[appPrefs,setAppPrefs]=useState({
    minimizeToTray:false,
    runOnStartup:false,
    notificationsEnabled:true,
    notifSound:true,
    soundEnabled:true,
    soundVolume:0.4,
    notifTypes:{success:true,error:true,warning:true,info:true,system:true},
  });

  useEffect(()=>{
    window.forge.getSettings().then(s=>{
      setKeys(s.apiKeys||{});
      if(s.budget)setBudget(s.budget);
      if(s.appPrefs)setAppPrefs(p=>({...p,...s.appPrefs}));
    }).catch(()=>{});
    // Sync autostart
    window.forge.getAutostart?.().then(v=>setAppPrefs(p=>({...p,runOnStartup:v||false}))).catch(()=>{});
  },[]);

  async function save(){
    try{
      await window.forge.updateSettings({apiKeys:keys,budget,appPrefs});
      // Sync tray
      if(appPrefs.minimizeToTray)window.forge.enableTray?.();
      else window.forge.disableTray?.();
      await window.forge.setAutostart?.(appPrefs.runOnStartup);
      try{
        const{setSoundEnabled,setSoundVolume}=await import('../../utils/sounds.js');
        setSoundEnabled(appPrefs.soundEnabled);
        setSoundVolume(appPrefs.soundVolume);
      }catch(e){}
      setSaved(true);setTimeout(()=>setSaved(false),2500);
    }catch(e){}
  }

  function setPref(k,v){setAppPrefs(p=>({...p,[k]:v}));}

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.45)':'rgba(0,0,20,0.5)';
  const sub=isDark?'rgba(255,255,255,0.28)':'rgba(0,0,20,0.35)';
  const navBg=isDark?'rgba(8,8,18,0.7)':'rgba(232,232,248,0.8)';
  const navBorder=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)';
  const rowBorder=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  const cardBorder=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const setK=(k,v)=>setKeys(ks=>({...ks,[k]:v}));

  // Toggle component
  function Toggle({value,onChange,label,desc}){
    return(
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
        padding:'11px 14px',borderRadius:10,background:card,border:'1px solid '+cardBorder,marginBottom:6}}>
        <div>
          <div style={{fontSize:12,fontWeight:600,color:text}}>{label}</div>
          {desc&&<div style={{fontSize:10,color:muted,marginTop:2}}>{desc}</div>}
        </div>
        <div onClick={()=>onChange(!value)} style={{
          width:38,height:22,borderRadius:99,cursor:'pointer',flexShrink:0,
          background:value?accent:'rgba(255,255,255,0.1)',
          border:'2px solid '+(value?accent:'rgba(255,255,255,0.15)'),
          position:'relative',transition:'all 0.2s',
        }}>
          <div style={{
            position:'absolute',top:2,
            left:value?'calc(100% - 18px)':2,
            width:14,height:14,borderRadius:'50%',
            background:value?'#000':'rgba(255,255,255,0.5)',
            transition:'left 0.2s',
          }}/>
        </div>
      </div>
    );
  }

  const renderGeneral=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>General</h3>
      <p style={{fontSize:12,color:muted,marginBottom:20,lineHeight:1.5}}>App behavior, startup, and window options.</p>

      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:8}}>Window</div>
      <Toggle value={appPrefs.minimizeToTray} onChange={v=>setPref('minimizeToTray',v)}
        label="Minimize to system tray"
        desc="Closing or minimizing hides the window to the taskbar tray instead of quitting"/>
      <Toggle value={appPrefs.runOnStartup} onChange={v=>setPref('runOnStartup',v)}
        label="Run on system startup"
        desc="MediaMill starts automatically when you log into Windows"/>

      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:sub,margin:'20px 0 8px'}}>Appearance</div>
      <div style={{display:'flex',gap:8,marginBottom:6}}>
        {['dark','light'].map(t=>(
          <button key={t} onClick={async()=>{const{setTheme}=await import('../../context/AppContext').catch(()=>({}));
            try{await window.forge.updateSettings({theme:t});}catch(e){}
            // trigger theme via settings update — reload will pick it up
            window.location.reload();
          }}
            style={{flex:1,padding:'10px',borderRadius:10,border:'2px solid '+(theme===t?accent:cardBorder),
              background:theme===t?accent+'10':card,color:theme===t?accent:muted,
              cursor:'pointer',fontSize:12,fontWeight:theme===t?700:400,transition:'all 0.15s'}}>
            {t==='dark'?'🌙 Dark':'☀️ Light'}
          </button>
        ))}
      </div>

      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:sub,margin:'20px 0 8px'}}>Operation Mode</div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        {[
          {id:'manual',   icon:'🛠',label:'Manual',      desc:'You control everything — MediaMill is just an organizer and editor'},
          {id:'assisted', icon:'🤝',label:'Assisted',    desc:'AI suggests everything, you approve every step before it runs'},
          {id:'semi',     icon:'⚡',label:'Semi-Auto',   desc:'AI runs automatically, prompts you at key decisions (script, thumbnail)'},
          {id:'auto',     icon:'🚀',label:'Full Auto',   desc:'Lights out — scans, scripts, voices, composes and publishes with zero input'},
        ].map(m=>{
          const isSel=mode===m.id||(m.id==='semi'&&mode==='simple')||(m.id==='auto'&&mode==='advanced');
          return(
            <div key={m.id} onClick={()=>setMode(m.id)}
              style={{padding:'11px 14px',borderRadius:10,
                border:'2px solid '+(mode===m.id?accent+'50':cardBorder),
                background:mode===m.id?accent+'06':card,
                cursor:'pointer',display:'flex',gap:12,alignItems:'center',transition:'all 0.12s'}}>
              <span style={{fontSize:20}}>{m.icon}</span>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:700,color:mode===m.id?accent:text}}>{m.label}</div>
                <div style={{fontSize:10,color:muted,marginTop:2}}>{m.desc}</div>
              </div>
              {mode===m.id&&<span style={{fontSize:10,fontWeight:700,color:accent}}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderNotifs=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>Notifications</h3>
      <p style={{fontSize:12,color:muted,marginBottom:20,lineHeight:1.5}}>Control every alert — visual, audio, and what gets logged.</p>

      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:sub,marginBottom:8}}>Master Controls</div>
      <Toggle value={appPrefs.notificationsEnabled} onChange={v=>setPref('notificationsEnabled',v)}
        label="Enable notifications"
        desc="Show toast alerts for events. Disabling this silences all popups."/>
      <Toggle value={appPrefs.notifSound} onChange={v=>setPref('notifSound',v)}
        label="Notification sounds"
        desc="Play a sound when notifications appear"/>
      <Toggle value={appPrefs.soundEnabled} onChange={v=>setPref('soundEnabled',v)}
        label="UI interaction sounds"
        desc="Subtle chimes when navigating and clicking"/>

      <div style={{padding:'12px 14px',borderRadius:10,background:card,border:'1px solid '+cardBorder,marginBottom:6}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
          <div style={{fontSize:12,fontWeight:600,color:text}}>Sound volume</div>
          <span style={{fontSize:11,fontWeight:700,color:accent}}>{Math.round(appPrefs.soundVolume*100)}%</span>
        </div>
        <input type="range" min={0} max={1} step={0.05} value={appPrefs.soundVolume}
          onChange={e=>setPref('soundVolume',parseFloat(e.target.value))}
          style={{width:'100%',accentColor:accent}}/>
        <div style={{display:'flex',justifyContent:'space-between',fontSize:9,color:sub,marginTop:4}}>
          <span>Silent</span><span>Full</span>
        </div>
      </div>

      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:sub,margin:'20px 0 8px'}}>Notify Me When</div>
      {[
        {key:'success',icon:'✓',label:'Video completed / uploaded',color:'#00E676'},
        {key:'error',  icon:'✕',label:'Errors and failures',color:'#EE2244'},
        {key:'warning',icon:'⚠',label:'Warnings and degraded service',color:'#FFAA00'},
        {key:'info',   icon:'ℹ',label:'Info and status updates',color:'#00C8FF'},
        {key:'system', icon:'⚙',label:'System events (scheduler, updates)',color:'#A060FF'},
      ].map(t=>(
        <div key={t.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'9px 14px',borderRadius:9,background:card,border:'1px solid '+cardBorder,marginBottom:5}}>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <div style={{width:22,height:22,borderRadius:6,background:t.color+'15',border:'1px solid '+t.color+'25',
              display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,color:t.color,fontWeight:900}}>
              {t.icon}
            </div>
            <span style={{fontSize:12,color:text}}>{t.label}</span>
          </div>
          <div onClick={()=>setPref('notifTypes',{...appPrefs.notifTypes,[t.key]:!appPrefs.notifTypes?.[t.key]})}
            style={{width:34,height:20,borderRadius:99,cursor:'pointer',
              background:appPrefs.notifTypes?.[t.key]!==false?accent:'rgba(255,255,255,0.1)',
              border:'2px solid '+(appPrefs.notifTypes?.[t.key]!==false?accent:'rgba(255,255,255,0.15)'),
              position:'relative',transition:'all 0.2s',flexShrink:0}}>
            <div style={{position:'absolute',top:2,
              left:appPrefs.notifTypes?.[t.key]!==false?'calc(100% - 16px)':2,
              width:12,height:12,borderRadius:'50%',
              background:appPrefs.notifTypes?.[t.key]!==false?'#000':'rgba(255,255,255,0.5)',
              transition:'left 0.2s'}}/>
          </div>
        </div>
      ))}

      <div style={{fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:'0.12em',color:sub,margin:'20px 0 8px'}}>Test</div>
      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
        {[
          {label:'Success',type:'success'},
          {label:'Warning',type:'warning'},
          {label:'Error',  type:'error'},
          {label:'Info',   type:'info'},
          {label:'System', type:'system'},
        ].map(b=>(
          <button key={b.type} onClick={async()=>{
            const{notify}=await import('../../utils/notifications.js');
            notify[b.type](`Test ${b.label}`,{message:'This is how it looks. Click to dismiss.'});
          }}
            style={{padding:'6px 12px',borderRadius:8,fontSize:11,cursor:'pointer',
              background:card,border:'1px solid '+cardBorder,color:muted}}>
            Test {b.label}
          </button>
        ))}
      </div>
    </div>
  );

  const renderAI=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>AI Models</h3>
      <p style={{fontSize:12,color:muted,marginBottom:16,lineHeight:1.5}}>MediaMill uses multiple AI models and auto-assigns each task to the best model. <strong style={{color:text}}>Claude + Gemini is the recommended combo.</strong> Click "Get Key →" to sign up for free, find the API section, and paste your key below.</p>
      {AI_KEYS.map(f=>(
        <Card key={f.key} isDark={isDark}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid '+rowBorder}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>{f.icon}</span>
                <div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:700,color:text}}>{f.label}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99,background:f.bc+'18',color:f.bc,border:'1px solid '+f.bc+'30'}}>{f.badge}</span>
                  </div>
                  <div style={{fontSize:10,color:sub}}>{f.company}</div>
                </div>
              </div>
              <a href={f.link} target="_blank" rel="noreferrer" className="btn" style={{fontSize:10,padding:'5px 10px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',textDecoration:'none'}}>Get Key ↗</a>
            </div>
            <p style={{fontSize:11,color:muted,margin:0,lineHeight:1.4}}>{f.what} <span style={{color:sub}}>Runs during: {f.when}</span></p>
          </div>
          <div style={{padding:'12px 16px'}}><KeyField ph={f.ph} value={keys[f.key]} onChange={v=>setK(f.key,v)} isDark={isDark}/></div>
        </Card>
      ))}
    </div>
  );

  const renderMedia=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>Media Sources</h3>
      <p style={{fontSize:12,color:muted,marginBottom:16,lineHeight:1.5}}>Images and video clips for your videos. Wikipedia, Internet Archive, and Wikimedia Commons are always searched for free — no key needed.</p>
      {MEDIA_KEYS.map(f=>(
        <Card key={f.key} isDark={isDark}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid '+rowBorder}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>{f.icon}</span>
                <div>
                  <div style={{display:'flex',gap:8,alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:700,color:text}}>{f.label}</span>
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99,background:f.free?'rgba(0,230,118,0.12)':'rgba(255,170,0,0.12)',color:f.free?'#00E676':'#FFAA00',border:'1px solid '+(f.free?'rgba(0,230,118,0.2)':'rgba(255,170,0,0.2)')}}>{f.free?'Free API':'Paid'}</span>
                  </div>
                  <div style={{fontSize:10,color:sub}}>{f.company}</div>
                </div>
              </div>
              {f.link&&<a href={f.link} target="_blank" rel="noreferrer" className="btn" style={{fontSize:10,padding:'5px 10px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',textDecoration:'none'}}>Get Key ↗</a>}
            </div>
            <p style={{fontSize:11,color:muted,margin:0,lineHeight:1.4}}>{f.what}</p>
          </div>
          <div style={{padding:'12px 16px'}}><KeyField ph={f.ph} value={keys[f.key]} onChange={v=>setK(f.key,v)} isDark={isDark}/></div>
        </Card>
      ))}
    </div>
  );

  const renderVoice=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>Voice & Audio</h3>
      <p style={{fontSize:12,color:muted,marginBottom:16,lineHeight:1.5}}>AI reads your script aloud. Default engine is set per channel. The AI assigner picks the cheapest available unless you override.</p>
      {VOICE_ENGINES.map(f=>(
        <Card key={f.key} isDark={isDark}>
          <div style={{padding:'14px 16px',borderBottom:'1px solid '+rowBorder}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:6}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <span style={{fontSize:20}}>{f.icon}</span>
                <div style={{display:'flex',gap:8,alignItems:'center'}}>
                  <span style={{fontSize:13,fontWeight:700,color:text}}>{f.label}</span>
                  <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99,background:f.cost==='Free'?'rgba(0,230,118,0.12)':'rgba(0,200,255,0.12)',color:f.cost==='Free'?'#00E676':'#00C8FF',border:'1px solid '+(f.cost==='Free'?'rgba(0,230,118,0.2)':'rgba(0,200,255,0.2)')}}>{f.cost}</span>
                </div>
              </div>
              {f.link&&<a href={f.link} target="_blank" rel="noreferrer" className="btn" style={{fontSize:10,padding:'5px 10px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',textDecoration:'none'}}>Sign Up ↗</a>}
            </div>
            <p style={{fontSize:11,color:muted,margin:0,lineHeight:1.4}}>{f.what}</p>
          </div>
          <div style={{padding:'12px 16px'}}><KeyField ph={f.ph} value={keys[f.key]} onChange={v=>setK(f.key,v)} isDark={isDark}/></div>
        </Card>
      ))}
    </div>
  );

  const renderBudget=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>Budget & Limits</h3>
      <p style={{fontSize:12,color:muted,marginBottom:16,lineHeight:1.5}}>AI models charge per use. These limits stop everything automatically when hit. No videos run until you review.</p>
      <Card isDark={isDark}>
        {[{key:'daily',label:'Daily Limit',desc:'Resets midnight. Hard stop on all AI tasks.',sug:'$2–$5'},{key:'weekly',label:'Weekly Limit',desc:'Resets Monday. Safety net if daily keeps getting hit.',sug:'$10–$25'},{key:'monthly',label:'Monthly Limit',desc:'Hard ceiling. Nothing runs until next billing cycle.',sug:'$30–$80'}].map((l,i,arr)=>(
          <div key={l.key} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'14px 18px',borderBottom:i<arr.length-1?'1px solid '+rowBorder:'none'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:text,marginBottom:2}}>{l.label}</div>
              <div style={{fontSize:11,color:muted}}>{l.desc}</div>
              <div style={{fontSize:10,color:accent,opacity:0.6,marginTop:2}}>Suggested: {l.sug}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:6}}>
              <span style={{color:muted}}>$</span>
              <input type="number" min={0} value={budget[l.key]||0} onChange={e=>setBudget(b=>({...b,[l.key]:parseFloat(e.target.value)||0}))}
                className={isDark?'input-dark':'input-light'} style={{width:80,fontFamily:'monospace',textAlign:'right'}}/>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );

  const renderPublish=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>Publishing</h3>
      <p style={{fontSize:12,color:muted,marginBottom:16,lineHeight:1.5}}>YouTube OAuth is connected per channel — go to Channels tab to authorize each one. This API key is shared for reading analytics across all channels.</p>
      <Card isDark={isDark}>
        <div style={{padding:'16px 18px'}}>
          <div style={{fontSize:13,fontWeight:600,color:text,marginBottom:4}}>YouTube Data API Key</div>
          <div style={{fontSize:11,color:muted,marginBottom:12}}>Required to upload videos and pull analytics from YouTube Studio.</div>
          <a href="https://console.cloud.google.com" target="_blank" rel="noreferrer" className="btn" style={{fontSize:10,padding:'5px 10px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',textDecoration:'none',display:'inline-flex',marginBottom:12}}>Google Cloud Console ↗</a>
          <KeyField ph="AIza..." value={keys.youtube_data} onChange={v=>setK('youtube_data',v)} isDark={isDark}/>
        </div>
      </Card>
    </div>
  );

  const renderStorage=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>Storage</h3>
      <p style={{fontSize:12,color:muted,marginBottom:16}}>All files stay on your machine. Nothing is uploaded to any cloud without your permission.</p>
      <Card isDark={isDark}>
        {[{l:'Database',p:'%APPDATA%\\MediaMill\\forge.db',d:'Channels, videos, ideas, tasks'},{l:'Scripts',p:'%APPDATA%\\MediaMill\\scripts\\',d:'Generated scripts + SEO data'},{l:'Assets',p:'%APPDATA%\\MediaMill\\assets\\',d:'Downloaded images and clips'},{l:'Voice',p:'%APPDATA%\\MediaMill\\voice\\',d:'Rendered audio files'},{l:'Videos',p:'%APPDATA%\\MediaMill\\output\\',d:'Final rendered videos'}].map((s,i,arr)=>(
          <div key={s.l} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 18px',borderBottom:i<arr.length-1?'1px solid '+rowBorder:'none'}}>
            <div><div style={{fontSize:12,fontWeight:600,color:text}}>{s.l}</div><div style={{fontSize:10,color:muted}}>{s.d}</div></div>
            <div style={{fontSize:10,fontFamily:'monospace',color:isDark?'rgba(200,255,0,0.55)':'rgba(68,0,204,0.55)'}}>{s.p}</div>
          </div>
        ))}
      </Card>
    </div>
  );

  const renderAdvanced=()=>{
    const isAdv=mode==='advanced';
    return(
      <div>
        <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>Advanced</h3>
        <p style={{fontSize:12,color:muted,marginBottom:16}}>Enables Agent Manager, Task Queue, and Prompt Library tabs. For developers and power users who want full control over the pipeline.</p>
        <Card isDark={isDark}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 18px'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:text,marginBottom:3}}>Advanced Mode</div>
              <div style={{fontSize:11,color:muted}}>Shows agent config, task queue, and prompt editor in the main nav.</div>
            </div>
            <div onClick={async()=>{const n=isAdv?'simple':'advanced';setMode(n);try{await window.forge.updateSettings({mode:n});}catch(e){}}}
              className="toggle" style={{background:isAdv?'rgba(160,80,255,0.15)':'rgba(255,255,255,0.06)',border:'1px solid '+(isAdv?'rgba(160,80,255,0.3)':'rgba(255,255,255,0.1)')}}>
              <div className="toggle-thumb" style={{left:isAdv?20:3,background:isAdv?'#B060FF':'rgba(255,255,255,0.3)'}}/>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  const renderLanguage=()=>(
    <div>
      <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:6}}>🌐 Language</h3>
      <p style={{fontSize:12,color:muted,marginBottom:20,lineHeight:1.5}}>Choose the language for the MediaMill interface. YouTube subtitles and AI translations are configured per-video in Creator Tools.</p>

      {/* App UI language */}
      <div style={{marginBottom:24}}>
        <div style={{fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:12}}>App Interface Language</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
          {LANGUAGES.map(l=>{
            const sel=lang===l.code;
            return(
              <div key={l.code} onClick={()=>setLang(l.code)}
                style={{padding:'12px 14px',borderRadius:12,border:'2px solid '+(sel?accent+'50':isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)'),
                  background:sel?accent+'08':'transparent',cursor:'pointer',transition:'all 0.15s',
                  display:'flex',gap:10,alignItems:'center'}}
                onMouseEnter={e=>{if(!sel)e.currentTarget.style.borderColor=accent+'30';}}
                onMouseLeave={e=>{if(!sel)e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.08)';}}>
                <span style={{fontSize:20}}>{l.flag}</span>
                <div>
                  <div style={{fontSize:12,fontWeight:sel?800:500,color:sel?accent:text}}>{l.native}</div>
                  <div style={{fontSize:10,color:muted}}>{l.name}</div>
                </div>
                {sel&&<span style={{fontSize:12,color:accent,marginLeft:'auto'}}>✓</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Default subtitle languages for new videos */}
      <div style={{borderTop:'1px solid '+(isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'),paddingTop:20}}>
        <div style={{fontSize:11,fontWeight:700,color:muted,textTransform:'uppercase',letterSpacing:'0.12em',marginBottom:6}}>Default Subtitle Languages for New Videos</div>
        <div style={{fontSize:12,color:muted,marginBottom:12,lineHeight:1.5}}>These languages will be pre-selected in the Subtitles panel for every new video. You can always change them per-video.</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
          {['en','en-CA','fr','fr-CA','es','de','zh-Hans','ja','ko','pt-BR','hi','ar'].map(code=>(
              <div key={code} style={{padding:'5px 12px',borderRadius:8,background:isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.04)',border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.08)'),fontSize:11,color:muted}}>
                {CAPTION_LANGUAGES.find(l=>l.code===code)?.name||code}
              </div>
            ))}
        </div>
        <div style={{fontSize:11,color:muted,marginTop:10}}>Subtitle generation uses AI translation — requires Claude or Gemini key.</div>
      </div>
    </div>
  );

  const PANELS={general:renderGeneral,notifs:renderNotifs,language:renderLanguage,ai:renderAI,media:renderMedia,voice:renderVoice,publish:renderPublish,budget:renderBudget,storage:renderStorage,advanced:renderAdvanced,errors:()=><ErrorLog isDark={isDark}/>};

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>
      <div style={{width:190,flexShrink:0,background:navBg,borderRight:'1px solid '+navBorder,overflowY:'auto',padding:'14px 0'}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:sub,padding:'0 14px',marginBottom:8}}>Settings</div>
        {SECTIONS.map(s=>{
          const isActive=active===s.id;
          return(
            <button key={s.id} onClick={()=>setActive(s.id)} style={{width:'100%',display:'flex',alignItems:'center',gap:10,padding:'9px 14px',background:isActive?(isDark?'rgba(200,255,0,0.07)':'rgba(68,0,204,0.06)'):'transparent',border:'none',borderLeft:'3px solid '+(isActive?accent:'transparent'),cursor:'pointer',textAlign:'left',transition:'all 0.1s'}}
              onMouseEnter={e=>{if(!isActive)e.currentTarget.style.background=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)';}}
              onMouseLeave={e=>{if(!isActive)e.currentTarget.style.background='transparent';}}>
              <span style={{fontSize:15}}>{s.icon}</span>
              <div><div style={{fontSize:12,fontWeight:isActive?700:500,color:isActive?accent:text}}>{s.label}</div><div style={{fontSize:9,color:sub}}>{s.desc}</div></div>
            </button>
          );
        })}
      </div>
      <div style={{flex:1,overflowY:'auto',padding:28}}>
        <div style={{maxWidth:620}}>
          {PANELS[active]?.()}
          <div style={{marginTop:24,display:'flex',alignItems:'center',gap:12}}>
            <button onClick={save} className="btn btn-primary" style={{padding:'10px 24px'}}>Save Settings</button>
            {saved&&<span style={{fontSize:12,fontWeight:600,color:'#00E676'}}>✓ Saved</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
