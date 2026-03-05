import React from 'react';
import{useApp}from '../../context/AppContext';

const TABS=[
  {id:'dashboard',     label:'Dashboard', icon:'⌂'},
  {id:'pipeline:ideas',label:'Ideas',     icon:'💡'},
  {id:'pipeline:scripts',label:'Scripts', icon:'📄'},
  {id:'pipeline:assets',label:'Assets',   icon:'🖼'},
  {id:'pipeline:voice',label:'Voice',     icon:'🎙'},
  {id:'pipeline:compose',label:'Compose', icon:'🎞'},
  {id:'pipeline:review',label:'Review',   icon:'👁'},
  {id:'pipeline:publish',label:'Publish', icon:'🚀'},
  {id:'pipeline:analytics',label:'Analytics',icon:'📊'},
];

const ADV=[
  {id:'agents',label:'Agents',icon:'🤖'},
  {id:'tasks', label:'Tasks', icon:'📋'},
];

export default function TabBar(){
  const{activeView,setActiveView,mode}=useApp();
  return(
    <div style={{
      display:'flex',alignItems:'stretch',flexShrink:0,
      background:'#0F0F13',
      borderBottom:'1px solid rgba(255,255,255,0.07)',
      overflowX:'auto',paddingLeft:4,
    }}>
      {[...TABS,...(mode==='advanced'?ADV:[])].map(t=>{
        const active=activeView===t.id;
        return(
          <button key={t.id} onClick={()=>setActiveView(t.id)} style={{
            display:'flex',alignItems:'center',gap:5,padding:'0 14px',height:38,
            fontSize:12,fontWeight:active?600:400,
            cursor:'pointer',border:'none',background:'transparent',
            color:active?'#ECECEC':'#666',
            borderBottom:`2px solid ${active?'#6C63FF':'transparent'}`,
            whiteSpace:'nowrap',transition:'color 0.1s,border-color 0.1s',flexShrink:0,
          }}
          onMouseEnter={e=>{if(!active){e.currentTarget.style.color='#AAA';}}}
          onMouseLeave={e=>{if(!active){e.currentTarget.style.color='#666';}}}>
            <span style={{fontSize:13}}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
