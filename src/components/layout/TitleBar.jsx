import React from 'react';
import{useApp}from '../../context/AppContext';
export default function TitleBar(){
  const{mode,setMode,theme,setTheme}=useApp();
  const toggleMode=async()=>{const n=mode==='simple'?'advanced':'simple';setMode(n);await window.forge.updateSettings({mode:n});};
  const toggleTheme=async()=>{const n=theme==='dark'?'light':'dark';setTheme(n);await window.forge.updateSettings({theme:n});};
  const isDark=theme==='dark';
  return(<div className='h-10 flex items-center gap-4 px-5 flex-shrink-0'
    style={{background:isDark?'#0E0E1A':'#F0F0F8',borderBottom:'1px solid '+(isDark?'#1A1A2A':'#D0D0E0'),userSelect:'none'}}>
    <div className='flex gap-2'>
      <div className='w-3 h-3 rounded-full bg-[#FF5F57] cursor-pointer' onClick={()=>window.forge?.close()}/>
      <div className='w-3 h-3 rounded-full bg-[#FEBC2E] cursor-pointer' onClick={()=>window.forge?.minimize()}/>
      <div className='w-3 h-3 rounded-full bg-[#28C840] cursor-pointer' onClick={()=>window.forge?.maximize()}/>
    </div>
    <div>
      <span className='font-black text-base tracking-widest uppercase' style={{color:isDark?'#C8FF00':'#2200AA'}}>MediaMill</span>
      <span className='text-xs ml-2 font-light' style={{color:isDark?'#6B6888':'#888899'}}>Human-directed or fully autonomous video production</span>
    </div>
    <div className='ml-auto flex items-center gap-3'>
      <button onClick={toggleTheme}
        className='px-3 py-1.5 text-[11px] font-bold border transition-all'
        style={{background:'transparent',borderColor:isDark?'#252538':'#C0C0D0',color:isDark?'#6B6888':'#555566'}}>
        {isDark?'☀ Light':'◑ Dark'}
      </button>
      <span className='text-[10px]' style={{color:isDark?'#6B6888':'#888899'}}>Mode</span>
      <button onClick={toggleMode}
        className='px-3 py-1.5 text-[11px] font-bold border transition-all'
        style={{background:mode==='advanced'?'rgba(180,0,255,0.1)':'rgba(200,255,0,0.06)',borderColor:mode==='advanced'?'rgba(180,0,255,0.3)':'rgba(200,255,0,0.2)',color:mode==='advanced'?'#B400FF':'#C8FF00'}}>
        {mode==='simple'?'◎ Simple':'⚡ Advanced'}
      </button>
      <span className='text-[10px] text-[#2E2E48]'>v0.1.0</span>
    </div>
  </div>);
}