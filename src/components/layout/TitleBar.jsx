import React,{useState,useRef,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

function ChannelDropdown({isDark,channels,activeChannel,setActiveChannel,setActiveView}){
  const[open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false);};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const menuBg=isDark?'rgba(14,14,28,0.98)':'rgba(252,252,255,0.98)';
  const menuBorder=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';
  const accentColor=isDark?'#C8FF00':'#4400CC';
  const PC={short:'#C8FF00',mid:'#00C8FF',long:'#FF8040'};

  return(
    <div ref={ref} style={{position:'relative',WebkitAppRegion:'no-drag'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:'flex',alignItems:'center',gap:8,padding:'5px 12px',
        background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
        border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),
        borderRadius:9,cursor:'pointer',
        boxShadow:isDark?'inset 0 1px 0 rgba(255,255,255,0.06),0 2px 8px rgba(0,0,0,0.2)':'inset 0 1px 0 rgba(255,255,255,0.9),0 1px 4px rgba(0,0,0,0.06)',
        transition:'all 0.12s ease',
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=accentColor+'60'}
        onMouseLeave={e=>e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}>
        {activeChannel?(
          <>
            <span style={{width:7,height:7,borderRadius:'50%',background:PC[activeChannel.preset]||'#888',boxShadow:'0 0 6px '+(PC[activeChannel.preset]||'#888'),flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:600,color:text,maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeChannel.name}</span>
          </>
        ):(
          <span style={{fontSize:12,color:muted}}>Select channel…</span>
        )}
        <span style={{fontSize:9,color:muted,marginLeft:2}}>{open?'▲':'▼'}</span>
      </button>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,minWidth:220,zIndex:1000,background:menuBg,border:'1px solid '+menuBorder,borderRadius:12,boxShadow:'0 16px 48px rgba(0,0,0,0.4)',overflow:'hidden'}}>
          {channels.length===0&&<div style={{padding:'12px 16px',fontSize:12,color:muted}}>No channels yet</div>}
          {channels.map(ch=>(
            <div key={ch.id} onClick={()=>{setActiveChannel(ch);setOpen(false);}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',cursor:'pointer',background:activeChannel?.id===ch.id?(isDark?'rgba(200,255,0,0.06)':'rgba(68,0,204,0.05)'):'transparent',transition:'background 0.1s'}}
              onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background=activeChannel?.id===ch.id?(isDark?'rgba(200,255,0,0.06)':'rgba(68,0,204,0.05)'):'transparent'}>
              <span style={{width:7,height:7,borderRadius:'50%',flexShrink:0,background:PC[ch.preset]||'#888',boxShadow:'0 0 6px '+(PC[ch.preset]||'#888')}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.name}</div>
                <div style={{fontSize:10,color:muted,textTransform:'capitalize'}}>{ch.preset}-form · {ch.auto_approve?'Auto':'Manual'}</div>
              </div>
              {activeChannel?.id===ch.id&&<span style={{fontSize:10,color:accentColor}}>✓</span>}
            </div>
          ))}
          <div style={{borderTop:'1px solid '+menuBorder,padding:8}}>
            <button onClick={()=>{setActiveView('channels');setOpen(false);}}
              style={{width:'100%',padding:'8px 10px',fontSize:11,fontWeight:600,background:'transparent',border:'1px dashed '+(isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)'),borderRadius:8,color:muted,cursor:'pointer',transition:'all 0.12s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor;e.currentTarget.style.color=accentColor;}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)';e.currentTarget.style.color=muted;}}>
              + New Channel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TitleBar(){
  const{mode,setMode,theme,setTheme,channels,activeChannel,setActiveChannel,setActiveView}=useApp();
  const isDark=theme==='dark';
  const toggleMode=async()=>{const n=mode==='simple'?'advanced':'simple';setMode(n);try{await window.forge.updateSettings({mode:n});}catch(e){}};
  const toggleTheme=async()=>{const n=isDark?'light':'dark';setTheme(n);try{await window.forge.updateSettings({theme:n});}catch(e){}};
  const txt=isDark?'rgba(255,255,255,0.7)':'rgba(0,0,0,0.6)';

  return(
    <div style={{
      height:46,display:'flex',alignItems:'center',gap:10,padding:'0 12px',flexShrink:0,
      background:isDark?'rgba(12,12,24,0.95)':'rgba(248,248,255,0.95)',
      backdropFilter:'blur(20px)',
      borderBottom:'1px solid '+(isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.09)'),
      borderRadius:'14px 14px 0 0',
      userSelect:'none',WebkitAppRegion:'drag',
    }}>
      <span style={{fontWeight:900,fontSize:13,letterSpacing:'0.16em',textTransform:'uppercase',color:isDark?'#C8FF00':'#4400CC',textShadow:isDark?'0 0 24px rgba(200,255,0,0.4)':'none',marginRight:4,flexShrink:0}}>
        MediaMill
      </span>

      <ChannelDropdown isDark={isDark} channels={channels} activeChannel={activeChannel}
        setActiveChannel={setActiveChannel} setActiveView={setActiveView}/>

      <div style={{flex:1}}/>

      <div style={{display:'flex',alignItems:'center',gap:6,WebkitAppRegion:'no-drag'}}>
        {/* Settings icon button */}
        <button onClick={()=>setActiveView('settings')} title="Settings"
          style={{background:'transparent',border:'none',cursor:'pointer',color:txt,padding:'4px 8px',fontSize:15,borderRadius:7,transition:'all 0.1s'}}
          onMouseEnter={e=>{e.currentTarget.style.background=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';e.currentTarget.style.color=isDark?'#fff':'#000';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=txt;}}>
          ⚙
        </button>
        <button onClick={toggleTheme} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:11,padding:'5px 10px'}}>
          {isDark?'☀︎ Light':'◑ Dark'}
        </button>
        <button onClick={toggleMode} className="btn" style={mode==='advanced'
          ?{fontSize:11,padding:'5px 10px',background:'rgba(160,80,255,0.12)',color:'#B060FF',border:'1px solid rgba(160,80,255,0.28)'}
          :{fontSize:11,padding:'5px 10px',background:'rgba(200,255,0,0.08)',color:'#B8E800',border:'1px solid rgba(200,255,0,0.22)'}}>
          {mode==='simple'?'◎ Simple':'⚡ Advanced'}
        </button>
        <span style={{width:1,height:16,background:isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)',margin:'0 2px'}}/>
        {[
          {icon:'—',tip:'Minimize',fn:()=>window.forge?.minimize()},
          {icon:'⬜',tip:'Maximize',fn:()=>window.forge?.maximize()},
          {icon:'✕',tip:'Close',fn:()=>window.forge?.close(),danger:true},
        ].map(b=>(
          <button key={b.tip} title={b.tip} onClick={b.fn}
            style={{background:'transparent',border:'none',cursor:'pointer',color:txt,padding:'4px 8px',fontSize:b.icon==='⬜'?10:13,borderRadius:6,transition:'all 0.1s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=b.danger?'rgba(232,17,35,0.9)':'rgba(255,255,255,0.1)';if(b.danger)e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=txt;}}>
            {b.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
