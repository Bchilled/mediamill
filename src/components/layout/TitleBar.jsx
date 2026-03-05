import React,{useState,useRef,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

function ChannelDropdown({isDark,channels,activeChannel,setActiveChannel,setActiveView,loadChannels}){
  const[open,setOpen]=useState(false);
  const[confirm,setConfirm]=useState(null);
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setConfirm(null);}};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const menuBg=isDark?'rgba(14,14,28,0.98)':'rgba(252,252,255,0.98)';
  const menuBorder=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const PC={short:'#C8FF00',mid:'#00C8FF',long:'#FF8040'};

  async function handleDelete(ch,e){
    e.stopPropagation();
    if(ch.locked){
      alert('This channel is locked. Unlock it in Channel Settings before deleting.');
      return;
    }
    if(confirm===ch.id){
      try{
        await window.forge.deleteChannel(ch.id);
        await loadChannels();
        setConfirm(null);setOpen(false);
      }catch(err){console.error(err);}
    }else{
      setConfirm(ch.id);
      setTimeout(()=>setConfirm(null),3000);
    }
  }

  return(
    <div ref={ref} style={{position:'relative',WebkitAppRegion:'no-drag',display:'flex',gap:6}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:'flex',alignItems:'center',gap:8,padding:'5px 12px',
        background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
        border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),
        borderRadius:9,cursor:'pointer',
        boxShadow:isDark?'inset 0 1px 0 rgba(255,255,255,0.06),0 2px 8px rgba(0,0,0,0.2)':'inset 0 1px 0 rgba(255,255,255,0.9),0 1px 4px rgba(0,0,0,0.06)',
        transition:'all 0.12s',
      }}
        onMouseEnter={e=>e.currentTarget.style.borderColor=accent+'60'}
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

      <button onClick={onNewChannel||undefined} className="btn btn-primary" style={{fontSize:11,padding:'5px 12px',flexShrink:0}}>
        + New Channel
      </button>

      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,minWidth:250,zIndex:1000,background:menuBg,border:'1px solid '+menuBorder,borderRadius:12,boxShadow:'0 16px 48px rgba(0,0,0,0.4)',overflow:'hidden'}}>
          {channels.length===0&&<div style={{padding:'12px 16px',fontSize:12,color:muted}}>No channels yet</div>}
          {channels.map(ch=>(
            <div key={ch.id} style={{display:'flex',alignItems:'center',gap:8,padding:'9px 12px',
              background:activeChannel?.id===ch.id?(isDark?'rgba(200,255,0,0.06)':'rgba(68,0,204,0.05)'):'transparent',
              transition:'background 0.1s'}}
              onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background=activeChannel?.id===ch.id?(isDark?'rgba(200,255,0,0.06)':'rgba(68,0,204,0.05)'):'transparent'}>
              {/* Select area */}
              <div onClick={()=>{setActiveChannel(ch);setOpen(false);setConfirm(null);}}
                style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0,cursor:'pointer'}}>
                <span style={{width:7,height:7,borderRadius:'50%',flexShrink:0,background:PC[ch.preset]||'#888',boxShadow:'0 0 6px '+(PC[ch.preset]||'#888')}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.name}</div>
                  <div style={{fontSize:10,color:muted,textTransform:'capitalize'}}>{ch.preset}-form · {ch.auto_approve?'Auto':'Manual'}</div>
                </div>
                {activeChannel?.id===ch.id&&<span style={{fontSize:10,color:accent,flexShrink:0}}>✓</span>}
              </div>
              {/* Lock / Delete */}
              <div style={{display:'flex',gap:4,flexShrink:0}}>
                <button onClick={async e=>{e.stopPropagation();try{await window.forge.updateChannel(ch.id,{locked:ch.locked?0:1});await loadChannels();}catch(err){console.error(err);}}}
                  title={ch.locked?'Unlock channel':'Lock channel'}
                  style={{flexShrink:0,padding:'3px 7px',borderRadius:6,fontSize:11,cursor:'pointer',
                    background:ch.locked?'rgba(255,170,0,0.12)':'transparent',
                    border:'1px solid '+(ch.locked?'rgba(255,170,0,0.3)':'rgba(255,255,255,0.08)'),
                    color:ch.locked?'#FFAA00':muted,transition:'all 0.15s'}}>
                  {ch.locked?'🔒':'🔓'}
                </button>
                <button onClick={e=>handleDelete(ch,e)} style={{
                  flexShrink:0,padding:'3px 8px',borderRadius:6,fontSize:10,fontWeight:700,cursor:'pointer',
                  background:confirm===ch.id?'rgba(238,34,68,0.15)':'transparent',
                  border:'1px solid '+(confirm===ch.id?'rgba(238,34,68,0.5)':'rgba(255,255,255,0.08)'),
                  color:confirm===ch.id?'#EE2244':ch.locked?'rgba(255,255,255,0.15)':muted,
                  transition:'all 0.15s',opacity:ch.locked?0.4:1,
                }}
                  onMouseEnter={e=>{if(!ch.locked){e.currentTarget.style.borderColor='rgba(238,34,68,0.5)';e.currentTarget.style.color='#EE2244';}}}
                  onMouseLeave={e=>{if(confirm!==ch.id){e.currentTarget.style.borderColor='rgba(255,255,255,0.08)';e.currentTarget.style.color=ch.locked?'rgba(255,255,255,0.15)':muted;}}}>
                  {confirm===ch.id?'Sure?':'✕'}
                </button>
              </div>
            </div>
          ))}
          <div style={{borderTop:'1px solid '+menuBorder,padding:'8px 14px'}}>
            <button onClick={()=>{setActiveView('channels');setOpen(false);}}
              style={{fontSize:11,color:muted,background:'transparent',border:'none',cursor:'pointer',padding:0}}>
              Manage channels →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TitleBar({onNewChannel,onSystemSetup,onDoctor}){
  const{mode,setMode,theme,setTheme,channels,activeChannel,setActiveChannel,setActiveView,loadChannels}=useApp();
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
      <span style={{fontWeight:900,fontSize:13,letterSpacing:'0.16em',textTransform:'uppercase',color:isDark?'#C8FF00':'#4400CC',textShadow:isDark?'0 0 24px rgba(200,255,0,0.4)':'none',marginRight:6,flexShrink:0}}>
        MediaMill
      </span>

      <ChannelDropdown isDark={isDark} channels={channels||[]} activeChannel={activeChannel}
        setActiveChannel={setActiveChannel} setActiveView={setActiveView} loadChannels={loadChannels}/>

      <div style={{flex:1}}/>

      <div style={{display:'flex',alignItems:'center',gap:6,WebkitAppRegion:'no-drag'}}>
        <button onClick={()=>setActiveView('settings')} title="Settings"
          style={{background:'transparent',border:'none',cursor:'pointer',color:txt,padding:'4px 8px',fontSize:15,borderRadius:7,transition:'all 0.1s'}}
          onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>⚙</button>
        <button onClick={onDoctor} title="System Doctor — diagnose and fix issues" WebkitAppRegion="no-drag"
          style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:7,
            cursor:'pointer',color:txt,padding:'4px 8px',fontSize:12,flexShrink:0,transition:'all 0.1s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
          🔬
        </button>
        <button onClick={onSystemSetup} title="System Setup — API keys and configuration" WebkitAppRegion="no-drag"
          style={{background:'transparent',border:'1px solid rgba(255,255,255,0.08)',borderRadius:7,
            cursor:'pointer',color:txt,padding:'4px 8px',fontSize:12,flexShrink:0,transition:'all 0.1s'}}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.08)';}}
          onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}>
          ⚙️
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
