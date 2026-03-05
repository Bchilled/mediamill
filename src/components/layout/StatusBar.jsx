import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';
import{subscribeErrors}from '../../utils/errorTracker';
import{fix,FIX}from '../../utils/fixRouter';

const REQUIRED=[
  {id:'claude',label:'Claude',icon:'🧠'},
  {id:'gemini',label:'Gemini',icon:'✨'},
];
const OPTIONAL=[
  {id:'youtube',label:'YouTube',icon:'▶'},
  {id:'pexels',label:'Pexels',icon:'🎥'},
  {id:'elevenlabs',label:'ElevenLabs',icon:'🎙'},
  {id:'ffmpeg',label:'FFmpeg',icon:'⚙'},
  {id:'db',label:'DB',icon:'💾'},
];

export default function StatusBar(){
  const{theme}=useApp();
  const[statuses,setStatuses]=useState({});
  const[errors,setErrors]=useState([]);
  const[checking,setChecking]=useState(false);

  useEffect(()=>subscribeErrors(errs=>setErrors(errs.filter(e=>!e.resolved))),[]);

  async function check(){
    setChecking(true);
    try{const s=await window.forge.getSystemStatus();setStatuses(s||{});}catch(_){}
    setChecking(false);
  }
  useEffect(()=>{check();const t=setInterval(check,30000);return()=>clearInterval(t);},[]);

  const aiReady=REQUIRED.some(s=>statuses[s.id]==='ok');
  const hasErr=REQUIRED.some(s=>statuses[s.id]==='error');
  const hasIssue=[...REQUIRED,...OPTIONAL].some(s=>statuses[s.id]==='error'||statuses[s.id]==='warn');

  // Overall status — one clear message
  const overall=hasErr
    ?{label:'AI not connected',color:'#FF3B30',action:()=>fix(FIX.ADD_ANY_AI)}
    :aiReady
      ?hasIssue
        ?{label:'Some issues',color:'#FF9F0A',action:()=>fix(FIX.OPEN_DOCTOR)}
        :{label:'Ready',color:'#34C759',action:null}
      :{label:'Setup needed',color:'#FF9F0A',action:()=>fix(FIX.ADD_ANY_AI)};

  const errCount=errors.length;

  function dot(id){
    const s=statuses[id];
    if(s==='ok')return'#34C759';
    if(s==='warn')return'#FF9F0A';
    if(s==='error')return'#FF3B30';
    return'rgba(255,255,255,0.15)';
  }

  return(
    <div style={{
      height:28,display:'flex',alignItems:'center',gap:12,padding:'0 14px',flexShrink:0,
      background:'#090909',borderTop:'1px solid rgba(255,255,255,0.07)',
      fontSize:11,userSelect:'none',
    }}>
      {/* Overall status pill */}
      <button onClick={overall.action||undefined}
        style={{display:'flex',alignItems:'center',gap:5,padding:'2px 8px',
          borderRadius:99,background:overall.color+'18',border:'1px solid '+overall.color+'30',
          cursor:overall.action?'pointer':'default',color:overall.color,
          fontSize:10,fontWeight:700,flexShrink:0,transition:'all 0.1s'}}
        onMouseEnter={e=>{if(overall.action)e.currentTarget.style.background=overall.color+'28';}}
        onMouseLeave={e=>{if(overall.action)e.currentTarget.style.background=overall.color+'18';}}>
        <span style={{width:5,height:5,borderRadius:'50%',background:overall.color,flexShrink:0}}/>
        {overall.label}
      </button>

      {/* Required services */}
      <div style={{display:'flex',gap:6,alignItems:'center'}}>
        {REQUIRED.map(s=>(
          <div key={s.id} title={`${s.label}: ${statuses[s.id]||'not set'}`}
            style={{display:'flex',alignItems:'center',gap:3}}>
            <span style={{width:5,height:5,borderRadius:'50%',background:dot(s.id),flexShrink:0}}/>
            <span style={{color:statuses[s.id]==='ok'?'#AAA':'#555',fontSize:10}}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Optional services — just dots */}
      <div style={{display:'flex',gap:4,alignItems:'center'}}>
        {OPTIONAL.map(s=>(
          <span key={s.id} title={`${s.label}: ${statuses[s.id]||'not set'}`}
            style={{width:5,height:5,borderRadius:'50%',background:dot(s.id)}}/>
        ))}
      </div>

      <div style={{flex:1}}/>

      {/* Errors */}
      {errCount>0&&(
        <button onClick={()=>fix(FIX.OPEN_ERROR_LOG)}
          style={{fontSize:10,fontWeight:700,color:'#FF3B30',background:'rgba(255,59,48,0.1)',
            padding:'1px 7px',borderRadius:99,border:'1px solid rgba(255,59,48,0.2)',cursor:'pointer'}}>
          {errCount} error{errCount!==1?'s':''}
        </button>
      )}

      {/* Diagnose button — only when issues */}
      {hasIssue&&(
        <button onClick={()=>fix(FIX.OPEN_DOCTOR)}
          style={{fontSize:10,fontWeight:600,color:'#6C63FF',background:'rgba(108,99,255,0.1)',
            padding:'1px 8px',borderRadius:99,border:'1px solid rgba(108,99,255,0.2)',cursor:'pointer',
            transition:'all 0.1s'}}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(108,99,255,0.18)'}
          onMouseLeave={e=>e.currentTarget.style.background='rgba(108,99,255,0.1)'}>
          Diagnose →
        </button>
      )}

      {/* Checking spinner */}
      {checking&&<span style={{color:'#555',fontSize:10,animation:'spin 1s linear infinite'}}>⟳</span>}
    </div>
  );
}
