import React from 'react';
import{useApp}from '../../context/AppContext';
const ITEMS=[{id:'dashboard',icon:'📺',label:'Dashboard'},{id:'pipeline',icon:'🎬',label:'Pipeline',badge:4},{id:'ideas',icon:'💡',label:'Ideas'},null,{id:'agents',icon:'🤖',label:'Agents',advanced:true},{id:'tasks',icon:'📋',label:'Tasks',advanced:true},{id:'prompts',icon:'📝',label:'Prompts',advanced:true},null,{id:'analytics',icon:'📊',label:'Analytics'},{id:'settings',icon:'⚙️',label:'Settings'}];
export default function IconNav(){
  const{activeView,setActiveView,mode,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'#0E0E1A':'#E8E8F4';
  const border=isDark?'#1A1A2A':'#D0D0E0';
  const active=isDark?'#1E1E30':'#D8D8F0';
  const activeColor=isDark?'#C8FF00':'#2200AA';
  const inactiveColor=isDark?'#6B6888':'#888899';
  return(<div className='flex flex-col items-center py-3 gap-1' style={{background:bg,borderRight:'1px solid '+border}}>
    {ITEMS.map((item,i)=>{
      if(!item)return<div key={i} className='w-7 h-px my-1.5' style={{background:border}}/>;
      if(item.advanced&&mode==='simple')return null;
      return(<button key={item.id} title={item.label} onClick={()=>setActiveView(item.id)}
        className='w-10 h-10 flex items-center justify-center rounded-md text-lg transition-all relative'
        style={{background:activeView===item.id?active:'transparent',color:activeView===item.id?activeColor:inactiveColor}}>
        {item.icon}
        {item.badge&&<div className='absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FF4F00] text-white text-[8px] font-black flex items-center justify-center'>{item.badge}</div>}
      </button>);
    })}
  </div>);
}