import React from 'react';
import{useApp}from '../../context/AppContext';
const TABS=[{id:'dashboard',label:'📺 Dashboard'},{id:'pipeline',label:'🎬 Pipeline',badge:4},{id:'ideas',label:'💡 Ideas'},{id:'agents',label:'🤖 Agents',advanced:true},{id:'tasks',label:'📋 Tasks',advanced:true},{id:'prompts',label:'📝 Prompts',advanced:true},{id:'analytics',label:'📊 Analytics'},{id:'settings',label:'⚙️ Settings'}];
export default function TabBar(){
  const{activeView,setActiveView,mode,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'#0E0E1A':'#E8E8F4';
  const border=isDark?'#1A1A2A':'#D0D0E0';
  const active=isDark?'#C8FF00':'#2200AA';
  const inactive=isDark?'#6B6888':'#888899';
  const tabs=TABS.filter(t=>!t.advanced||mode==='advanced');
  return(<div className='flex flex-shrink-0 overflow-x-auto' style={{background:bg,borderBottom:'1px solid '+border}}>
    {tabs.map(t=>(
      <button key={t.id} onClick={()=>setActiveView(t.id)}
        className='px-4 py-3 text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5'
        style={{color:activeView===t.id?active:inactive,borderBottom:activeView===t.id?'2px solid '+active:'2px solid transparent'}}>
        {t.label}
        {t.badge&&<span className='bg-[#FF4F00] text-white text-[8px] font-black px-1 py-0.5 rounded-full'>{t.badge}</span>}
      </button>
    ))}
  </div>);
}