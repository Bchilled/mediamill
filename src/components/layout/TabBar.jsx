import React from 'react';
import{useApp}from '../../context/AppContext';

const PIPELINE_TABS=[
  {id:'pipeline:ideas',label:'Ideas',icon:'💡'},
  {id:'pipeline:scripts',label:'Scripts',icon:'📄'},
  {id:'pipeline:assets',label:'Assets',icon:'🖼'},
  {id:'pipeline:voice',label:'Voice',icon:'🎙'},
  {id:'pipeline:compose',label:'Compose',icon:'🎞'},
  {id:'pipeline:review',label:'Review',icon:'👁'},
  {id:'pipeline:publish',label:'Publish',icon:'🚀'},
  {id:'pipeline:analytics',label:'Analytics',icon:'📊'},
];

const ADVANCED_TABS=[
  {id:'agents',label:'Agents',icon:'🤖'},
  {id:'tasks',label:'Tasks',icon:'📋'},
  {id:'prompts',label:'Prompts',icon:'📝'},
];

export default function TabBar(){
  const{activeView,setActiveView,mode,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'rgba(10,10,22,0.7)':'rgba(240,240,255,0.8)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)';
  const activeColor=isDark?'#C8FF00':'#4400CC';
  const inactive=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sep=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.07)';

  const tab=(t,small=false)=>{
    const isActive=activeView===t.id;
    return(
      <button key={t.id} onClick={()=>setActiveView(t.id)}
        style={{
          display:'flex',alignItems:'center',gap:5,
          padding:small?'7px 12px':'9px 16px',
          fontSize:small?11:12,fontWeight:isActive?700:400,
          cursor:'pointer',border:'none',background:'transparent',
          color:isActive?activeColor:inactive,
          borderBottom:'2px solid '+(isActive?activeColor:'transparent'),
          whiteSpace:'nowrap',transition:'color 0.1s',flexShrink:0,
        }}
        onMouseEnter={e=>{if(!isActive)e.currentTarget.style.color=isDark?'rgba(255,255,255,0.75)':'rgba(0,0,20,0.75)';}}
        onMouseLeave={e=>{if(!isActive)e.currentTarget.style.color=inactive;}}>
        <span>{t.icon}</span>
        <span>{t.label}</span>
      </button>
    );
  };

  return(
    <div style={{display:'flex',alignItems:'center',flexShrink:0,overflowX:'auto',background:bg,borderBottom:'1px solid '+border}}>
      {PIPELINE_TABS.map(t=>tab(t))}

      {mode==='advanced'&&(
        <>
          <div style={{width:1,height:20,background:sep,margin:'0 4px',flexShrink:0}}/>
          {ADVANCED_TABS.map(t=>tab(t,true))}
        </>
      )}
    </div>
  );
}
