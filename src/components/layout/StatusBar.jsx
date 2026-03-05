import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

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
  if(status==='ok')    return{color:'#00E676',label:'●',title:'Operational'};
  if(status==='warn')  return{color:'#FFAA00',label:'●',title:'Warning'};
  if(status==='error') return{color:'#EE2244',label:'●',title:'Error'};
  return{color:'rgba(255,255,255,0.2)',label:'○',title:'Not configured'};
}

export default function StatusBar(){
  const{theme,activeChannel}=useApp();
  const isDark=theme==='dark';
  const[statuses,setStatuses]=useState({});
  const[expanded,setExpanded]=useState(false);
  const[lastCheck,setLastCheck]=useState(null);

  async function checkStatuses(){
    try{
      const s=await window.forge.getSystemStatus();
      setStatuses(s||{});
      setLastCheck(new Date());
    }catch(e){}
  }

  useEffect(()=>{
    checkStatuses();
    const t=setInterval(checkStatuses,30000);
    return()=>clearInterval(t);
  },[]);

  const allStatuses=SERVICES.map(s=>statuses[s.id]||'none');
  const hasError=allStatuses.some(s=>s==='error');
  const hasWarn=allStatuses.some(s=>s==='warn');
  const allGood=allStatuses.filter(s=>s==='ok').length;
  const total=SERVICES.length;

  const barBg=isDark?'rgba(8,8,16,0.95)':'rgba(245,245,255,0.95)';
  const barBorder=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.35)':'rgba(0,0,20,0.4)';
  const accent=isDark?'#C8FF00':'#4400CC';

  const overallColor=hasError?'#EE2244':hasWarn?'#FFAA00':allGood>0?'#00E676':'rgba(255,255,255,0.2)';

  return(
    <div style={{position:'relative',zIndex:100}}>
      {/* Collapsed bar */}
      <div onClick={()=>setExpanded(e=>!e)} style={{
        height:28,display:'flex',alignItems:'center',gap:10,padding:'0 16px',cursor:'pointer',
        background:barBg,borderTop:'1px solid '+barBorder,
        backdropFilter:'blur(20px)',userSelect:'none',
      }}>
        {/* Overall health dot */}
        <div style={{display:'flex',alignItems:'center',gap:5}}>
          <span style={{fontSize:8,color:overallColor,lineHeight:1}}>●</span>
          <span style={{fontSize:10,fontWeight:700,color:overallColor}}>
            {hasError?'System Error':hasWarn?'Warning':allGood>0?'Operational':'Not Configured'}
          </span>
        </div>

        <span style={{color:muted,fontSize:10}}>|</span>

        {/* Per-service dots */}
        <div style={{display:'flex',gap:6,alignItems:'center',flex:1}}>
          {SERVICES.map(s=>{
            const st=statuses[s.id]||'none';
            const d=dot(st);
            return(
              <div key={s.id} title={`${s.label}: ${d.title}`}
                style={{display:'flex',alignItems:'center',gap:3}}>
                <span style={{fontSize:7,color:d.color,lineHeight:1}}>{d.label}</span>
                <span style={{fontSize:9,color:st==='ok'?d.color:muted}}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          {lastCheck&&<span style={{fontSize:9,color:muted}}>checked {Math.round((Date.now()-lastCheck)/1000)}s ago</span>}
          <span style={{fontSize:9,color:muted}}>{expanded?'▼':'▲'}</span>
        </div>
      </div>

      {/* Expanded panel */}
      {expanded&&(
        <div style={{
          position:'absolute',bottom:'100%',left:0,right:0,
          background:barBg,border:'1px solid '+barBorder,borderBottom:'none',
          borderRadius:'12px 12px 0 0',boxShadow:'0 -8px 32px rgba(0,0,0,0.3)',
          padding:'16px',
        }}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:13,fontWeight:800,color:text}}>System Health</div>
            <div style={{display:'flex',gap:8}}>
              <button onClick={e=>{e.stopPropagation();checkStatuses();}}
                style={{fontSize:10,padding:'4px 10px',borderRadius:6,background:accent+'12',color:accent,border:'1px solid '+accent+'30',cursor:'pointer'}}>
                ↻ Refresh
              </button>
            </div>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
            {SERVICES.map(s=>{
              const st=statuses[s.id]||'none';
              const d=dot(st);
              const msg=statuses[s.id+'_msg'];
              return(
                <div key={s.id} style={{
                  padding:'10px 12px',borderRadius:10,
                  background:st==='ok'?'rgba(0,230,118,0.05)':st==='error'?'rgba(238,34,68,0.05)':st==='warn'?'rgba(255,170,0,0.05)':'rgba(255,255,255,0.03)',
                  border:'1px solid '+(st==='ok'?'rgba(0,230,118,0.15)':st==='error'?'rgba(238,34,68,0.15)':st==='warn'?'rgba(255,170,0,0.15)':'rgba(255,255,255,0.07)'),
                }}>
                  <div style={{display:'flex',gap:6,alignItems:'center',marginBottom:3}}>
                    <span style={{fontSize:14}}>{s.icon}</span>
                    <span style={{fontSize:11,fontWeight:700,color:text}}>{s.label}</span>
                    <span style={{fontSize:7,color:d.color,marginLeft:'auto'}}>●</span>
                  </div>
                  <div style={{fontSize:10,color:d.color,fontWeight:600}}>{d.title}</div>
                  {msg&&<div style={{fontSize:9,color:muted,marginTop:2,lineHeight:1.3}}>{msg}</div>}
                </div>
              );
            })}
          </div>

          {/* Fix suggestions */}
          {(hasError||hasWarn)&&(
            <div style={{marginTop:12,padding:'10px 12px',background:'rgba(238,34,68,0.06)',border:'1px solid rgba(238,34,68,0.15)',borderRadius:9}}>
              <div style={{fontSize:11,fontWeight:700,color:'#EE2244',marginBottom:6}}>⚠ Issues Detected</div>
              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                {SERVICES.filter(s=>(statuses[s.id]==='error'||statuses[s.id]==='warn')).map(s=>(
                  <div key={s.id} style={{fontSize:11,color:muted}}>
                    <span style={{color:statuses[s.id]==='error'?'#EE2244':'#FFAA00',fontWeight:600}}>{s.label}:</span>{' '}
                    {statuses[s.id+'_fix']||'Check Settings → add or update your API key'}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
