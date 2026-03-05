import React,{useState}from 'react';
import{useApp}from '../../context/AppContext';

const STEPS=[
  {id:'welcome',title:'Welcome to MediaMill',icon:'🎬'},
  {id:'ai',title:'Connect AI',icon:'🤖'},
  {id:'channel',title:'Create Your First Channel',icon:'📡'},
  {id:'done',title:"You're Ready",icon:'🚀'},
];

export default function FirstRun({onComplete}){
  const{theme,loadChannels}=useApp();
  const[step,setStep]=useState(0);
  const[claudeKey,setClaudeKey]=useState('');
  const[geminiKey,setGeminiKey]=useState('');
  const[channelName,setChannelName]=useState('');
  const[channelTopic,setChannelTopic]=useState('');
  const[channelPreset,setChannelPreset]=useState('long');
  const[saving,setSaving]=useState(false);
  const[showKey,setShowKey]=useState({});
  const isDark=theme==='dark';

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.45)':'rgba(0,0,20,0.5)';
  const sub=isDark?'rgba(255,255,255,0.28)':'rgba(0,0,20,0.35)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.03)';
  const cardBorder=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';

  async function saveAIKeys(){
    if(!claudeKey&&!geminiKey){alert('Add at least one AI key to continue.');return;}
    setSaving(true);
    try{
      await window.forge.updateSettings({apiKeys:{claude:claudeKey||undefined,gemini:geminiKey||undefined}});
      setStep(2);
    }catch(e){alert(e.message);}
    setSaving(false);
  }

  async function saveChannel(){
    if(!channelName.trim()){alert('Channel name is required.');return;}
    if(!channelTopic.trim()){alert('Channel topic is required — the AI needs this to find content.');return;}
    setSaving(true);
    try{
      await window.forge.createChannel({name:channelName,preset:channelPreset,topic:channelTopic,style_prompt:channelTopic,voice_engine:'auto'});
      await loadChannels();
      setStep(3);
    }catch(e){alert(e.message);}
    setSaving(false);
  }

  const bg=isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)';

  return(
    <div style={{position:'fixed',inset:0,background:bg,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',zIndex:9999,padding:32}}>
      {/* Step indicator */}
      <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:40}}>
        {STEPS.map((s,i)=>(
          <React.Fragment key={s.id}>
            <div style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,
              background:i<step?accent:i===step?(isDark?'rgba(200,255,0,0.15)':'rgba(68,0,204,0.12)'):'rgba(255,255,255,0.06)',
              border:'2px solid '+(i<=step?accent:'rgba(255,255,255,0.1)'),
              color:i<step?(isDark?'#000':'#fff'):i===step?accent:muted,
              fontWeight:700,transition:'all 0.3s',
            }}>{i<step?'✓':i+1}</div>
            {i<STEPS.length-1&&<div style={{width:32,height:2,background:i<step?accent:'rgba(255,255,255,0.08)',transition:'all 0.3s'}}/>}
          </React.Fragment>
        ))}
      </div>

      <div style={{width:'100%',maxWidth:520}}>
        {/* Welcome */}
        {step===0&&(
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:72,marginBottom:24}}>🎬</div>
            <h1 style={{fontSize:28,fontWeight:900,color:text,marginBottom:12}}>Welcome to MediaMill</h1>
            <p style={{fontSize:14,color:muted,lineHeight:1.6,marginBottom:12}}>
              MediaMill turns ideas into published YouTube videos — automatically.<br/>
              It finds Canadian content, writes scripts, gathers footage, records narration, and uploads to YouTube.
            </p>
            <p style={{fontSize:13,color:sub,marginBottom:32}}>Setup takes about 3 minutes.</p>
            <button onClick={()=>setStep(1)} className="btn btn-primary" style={{fontSize:15,padding:'12px 40px'}}>Get Started →</button>
          </div>
        )}

        {/* AI Keys */}
        {step===1&&(
          <div>
            <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8,textAlign:'center'}}>🤖 Connect AI</h2>
            <p style={{fontSize:13,color:muted,marginBottom:24,textAlign:'center',lineHeight:1.5}}>
              MediaMill uses AI to write scripts. Add at least one key.<br/>
              <strong style={{color:text}}>Claude is recommended for best quality.</strong>
            </p>

            <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,padding:'18px 20px',marginBottom:14}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:text}}>🧠 Claude <span style={{fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:99,background:'rgba(200,255,0,0.12)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',marginLeft:6}}>Recommended</span></div>
                  <div style={{fontSize:11,color:sub}}>Anthropic · Best for scripts and SEO</div>
                </div>
                <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" className="btn" style={{fontSize:10,padding:'4px 10px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',textDecoration:'none'}}>Get Key ↗</a>
              </div>
              <div style={{display:'flex',gap:8}}>
                <input type={showKey.claude?'text':'password'} value={claudeKey} onChange={e=>setClaudeKey(e.target.value)}
                  placeholder="sk-ant-..." className={isDark?'input-dark':'input-light'} style={{flex:1,fontFamily:'monospace',fontSize:12}}/>
                <button onClick={()=>setShowKey(s=>({...s,claude:!s.claude}))} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'8px 12px',fontSize:11}}>{showKey.claude?'Hide':'Show'}</button>
              </div>
            </div>

            <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,padding:'18px 20px',marginBottom:28}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:text}}>✨ Gemini</div>
                  <div style={{fontSize:11,color:sub}}>Google · Free tier available · Good fallback</div>
                </div>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="btn" style={{fontSize:10,padding:'4px 10px',background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',textDecoration:'none'}}>Get Key ↗</a>
              </div>
              <div style={{display:'flex',gap:8}}>
                <input type={showKey.gemini?'text':'password'} value={geminiKey} onChange={e=>setGeminiKey(e.target.value)}
                  placeholder="AIza..." className={isDark?'input-dark':'input-light'} style={{flex:1,fontFamily:'monospace',fontSize:12}}/>
                <button onClick={()=>setShowKey(s=>({...s,gemini:!s.gemini}))} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'8px 12px',fontSize:11}}>{showKey.gemini?'Hide':'Show'}</button>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(0)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'10px 20px'}}>← Back</button>
              <button onClick={saveAIKeys} disabled={saving||(!claudeKey&&!geminiKey)} className="btn btn-primary" style={{flex:1,padding:'10px',opacity:saving||(!claudeKey&&!geminiKey)?0.5:1}}>
                {saving?'Saving…':'Save & Continue →'}
              </button>
            </div>
            <div style={{textAlign:'center',marginTop:12}}>
              <button onClick={()=>setStep(2)} style={{fontSize:11,color:sub,background:'transparent',border:'none',cursor:'pointer'}}>Skip for now — add keys in Settings later</button>
            </div>
          </div>
        )}

        {/* Create channel */}
        {step===2&&(
          <div>
            <h2 style={{fontSize:22,fontWeight:900,color:text,marginBottom:8,textAlign:'center'}}>📡 Create Your First Channel</h2>
            <p style={{fontSize:13,color:muted,marginBottom:24,textAlign:'center',lineHeight:1.5}}>Each channel is a separate YouTube presence with its own topic focus.</p>

            <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:28}}>
              <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,padding:'16px 18px'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:sub,marginBottom:8}}>Channel Name</div>
                <input value={channelName} onChange={e=>setChannelName(e.target.value)} placeholder="e.g. Due North News"
                  className={isDark?'input-dark':'input-light'}/>
              </div>
              <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,padding:'16px 18px'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:sub,marginBottom:4}}>Channel Topic *</div>
                <div style={{fontSize:11,color:muted,marginBottom:8}}>The AI uses this to find and write about relevant content. Be specific.</div>
                <textarea value={channelTopic} onChange={e=>setChannelTopic(e.target.value)} rows={3}
                  placeholder="e.g. Unbiased Canadian political news and analysis, focusing on federal government, policy decisions, and accountability"
                  className={isDark?'input-dark':'input-light'} style={{resize:'none'}}/>
                <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                  {['Canadian political news','Canadian WWII history','True crime from Canada','Canadian economic news'].map(ex=>(
                    <button key={ex} onClick={()=>setChannelTopic(ex)} style={{fontSize:10,padding:'3px 9px',borderRadius:8,border:'1px solid '+cardBorder,background:'transparent',color:muted,cursor:'pointer'}}
                      onMouseEnter={e=>{e.currentTarget.style.borderColor=accent;e.currentTarget.style.color=accent;}}
                      onMouseLeave={e=>{e.currentTarget.style.borderColor=cardBorder;e.currentTarget.style.color=muted;}}>{ex}</button>
                  ))}
                </div>
              </div>
              <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,padding:'16px 18px'}}>
                <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:sub,marginBottom:10}}>Format</div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8}}>
                  {[{id:'short',label:'Shorts',desc:'< 60 sec',icon:'⚡'},{id:'mid',label:'Mid-Form',desc:'5–20 min',icon:'📰'},{id:'long',label:'Long-Form',desc:'20–90 min',icon:'🎬'}].map(p=>(
                    <div key={p.id} onClick={()=>setChannelPreset(p.id)} style={{padding:'12px 8px',textAlign:'center',cursor:'pointer',borderRadius:10,
                      background:channelPreset===p.id?(isDark?'rgba(200,255,0,0.08)':'rgba(68,0,204,0.06)'):'transparent',
                      border:'1px solid '+(channelPreset===p.id?accent+'40':cardBorder),transition:'all 0.1s'}}>
                      <div style={{fontSize:20,marginBottom:4}}>{p.icon}</div>
                      <div style={{fontSize:12,fontWeight:700,color:channelPreset===p.id?accent:text}}>{p.label}</div>
                      <div style={{fontSize:10,color:muted}}>{p.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{display:'flex',gap:10}}>
              <button onClick={()=>setStep(1)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'10px 20px'}}>← Back</button>
              <button onClick={saveChannel} disabled={saving||!channelName||!channelTopic} className="btn btn-primary" style={{flex:1,padding:'10px',opacity:saving||!channelName||!channelTopic?0.5:1}}>
                {saving?'Creating…':'Create Channel →'}
              </button>
            </div>
          </div>
        )}

        {/* Done */}
        {step===3&&(
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:72,marginBottom:24}}>🚀</div>
            <h2 style={{fontSize:24,fontWeight:900,color:text,marginBottom:12}}>You're all set!</h2>
            <p style={{fontSize:13,color:muted,lineHeight:1.6,marginBottom:32}}>
              Your channel is created and AI is connected.<br/>
              Next: scan for ideas, approve one, and run the pipeline.<br/>
              Your first video will be ready to review in minutes.
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:300,margin:'0 auto'}}>
              <button onClick={onComplete} className="btn btn-primary" style={{fontSize:14,padding:'12px 24px'}}>Open MediaMill →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
