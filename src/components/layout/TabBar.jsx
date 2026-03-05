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
  const bg=isDark?'rgba(10,10,22,0.98)':'rgba(242,242,252,0.98)';
  const border=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.08)';
  const active=isDark?'#C8FF00':'#2200AA';
  const inactive=isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.4)';
  const tabs=TABS.filter(t=>!t.advanced||mode==='advanced');

  return(
    <div className="flex flex-shrink-0 overflow-x-auto"
      style={{background:bg,borderBottom:'1px solid '+border}}>
      {tabs.map(t=>(
        <button key={t.id} onClick={()=>setActiveView(t.id)}
          className="tab-item"
          style={{
            color:activeView===t.id?active:inactive,
            borderBottom:'2px solid '+(activeView===t.id?active:'transparent'),
          }}>
          <span>{t.icon}</span>
          <span>{t.label}</span>
          {t.badge&&<span className="badge">{t.badge}</span>}
        </button>
      ))}
    </div>
  );
}
