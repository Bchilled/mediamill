import React from 'react';
import{useApp}from '../../context/AppContext';

const TABS=[
  {id:'dashboard',label:'Dashboard',icon:'📺'},
  {id:'pipeline',label:'Pipeline',icon:'🎬',badge:4},
  {id:'ideas',label:'Ideas',icon:'💡'},
  {id:'agents',label:'Agents',icon:'🤖',advanced:true},
  {id:'tasks',label:'Tasks',icon:'📋',advanced:true},
  {id:'prompts',label:'Prompts',icon:'📝',advanced:true},
  {id:'analytics',label:'Analytics',icon:'📊'},
  {id:'settings',label:'Settings',icon:'⚙️'},
];

export default function TabBar(){
  const{activeView,setActiveView,mode,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'rgba(10,10,22,0.7)':'rgba(240,240,255,0.8)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)';
  const activeColor=isDark?'#C8FF00':'#4400CC';
  const inactiveColor=isDark?'rgba(255,255,255,0.45)':'rgba(0,0,20,0.5)';
  const tabs=TABS.filter(t=>!t.advanced||mode==='advanced');

  return(
    <div style={{display:'flex',flexShrink:0,overflowX:'auto',background:bg,borderBottom:'1px solid '+border}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setActiveView(t.id)}
          className="tab-item"
          style={{color:activeView===t.id?activeColor:inactiveColor,borderBottom:'2px solid '+(activeView===t.id?activeColor:'transparent'),fontWeight:activeView===t.id?700:500}}
          onMouseEnter={e=>{if(activeView!==t.id)e.currentTarget.style.color=isDark?'rgba(255,255,255,0.8)':'rgba(0,0,20,0.8)';}}
          onMouseLeave={e=>{if(activeView!==t.id)e.currentTarget.style.color=inactiveColor;}}>
          <span>{t.icon}</span>
          <span>{t.label}</span>
          {t.badge&&<span className="badge">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}
