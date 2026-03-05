import React,{useState,useEffect,useRef}from 'react';
import{subscribeToasts}from '../../utils/notifications';
import{fix}from '../../utils/fixRouter';

const TYPE_CONFIG={
  success:{color:'#00E676',bg:'rgba(0,230,118,0.08)',border:'rgba(0,230,118,0.2)',icon:'✓'},
  error:  {color:'#EE2244',bg:'rgba(238,34,68,0.08)', border:'rgba(238,34,68,0.2)', icon:'✕'},
  warning:{color:'#FFAA00',bg:'rgba(255,170,0,0.08)',  border:'rgba(255,170,0,0.2)',  icon:'⚠'},
  info:   {color:'#00C8FF',bg:'rgba(0,200,255,0.07)',  border:'rgba(0,200,255,0.18)', icon:'ℹ'},
  system: {color:'#A060FF',bg:'rgba(160,96,255,0.07)', border:'rgba(160,96,255,0.18)',icon:'⚙'},
};

function Toast({n,onDismiss}){
  const cfg=TYPE_CONFIG[n.type]||TYPE_CONFIG.info;
  const[visible,setVisible]=useState(false);
  const[leaving,setLeaving]=useState(false);
  const timerRef=useRef();

  useEffect(()=>{
    requestAnimationFrame(()=>setVisible(true));
    const duration=n.persistent?null:n.type==='error'?8000:5000;
    if(duration){
      timerRef.current=setTimeout(dismiss,duration);
    }
    return()=>clearTimeout(timerRef.current);
  },[]);

  function dismiss(){
    setLeaving(true);
    setTimeout(onDismiss,220);
  }

  return(
    <div
      onClick={()=>{if(n.onClick)n.onClick();else if(n.fixAction){fix(n.fixAction);dismiss();}else dismiss();}}
      style={{
        display:'flex',gap:10,alignItems:'flex-start',
        padding:'11px 13px',
        background:'rgba(10,10,20,0.97)',
        border:'1px solid '+cfg.border,
        borderLeft:'3px solid '+cfg.color,
        borderRadius:12,
        boxShadow:'0 8px 32px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.06)',
        cursor:'pointer',
        maxWidth:320,
        width:'100%',
        transform:visible&&!leaving?'translateX(0)':'translateX(calc(100% + 24px))',
        opacity:visible&&!leaving?1:0,
        transition:'transform 0.22s cubic-bezier(0.34,1.3,0.64,1),opacity 0.22s ease',
        backdropFilter:'blur(20px)',
        userSelect:'none',
      }}
      onMouseEnter={()=>clearTimeout(timerRef.current)}
      onMouseLeave={()=>{
        if(!n.persistent){
          timerRef.current=setTimeout(dismiss,2000);
        }
      }}
    >
      {/* Icon */}
      <div style={{
        width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,
        background:cfg.color+'18',border:'1px solid '+cfg.color+'30',
        display:'flex',alignItems:'center',justifyContent:'center',
        fontSize:11,fontWeight:900,color:cfg.color,
      }}>
        {cfg.icon}
      </div>

      {/* Content */}
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:12,fontWeight:700,color:'#E8E6FF',marginBottom:n.message?2:0,
          whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
          {n.title}
        </div>
        {n.message&&(
          <div style={{fontSize:10,color:'rgba(255,255,255,0.5)',lineHeight:1.4,
            display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
            {n.message}
          </div>
        )}
        {(n.fixAction||n.action)&&(
          <div style={{fontSize:10,fontWeight:700,color:cfg.color,marginTop:4}}>
            {n.fixLabel||n.action||'Fix →'}
          </div>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={e=>{e.stopPropagation();dismiss();}}
        style={{background:'transparent',border:'none',color:'rgba(255,255,255,0.25)',
          cursor:'pointer',fontSize:14,padding:'0 2px',flexShrink:0,lineHeight:1,marginTop:-2}}
        onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.7)'}
        onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.25)'}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer(){
  const[toasts,setToasts]=useState([]);

  useEffect(()=>subscribeToasts(n=>{
    setToasts(t=>[...t,{...n,_key:Date.now()+Math.random()}]);
  }),[]);

  function dismiss(key){
    setToasts(t=>t.filter(x=>x._key!==key));
  }

  if(toasts.length===0)return null;

  return(
    <div style={{
      position:'fixed',top:60,right:16,zIndex:99999,
      display:'flex',flexDirection:'column',gap:8,
      pointerEvents:'none',
      width:320,
    }}>
      {toasts.slice(-5).map(n=>(
        <div key={n._key} style={{pointerEvents:'all'}}>
          <Toast n={n} onDismiss={()=>dismiss(n._key)}/>
        </div>
      ))}
    </div>
  );
}
