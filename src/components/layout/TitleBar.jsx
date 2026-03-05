import React from 'react';
import{useApp}from '../../context/AppContext';

export default function TitleBar(){
  const{mode,setMode,theme,setTheme}=useApp();
  const toggleMode=async()=>{const n=mode==='simple'?'advanced':'simple';setMode(n);await window.forge.updateSettings({mode:n});};
  const toggleTheme=async()=>{const n=theme==='dark'?'light':'dark';setTheme(n);await window.forge.updateSettings({theme:n});};
  const isDark=theme==='dark';

  return(
    <div className="h-11 flex items-center gap-3 px-4 flex-shrink-0"
      style={{
        background: isDark ? 'rgba(10,10,20,0.95)' : 'rgba(245,245,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid ' + (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.08)'),
        userSelect: 'none',
        WebkitAppRegion: 'drag',
      }}>

      {/* Traffic lights */}
      <div className="flex gap-1.5" style={{WebkitAppRegion:'no-drag'}}>
        <div className="w-3 h-3 rounded-full cursor-pointer transition-all hover:brightness-110 active:brightness-90"
          style={{background:'#FF5F57',boxShadow:'0 0 0 0.5px rgba(0,0,0,0.2)'}}
          onClick={()=>window.forge?.close()}/>
        <div className="w-3 h-3 rounded-full cursor-pointer transition-all hover:brightness-110 active:brightness-90"
          style={{background:'#FEBC2E',boxShadow:'0 0 0 0.5px rgba(0,0,0,0.2)'}}
          onClick={()=>window.forge?.minimize()}/>
        <div className="w-3 h-3 rounded-full cursor-pointer transition-all hover:brightness-110 active:brightness-90"
          style={{background:'#28C840',boxShadow:'0 0 0 0.5px rgba(0,0,0,0.2)'}}
          onClick={()=>window.forge?.maximize()}/>
      </div>

      {/* Brand */}
      <div className="flex items-baseline gap-2 ml-2">
        <span className="font-black text-sm tracking-widest uppercase"
          style={{color: isDark ? '#C8FF00' : '#2200AA', letterSpacing:'0.15em',
            textShadow: isDark ? '0 0 20px rgba(200,255,0,0.3)' : 'none'}}>
          MediaMill
        </span>
        <span className="text-[11px] font-light hidden md:inline"
          style={{color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.35)'}}>
          Human-directed or fully autonomous video production
        </span>
      </div>

      {/* Controls */}
      <div className="ml-auto flex items-center gap-2" style={{WebkitAppRegion:'no-drag'}}>
        <button onClick={toggleTheme} className="btn btn-ghost" style={isDark?{}:{background:'rgba(0,0,0,0.04)',color:'rgba(0,0,0,0.5)',border:'1px solid rgba(0,0,0,0.1)'}}>
          {isDark ? '☀︎ Light' : '● Dark'}
        </button>
        <button onClick={toggleMode} className="btn"
          style={mode==='advanced'
            ? {background:'rgba(180,0,255,0.12)',color:'#B400FF',border:'1px solid rgba(180,0,255,0.25)',boxShadow:'0 0 12px rgba(180,0,255,0.15)'}
            : {background:'rgba(200,255,0,0.08)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',boxShadow:'0 0 12px rgba(200,255,0,0.1)'}}>
          {mode==='simple' ? '◎ Simple' : '⚡ Advanced'}
        </button>
        <span className="text-[10px] font-mono" style={{color:isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.2)'}}>v0.1.0</span>
      </div>
    </div>
  );
}
