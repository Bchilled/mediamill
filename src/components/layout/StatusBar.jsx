import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';
import{subscribeErrors}from '../../utils/errorTracker';
import{fix,suggestFix,FIX}from '../../utils/fixRouter';

const SERVICES=[
  {id:'claude',    label:'Claude',    icon:'🤖', type:'ai'},
  {id:'gemini',    label:'Gemini',    icon:'🔮', type:'ai'},
  {id:'youtube',   label:'YouTube',   icon:'▶️',  type:'publish'},
  {id:'pexels',    label:'Pexels',    icon:'🎥', type:'media'},
  {id:'pixabay',   label:'Pixabay',   icon:'🖼',  type:'media'},
  {id:'elevenlabs',label:'ElevenLabs',icon:'🎙', type:'voice'},
  {id:'ffmpeg',    label:'FFmpeg',    icon:'⚙️',  type:'system'},
  {id:'db',        label:'Database',  icon:'🗄',  type:'system'},
];

function dot(status){
  if(status==='ok')    return{color:'#00E676',glow:'rgba(0,230,118,0.4)'};
  if(status==='warn')  return{color:'#FFAA00',glow:'rgba(255,170,0,0.4)'};
  if(status==='error') return{color:'#EE2244',glow:'rgba(238,34,68,0.4)'};
  return{color:'rgba(255,255,255,0.15)',glow:'transparent'};
}

export default function StatusBar(){
  const{theme,setModal,setActiveView,setSettingsTab,setSettingsSubTab}=useApp();
  const isDark=theme==='dark';
  const[statuses,setStatuses]=useState({});
  const[expanded,setExpanded]=useState(false);
  const[lastCheck,setLastCheck]=useState(null);
  const[checking,setChecking]=useState(false);
  const[errors,setErrors]=useState([]);

  useEffect(()=>subscribeErrors(errs=>setErrors(errs.filter(e=>!e.resolved))),[]);

  async function checkStatuses(){
    setChecking(true);
    try{
      const s=await window.forge.getSystemStatus();
      setStatuses(s||{});
      setLastCheck(new Date());
    }catch(e){}
    setChecking(false);
  }

  useEffect(()=>{
    checkStatuses();
    const t=setInterval(checkStatuses,30000);
    return()=>clearInterval(t);
  },[]);

  const problems=SERVICES.filter(s=>statuses[s.id]==='error'||statuses[s.id]==='warn');
  const hasError=SERVICES.some(s=>statuses[s.id]==='error');
  const hasWarn=!hasError&&SERVICES.some(s=>statuses[s.id]==='warn');
  const errorCount=errors.length;

  const barBg=isDark?'rgba(6,6,14,0.97)':'rgba(245,245,255,0.97)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.35)':'rgba(0,0,20,0.4)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const overallColor=hasError?'#EE2244':hasWarn?'#FFAA00':SERVICES.some(s=>statuses[s.id]==='ok')?'#00E676':'rgba(255,255,255,0.2)';

  function fixService(svc){
    const action=statuses[svc.id+'_action'];
    if(action)fix(action);
    else fix('system:doctor');
  }

  const secondsAgo=lastCheck?Math.round((Date.now()-lastCheck)/1000):null;

  return(
    <div style={{position:'relative',zIndex:100,flexShrink:0}}>
      {/* Expanded panel — above the bar */}
      {expanded&&(
        <div style={{
          position:'absolute',bottom:'100%',left:0,right:0,
          background:barBg,
          borderTop:'1px solid '+border,
          borderLeft:'1px solid '+border,
          borderRight:'1px solid '+border,
          borderRadius:'12px 12px 0 0',
          boxShadow:'0 -12px 40px rgba(0,0,0,0.4)',
          padding:'16px',
          maxHeight:'60vh',
          overflowY:'auto',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:text}}>System Health</div>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <button onClick={e=>{e.stopPropagation();fix(FIX.OPEN_DOCTOR);setExpanded(false);}}
                style={{fontSize:10,padding:'4px 10px',borderRadius:6,background:'rgba(255,255,255,0.06)',
                  border:'1px solid rgba(255,255,255,0.1)',color:muted,cursor:'pointer'}}>
                🔬 Full Doctor
              </button>
              <button onClick={e=>{e.stopPropagation();checkStatuses();}}
                disabled={checking}
                style={{fontSize:10,padding:'4px 10px',borderRadius:6,background:accent+'12',
                  color:accent,border:'1px solid '+accent+'30',cursor:'pointer',opacity:checking?0.5:1}}>
                {checking?'⟳ Checking…':'↻ Refresh'}
              </button>
            </div>
          </div>

          {/* Service grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
            {SERVICES.map(s=>{
              const st=statuses[s.id]||'none';
              const d=dot(st);
              const msg=statuses[s.id+'_msg'];
              const hasAction=!!statuses[s.id+'_action'];
              return(
                <div key={s.id} style={{
                  padding:'10px 11px',borderRadius:10,
                  background:st==='ok'?'rgba(0,230,118,0.04)':st==='error'?'rgba(238,34,68,0.04)':st==='warn'?'rgba(255,170,0,0.04)':'rgba(255,255,255,0.02)',
                  border:'1px solid '+(st==='ok'?'rgba(0,230,118,0.12)':st==='error'?'rgba(238,34,68,0.12)':st==='warn'?'rgba(255,170,0,0.12)':'rgba(255,255,255,0.05)'),
                }}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:3}}>
                    <span style={{fontSize:13}}>{s.icon}</span>
                    <span style={{fontSize:10,fontWeight:700,color:text,flex:1}}>{s.label}</span>
                    <span style={{fontSize:6,color:d.color,textShadow:`0 0 6px ${d.glow}`}}>●</span>
                  </div>
                  <div style={{fontSize:9,color:d.color,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:msg?3:0}}>
                    {st==='ok'?'OK':st==='warn'?'Warning':st==='error'?'Error':'Not set'}
                  </div>
                  {msg&&<div style={{fontSize:9,color:muted,lineHeight:1.3,marginBottom:hasAction?4:0}}>{msg}</div>}
                  {(st==='error'||st==='warn')&&hasAction&&(
                    <button onClick={e=>{e.stopPropagation();fixService(s);setExpanded(false);}}
                      style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:d.color+'15',
                        border:'1px solid '+d.color+'30',color:d.color,cursor:'pointer',fontWeight:700,width:'100%',marginTop:2}}>
                      Fix →
                    </button>
                  )}
                  {st==='none'&&hasAction&&(
                    <button onClick={e=>{e.stopPropagation();fixService(s);setExpanded(false);}}
                      style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'rgba(255,255,255,0.06)',
                        border:'1px solid rgba(255,255,255,0.1)',color:muted,cursor:'pointer',width:'100%',marginTop:2}}>
                      Set up →
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Recent errors */}
          {errors.length>0&&(
            <div style={{borderTop:'1px solid '+border,paddingTop:12}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <div style={{fontSize:11,fontWeight:700,color:'#EE2244'}}>
                  🐛 {errors.length} unresolved error{errors.length!==1?'s':''}
                </div>
                <button onClick={e=>{e.stopPropagation();fix(FIX.OPEN_ERROR_LOG);setExpanded(false);}}
                  style={{fontSize:9,padding:'2px 8px',borderRadius:5,background:'rgba(238,34,68,0.1)',
                    border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',cursor:'pointer',fontWeight:700}}>
                  View All →
                </button>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                {errors.slice(0,3).map(err=>{
                  const suggestion=suggestFix(err.source,err.message);
                  return(
                    <div key={err.id} style={{
                      padding:'8px 10px',borderRadius:8,
                      background:'rgba(238,34,68,0.04)',
                      border:'1px solid rgba(238,34,68,0.1)',
                      display:'flex',alignItems:'flex-start',gap:8,
                    }}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:10,color:'rgba(238,34,68,0.8)',fontWeight:600,
                          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                          [{err.source}] {err.message}
                        </div>
                        <div style={{fontSize:9,color:muted,marginTop:1}}>
                          {new Date(err.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <button onClick={e=>{e.stopPropagation();fix(suggestion.action);setExpanded(false);}}
                        style={{fontSize:9,padding:'2px 7px',borderRadius:5,background:'rgba(238,34,68,0.1)',
                          border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',cursor:'pointer',
                          fontWeight:700,flexShrink:0,whiteSpace:'nowrap'}}>
                        {suggestion.label}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collapsed bar */}
      <div onClick={()=>setExpanded(e=>!e)} style={{
        height:26,display:'flex',alignItems:'center',gap:10,padding:'0 14px',cursor:'pointer',
        background:barBg,borderTop:'1px solid '+border,
        userSelect:'none',
      }}>
        {/* Overall */}
        <span style={{fontSize:7,color:overallColor,textShadow:hasError||hasWarn?`0 0 8px ${overallColor}`:undefined}}>●</span>
        <span style={{fontSize:10,fontWeight:700,color:overallColor,marginRight:4}}>
          {hasError?'Error':hasWarn?'Warning':SERVICES.some(s=>statuses[s.id]==='ok')?'OK':'Unconfigured'}
        </span>

        <span style={{color:border,fontSize:10}}>|</span>

        {/* Per-service dots */}
        <div style={{display:'flex',gap:5,alignItems:'center',flex:1,overflow:'hidden'}}>
          {SERVICES.map(s=>{
            const d=dot(statuses[s.id]||'none');
            return(
              <div key={s.id} title={`${s.label}: ${statuses[s.id]||'none'}`}
                style={{display:'flex',alignItems:'center',gap:2,flexShrink:0}}>
                <span style={{fontSize:6,color:d.color}}>●</span>
                <span style={{fontSize:9,color:statuses[s.id]==='ok'?d.color:muted}}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0}}>
          {secondsAgo!==null&&(
            <span style={{fontSize:9,color:muted}}>{secondsAgo<60?`${secondsAgo}s ago`:`${Math.round(secondsAgo/60)}m ago`}</span>
          )}
          {errorCount>0&&(
            <button onClick={e=>{e.stopPropagation();fix(FIX.OPEN_ERROR_LOG);}}
              style={{fontSize:9,fontWeight:700,color:'#EE2244',background:'rgba(238,34,68,0.1)',
                padding:'1px 6px',borderRadius:99,border:'1px solid rgba(238,34,68,0.2)',cursor:'pointer'}}>
              🐛 {errorCount}
            </button>
          )}
          {problems.length>0&&(
            <button onClick={e=>{e.stopPropagation();fix(FIX.OPEN_DOCTOR);}}
              style={{fontSize:9,fontWeight:700,color:'#FFAA00',background:'rgba(255,170,0,0.08)',
                padding:'1px 7px',borderRadius:99,border:'1px solid rgba(255,170,0,0.2)',cursor:'pointer'}}>
              ⚠ {problems.length} issue{problems.length!==1?'s':''}
            </button>
          )}
          <span style={{fontSize:9,color:muted}}>{expanded?'▼':'▲'}</span>
        </div>
      </div>
    </div>
  );
}
