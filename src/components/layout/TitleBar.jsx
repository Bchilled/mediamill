import React from 'react';
import{useApp}from '../../context/AppContext';

export default function TitleBar(){
  const{mode,setMode,theme,setTheme}=useApp();
  const isDark=theme==='dark';
  const toggleMode=async()=>{const n=mode==='simple'?'advanced':'simple';setMode(n);try{await window.forge.updateSettings({mode:n});}catch(e){}};
  const toggleTheme=async()=>{const n=isDark?'light':'dark';setTheme(n);try{await window.forge.updateSettings({theme:n});}catch(e){}};

  const txt=isDark?'rgba(255,255,255,0.85)':'rgba(0,0,0,0.75)';
  const sub=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.38)';

  return(
    <div style={{
      height:46,display:'flex',alignItems:'center',gap:12,padding:'0 16px',flexShrink:0,
      background:isDark?'rgba(12,12,24,0.95)':'rgba(248,248,255,0.95)',
      backdropFilter:'blur(20px)',
      borderBottom:'1px solid '+(isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.09)'),
      borderRadius:'14px 14px 0 0',
      userSelect:'none',WebkitAppRegion:'drag',
    }}>

      {/* Brand — left */}
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <span style={{
          fontWeight:900,fontSize:13,letterSpacing:'0.16em',textTransform:'uppercase',
          color:isDark?'#C8FF00':'#4400CC',
          textShadow:isDark?'0 0 24px rgba(200,255,0,0.4)':'none',
        }}>MediaMill</span>
        <span style={{fontSize:11,fontWeight:400,color:sub,display:'none'}} className="md:inline-block">
          Human-directed or fully autonomous video production
        </span>
      </div>

      {/* Controls — right, Windows order: theme | mode | min | max | close */}
      <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:8,WebkitAppRegion:'no-drag'}}>

        <button onClick={toggleTheme} className={isDark?'btn btn-ghost':'btn btn-ghost-light'}
          title={isDark?'Switch to Light Mode':'Switch to Dark Mode'}>
          {isDark?'☀︎ Light':'◑ Dark'}
        </button>

        <button onClick={toggleMode} className="btn" title={mode==='simple'?'Switch to Advanced Mode':'Switch to Simple Mode'}
          style={mode==='advanced'
            ?{background:'rgba(160,80,255,0.12)',color:'#B060FF',border:'1px solid rgba(160,80,255,0.28)',boxShadow:'0 0 14px rgba(160,80,255,0.18),inset 0 1px 0 rgba(255,255,255,0.06)'}
            :{background:'rgba(200,255,0,0.08)',color:'#B8E800',border:'1px solid rgba(200,255,0,0.22)',boxShadow:'0 0 14px rgba(200,255,0,0.1),inset 0 1px 0 rgba(255,255,255,0.06)'}}>
          {mode==='simple'?'◎ Simple':'⚡ Advanced'}
        </button>

        <span style={{width:1,height:18,background:isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)',margin:'0 2px'}}/>

        {/* Windows traffic lights: min, max, close — RIGHT side */}
        {[
          {icon:'—',tip:'Minimize',action:()=>window.forge?.minimize(),hover:'rgba(255,255,255,0.12)'},
          {icon:'⬜',tip:'Maximize',action:()=>window.forge?.maximize(),hover:'rgba(255,255,255,0.12)'},
          {icon:'✕',tip:'Close',action:()=>window.forge?.close(),hover:'rgba(232,17,35,0.9)',hoverTxt:'#fff'},
        ].map(b=>(
          <button key={b.tip} title={b.tip} onClick={b.action}
            className="btn" style={{
              background:'transparent',color:txt,border:'none',
              padding:'4px 10px',fontSize:b.icon==='⬜'?10:13,fontWeight:400,
              boxShadow:'none',borderRadius:6,
            }}
            onMouseEnter={e=>{e.currentTarget.style.background=b.hover;if(b.hoverTxt)e.currentTarget.style.color=b.hoverTxt;}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=txt;}}>
            {b.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
