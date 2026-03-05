import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';
import{fix,FIX}from '../../utils/fixRouter';
import{subscribeErrors,resolveError,clearErrors}from '../../utils/errorTracker';

// Every check: { id, label, icon, run() => {status,msg,fixAction,fixLabel,detail} }
const CHECKS=[
  {
    id:'claude',label:'Claude AI',icon:'🤖',category:'AI',
    async run(settings){
      const key=settings?.apiKeys?.claude;
      if(!key)return{status:'warn',msg:'No API key configured',fixAction:FIX.ADD_CLAUDE,fixLabel:'Add Claude key →'};
      try{
        const r=await window.forge.testApiKey('claude',key);
        if(r.ok)return{status:'ok',msg:'Key valid and working'};
        return{status:'error',msg:'Key rejected by Anthropic',fixAction:FIX.ADD_CLAUDE,fixLabel:'Replace key →'};
      }catch(e){return{status:'error',msg:e.message,fixAction:FIX.ADD_CLAUDE,fixLabel:'Fix Claude →'};}
    },
  },
  {
    id:'gemini',label:'Gemini AI',icon:'🔮',category:'AI',
    async run(settings){
      const key=settings?.apiKeys?.gemini;
      if(!key)return{status:'warn',msg:'No API key configured',fixAction:FIX.ADD_GEMINI,fixLabel:'Add Gemini key →'};
      try{
        const r=await window.forge.testApiKey('gemini',key);
        if(r.ok)return{status:'ok',msg:'Key valid and working'};
        return{status:'error',msg:'Key rejected by Google',fixAction:FIX.ADD_GEMINI,fixLabel:'Replace key →'};
      }catch(e){return{status:'error',msg:e.message,fixAction:FIX.ADD_GEMINI,fixLabel:'Fix Gemini →'};}
    },
  },
  {
    id:'openai',label:'OpenAI',icon:'🧠',category:'AI',
    async run(settings){
      const key=settings?.apiKeys?.openai;
      if(!key)return{status:'none',msg:'Optional — not configured',fixAction:FIX.ADD_OPENAI,fixLabel:'Add OpenAI →'};
      try{
        const r=await window.forge.testApiKey('openai',key);
        if(r.ok)return{status:'ok',msg:'Key valid and working'};
        return{status:'error',msg:'Key invalid',fixAction:FIX.ADD_OPENAI,fixLabel:'Replace key →'};
      }catch(e){return{status:'error',msg:e.message,fixAction:FIX.ADD_OPENAI,fixLabel:'Fix OpenAI →'};}
    },
  },
  {
    id:'youtube',label:'YouTube',icon:'▶️',category:'Publishing',
    async run(settings){
      const hasClient=settings?.apiKeys?.youtube_client_id&&settings?.apiKeys?.youtube_client_secret;
      if(!hasClient)return{status:'warn',msg:'OAuth credentials not configured — videos save locally',fixAction:FIX.CONNECT_YOUTUBE,fixLabel:'Connect YouTube →'};
      // Check for stored tokens
      try{
        const s=await window.forge.getSystemStatus();
        if(s.youtube==='ok')return{status:'ok',msg:'Connected and authorized'};
        return{status:'warn',msg:'Credentials set but not authorized yet',fixAction:FIX.CONNECT_YOUTUBE,fixLabel:'Authorize now →'};
      }catch(e){return{status:'warn',msg:'Could not verify connection',fixAction:FIX.CONNECT_YOUTUBE,fixLabel:'Reconnect →'};}
    },
  },
  {
    id:'pexels',label:'Pexels',icon:'🎥',category:'Media',
    async run(settings){
      const key=settings?.apiKeys?.pexels;
      if(!key)return{status:'none',msg:'Optional — free stock video',fixAction:FIX.ADD_PEXELS,fixLabel:'Add Pexels →'};
      try{
        const r=await window.forge.testApiKey('pexels',key);
        if(r.ok)return{status:'ok',msg:'Connected'};
        return{status:'error',msg:'Key invalid',fixAction:FIX.ADD_PEXELS,fixLabel:'Replace key →'};
      }catch(e){return{status:'error',msg:e.message};}
    },
  },
  {
    id:'pixabay',label:'Pixabay',icon:'🖼',category:'Media',
    async run(settings){
      const key=settings?.apiKeys?.pixabay;
      if(!key)return{status:'none',msg:'Optional — free stock images',fixAction:FIX.ADD_PIXABAY,fixLabel:'Add Pixabay →'};
      try{
        const r=await window.forge.testApiKey('pixabay',key);
        if(r.ok)return{status:'ok',msg:'Connected'};
        return{status:'error',msg:'Key invalid',fixAction:FIX.ADD_PIXABAY,fixLabel:'Replace key →'};
      }catch(e){return{status:'error',msg:e.message};}
    },
  },
  {
    id:'elevenlabs',label:'ElevenLabs',icon:'🎙',category:'Voice',
    async run(settings){
      const key=settings?.apiKeys?.elevenlabs;
      if(!key)return{status:'none',msg:'Optional — premium AI voices. Windows TTS is used as fallback.',fixAction:FIX.ADD_ELEVENLABS,fixLabel:'Add ElevenLabs →'};
      try{
        const r=await window.forge.testApiKey('elevenlabs',key);
        if(r.ok)return{status:'ok',msg:'Connected'};
        return{status:'error',msg:'Key invalid',fixAction:FIX.ADD_ELEVENLABS,fixLabel:'Replace key →'};
      }catch(e){return{status:'error',msg:e.message};}
    },
  },
  {
    id:'ffmpeg',label:'FFmpeg',icon:'⚙️',category:'System',
    async run(){
      try{
        const s=await window.forge.getSystemStatus();
        if(s.ffmpeg==='ok')return{status:'ok',msg:'Found and working'};
        return{
          status:'warn',
          msg:'Not found — video composition will fail',
          detail:'FFmpeg is bundled in production builds. In dev mode, install FFmpeg and add it to PATH.',
          fixAction:FIX.CHECK_FFMPEG,
          fixLabel:'Diagnose FFmpeg →',
        };
      }catch(e){return{status:'error',msg:e.message};}
    },
  },
  {
    id:'db',label:'Database',icon:'🗄',category:'System',
    async run(){
      try{
        const s=await window.forge.getSystemStatus();
        if(s.db==='ok')return{status:'ok',msg:'SQLite database healthy'};
        return{status:'error',msg:s.db_msg||'Database error',detail:'The local database may be corrupted.',fixAction:FIX.CHECK_DB,fixLabel:'Diagnose DB →'};
      }catch(e){return{status:'error',msg:e.message};}
    },
  },
  {
    id:'channels',label:'Channels',icon:'📡',category:'Content',
    async run(){
      try{
        const channels=await window.forge.getChannels();
        if(channels&&channels.length>0)return{status:'ok',msg:`${channels.length} channel${channels.length!==1?'s':''} configured`};
        return{status:'warn',msg:'No channels — create one to start making videos',fixAction:FIX.NEW_CHANNEL,fixLabel:'Create Channel →'};
      }catch(e){return{status:'error',msg:e.message};}
    },
  },
  {
    id:'ai_any',label:'AI Coverage',icon:'🎯',category:'AI',
    async run(settings){
      const keys=settings?.apiKeys||{};
      const aiKeys=['claude','gemini','openai','grok','mistral'];
      const connected=aiKeys.filter(k=>keys[k]);
      if(connected.length===0)return{status:'error',msg:'No AI model connected — content generation impossible',fixAction:FIX.ADD_ANY_AI,fixLabel:'Add AI Key →'};
      if(connected.length===1)return{status:'warn',msg:`Only ${connected[0]} connected — add a second for redundancy`,fixAction:FIX.ADD_ANY_AI,fixLabel:'Add another →'};
      return{status:'ok',msg:`${connected.length} models connected — ${connected.join(', ')}`};
    },
  },
];

const CATEGORIES=['AI','Publishing','Media','Voice','System','Content'];

function statusColor(s){
  if(s==='ok')return'#00E676';
  if(s==='warn')return'#FFAA00';
  if(s==='error')return'#EE2244';
  return'rgba(255,255,255,0.2)';
}

function statusLabel(s){
  if(s==='ok')return'OK';
  if(s==='warn')return'Warning';
  if(s==='error')return'Error';
  if(s==='running')return'Checking…';
  return'Not set';
}

export default function SystemDoctor({section,onClose}){
  const{theme,settings}=useApp();
  const isDark=theme==='dark';
  const[results,setResults]=useState({});
  const[running,setRunning]=useState(false);
  const[errors,setErrors]=useState([]);
  const[activeCategory,setActiveCategory]=useState(section||'all');

  useEffect(()=>subscribeErrors(e=>setErrors(e.filter(x=>!x.resolved))),[]);

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.18)':'rgba(0,0,20,0.22)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.035)':'rgba(0,0,0,0.025)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';

  async function runAll(){
    setRunning(true);
    setResults({});
    for(const check of CHECKS){
      setResults(r=>({...r,[check.id]:{status:'running'}}));
      try{
        const result=await check.run(settings);
        setResults(r=>({...r,[check.id]:result}));
      }catch(e){
        setResults(r=>({...r,[check.id]:{status:'error',msg:e.message}}));
      }
    }
    setRunning(false);
  }

  async function runSingle(check){
    setResults(r=>({...r,[check.id]:{status:'running'}}));
    try{
      const result=await check.run(settings);
      setResults(r=>({...r,[check.id]:result}));
    }catch(e){
      setResults(r=>({...r,[check.id]:{status:'error',msg:e.message}}));
    }
  }

  useEffect(()=>{runAll();},[]);

  const visibleChecks=activeCategory==='all'
    ?CHECKS
    :CHECKS.filter(c=>c.category===activeCategory);

  const total=CHECKS.length;
  const okCount=CHECKS.filter(c=>results[c.id]?.status==='ok').length;
  const errCount=CHECKS.filter(c=>results[c.id]?.status==='error').length;
  const warnCount=CHECKS.filter(c=>results[c.id]?.status==='warn').length;
  const score=total>0?Math.round((okCount/total)*100):0;

  const scoreColor=score>=80?'#00E676':score>=50?'#FFAA00':'#EE2244';

  return(
    <div className="modal-overlay" onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{
        width:'100%',maxWidth:640,maxHeight:'90vh',
        background:isDark?'rgba(10,10,20,0.98)':'rgba(252,252,255,0.98)',
        border:'1px solid '+border,
        borderRadius:20,
        boxShadow:'0 32px 80px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.08)',
        display:'flex',flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding:'18px 20px',
          borderBottom:'1px solid '+border,
          background:isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.01)',
          display:'flex',alignItems:'center',gap:12,
          flexShrink:0,
        }}>
          <div style={{flex:1}}>
            <div style={{fontSize:16,fontWeight:900,color:text,marginBottom:2}}>🔬 System Doctor</div>
            <div style={{fontSize:11,color:muted}}>Diagnoses every component and tells you exactly what to fix</div>
          </div>
          {/* Health score */}
          <div style={{textAlign:'center',padding:'6px 14px',borderRadius:10,
            background:scoreColor+'10',border:'1px solid '+scoreColor+'25'}}>
            <div style={{fontSize:22,fontWeight:900,color:scoreColor,lineHeight:1}}>{running?'…':score+'%'}</div>
            <div style={{fontSize:9,color:muted,textTransform:'uppercase',letterSpacing:'0.1em',marginTop:2}}>Health</div>
          </div>
          <button onClick={onClose} style={{background:'transparent',border:'none',color:muted,cursor:'pointer',fontSize:18,padding:'0 4px',flexShrink:0}}>✕</button>
        </div>

        {/* Summary strip */}
        {!running&&(
          <div style={{
            padding:'8px 20px',borderBottom:'1px solid '+border,flexShrink:0,
            display:'flex',gap:16,alignItems:'center',
            background:isDark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.02)',
          }}>
            {[
              {label:'OK',count:okCount,color:'#00E676'},
              {label:'Warnings',count:warnCount,color:'#FFAA00'},
              {label:'Errors',count:errCount,color:'#EE2244'},
            ].map(s=>(
              <div key={s.label} style={{display:'flex',gap:5,alignItems:'center'}}>
                <span style={{fontSize:7,color:s.color}}>●</span>
                <span style={{fontSize:11,fontWeight:700,color:s.count>0?s.color:muted}}>{s.count} {s.label}</span>
              </div>
            ))}
            <div style={{flex:1}}/>
            <button onClick={runAll} disabled={running}
              style={{fontSize:10,padding:'4px 12px',borderRadius:7,background:accent+'12',
                border:'1px solid '+accent+'25',color:accent,cursor:'pointer',fontWeight:700,opacity:running?0.5:1}}>
              ↻ Re-run All
            </button>
          </div>
        )}

        {/* Category tabs */}
        <div style={{display:'flex',gap:2,padding:'8px 20px 0',flexShrink:0,overflowX:'auto',
          borderBottom:'1px solid '+border,background:isDark?'rgba(0,0,0,0.1)':'transparent'}}>
          {['all',...CATEGORIES].map(cat=>{
            const isActive=activeCategory===cat;
            const catChecks=cat==='all'?CHECKS:CHECKS.filter(c=>c.category===cat);
            const catErr=catChecks.filter(c=>results[c.id]?.status==='error').length;
            const catWarn=catChecks.filter(c=>results[c.id]?.status==='warn').length;
            const dot=catErr>0?'#EE2244':catWarn>0?'#FFAA00':null;
            return(
              <button key={cat} onClick={()=>setActiveCategory(cat)}
                style={{
                  padding:'6px 12px',borderRadius:'8px 8px 0 0',border:'none',cursor:'pointer',
                  background:isActive?(isDark?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.9)'):'transparent',
                  color:isActive?text:muted,fontSize:11,fontWeight:isActive?700:400,
                  display:'flex',alignItems:'center',gap:4,flexShrink:0,
                  borderBottom:isActive?'2px solid '+accent:'2px solid transparent',
                }}>
                {cat==='all'?'All':cat}
                {dot&&<span style={{fontSize:6,color:dot}}>●</span>}
              </button>
            );
          })}
        </div>

        {/* Check results */}
        <div style={{flex:1,overflowY:'auto',padding:'16px 20px'}}>
          <div style={{display:'flex',flexDirection:'column',gap:8}}>
            {visibleChecks.map(check=>{
              const r=results[check.id];
              const st=r?.status||'pending';
              const color=statusColor(st);
              const isRunning=st==='running';
              return(
                <div key={check.id} style={{
                  padding:'12px 14px',borderRadius:12,
                  background:card,
                  border:'1px solid '+(st==='ok'?'rgba(0,230,118,0.1)':st==='error'?'rgba(238,34,68,0.12)':st==='warn'?'rgba(255,170,0,0.1)':border),
                  display:'flex',gap:12,alignItems:'flex-start',
                }}>
                  <div style={{width:32,height:32,borderRadius:9,background:color+'12',border:'1px solid '+color+'20',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>
                    {isRunning?<span style={{fontSize:14,animation:'spin 0.8s linear infinite',display:'inline-block'}}>⟳</span>:check.icon}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:2}}>
                      <span style={{fontSize:13,fontWeight:700,color:text}}>{check.label}</span>
                      <span style={{fontSize:9,color:muted,background:isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.04)',padding:'1px 6px',borderRadius:4}}>{check.category}</span>
                      <span style={{fontSize:9,fontWeight:700,color:color,marginLeft:'auto'}}>
                        {isRunning?'Checking…':statusLabel(st)}
                      </span>
                    </div>
                    {r?.msg&&<div style={{fontSize:11,color:st==='ok'?muted:color,lineHeight:1.4}}>{r.msg}</div>}
                    {r?.detail&&<div style={{fontSize:10,color:sub,marginTop:3,lineHeight:1.4}}>{r.detail}</div>}
                  </div>
                  <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
                    {!isRunning&&r?.fixAction&&(st==='error'||st==='warn'||st==='none')&&(
                      <button onClick={()=>{fix(r.fixAction);onClose();}}
                        style={{fontSize:10,padding:'4px 10px',borderRadius:7,
                          background:color+'15',border:'1px solid '+color+'30',
                          color:color,cursor:'pointer',fontWeight:700,whiteSpace:'nowrap'}}>
                        {r.fixLabel||'Fix →'}
                      </button>
                    )}
                    <button onClick={()=>runSingle(check)} disabled={isRunning}
                      style={{fontSize:10,padding:'4px 8px',borderRadius:7,
                        background:'transparent',border:'1px solid '+border,
                        color:muted,cursor:'pointer',opacity:isRunning?0.3:1}}>
                      ↻
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Runtime errors section */}
          {errors.length>0&&(activeCategory==='all'||activeCategory==='System')&&(
            <div style={{marginTop:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontSize:12,fontWeight:800,color:'#EE2244'}}>
                  🐛 Runtime Errors ({errors.length})
                </div>
                <button onClick={clearErrors}
                  style={{fontSize:10,padding:'3px 8px',borderRadius:5,background:'rgba(238,34,68,0.08)',
                    border:'1px solid rgba(238,34,68,0.15)',color:'#EE2244',cursor:'pointer'}}>
                  Clear All
                </button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:6}}>
                {errors.slice(0,10).map(err=>(
                  <div key={err.id} style={{
                    padding:'10px 12px',borderRadius:10,
                    background:'rgba(238,34,68,0.04)',
                    border:'1px solid rgba(238,34,68,0.1)',
                    display:'flex',alignItems:'flex-start',gap:10,
                  }}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:10,fontWeight:700,color:'rgba(238,34,68,0.8)',marginBottom:2}}>
                        [{err.source}]
                      </div>
                      <div style={{fontSize:11,color:text,lineHeight:1.4,
                        whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                        {err.message}
                      </div>
                      <div style={{fontSize:9,color:muted,marginTop:2}}>
                        {new Date(err.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div style={{display:'flex',gap:5,flexShrink:0}}>
                      {err.fixAction&&(
                        <button onClick={()=>{fix(err.fixAction);onClose();}}
                          style={{fontSize:9,padding:'3px 8px',borderRadius:5,
                            background:'rgba(238,34,68,0.1)',border:'1px solid rgba(238,34,68,0.2)',
                            color:'#EE2244',cursor:'pointer',fontWeight:700,whiteSpace:'nowrap'}}>
                          {err.fixLabel||'Fix →'}
                        </button>
                      )}
                      <button onClick={()=>resolveError(err.id)}
                        style={{fontSize:9,padding:'3px 6px',borderRadius:5,
                          background:'rgba(0,230,118,0.08)',border:'1px solid rgba(0,230,118,0.15)',
                          color:'#00E676',cursor:'pointer'}}>
                        ✓
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding:'12px 20px',borderTop:'1px solid '+border,flexShrink:0,
          display:'flex',justifyContent:'space-between',alignItems:'center',
          background:isDark?'rgba(0,0,0,0.2)':'rgba(0,0,0,0.02)',
        }}>
          <div style={{fontSize:10,color:sub}}>
            {running?'Running diagnostics…':`Last run: just now · ${total} checks`}
          </div>
          <div style={{display:'flex',gap:8}}>
            {errCount>0&&(
              <button onClick={()=>{
                const firstErr=CHECKS.find(c=>results[c.id]?.status==='error'&&results[c.id]?.fixAction);
                if(firstErr){fix(results[firstErr.id].fixAction);onClose();}
              }}
                style={{fontSize:11,padding:'6px 14px',borderRadius:8,background:'rgba(238,34,68,0.1)',
                  border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',cursor:'pointer',fontWeight:700}}>
                Fix Top Error →
              </button>
            )}
            <button onClick={onClose} className="btn btn-ghost" style={{fontSize:11}}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
