import React,{useState,useRef,useEffect}from 'react';
import{useApp}from '../../context/AppContext';
import{subscribeNotifications}from '../../utils/notifications';
import NotificationPanel from '../shared/NotificationPanel';

function ChannelDropdown({isDark,channels,activeChannel,setActiveChannel,setActiveView,loadChannels,onNewChannel=()=>{}}){
  const[open,setOpen]=useState(false);
  const[confirm,setConfirm]=useState(null);
  const ref=useRef();
  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setConfirm(null);}};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.45)':'rgba(0,0,20,0.5)';
  const menuBg=isDark?'rgba(14,14,28,0.99)':'rgba(252,252,255,0.99)';
  const menuBorder=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const PC={short:'#C8FF00',mid:'#00C8FF',long:'#FF8040'};
  async function handleDelete(ch,e){
    e.stopPropagation();
    if(ch.locked){alert('Unlock this channel before deleting.');return;}
    if(confirm===ch.id){
      try{await window.forge.deleteChannel(ch.id);await loadChannels();setConfirm(null);setOpen(false);}catch(err){}
    }else{setConfirm(ch.id);setTimeout(()=>setConfirm(null),3000);}
  }
  return(
    <div ref={ref} style={{position:'relative',WebkitAppRegion:'no-drag',display:'flex',gap:6}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:'flex',alignItems:'center',gap:8,padding:'5px 14px',minWidth:150,
        background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',
        border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),
        borderRadius:9,cursor:'pointer',transition:'all 0.12s'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor=accent+'60'}
        onMouseLeave={e=>e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}>
        {activeChannel?(<>
          <span style={{width:7,height:7,borderRadius:'50%',background:PC[activeChannel.preset]||'#888',boxShadow:'0 0 6px '+(PC[activeChannel.preset]||'#888'),flexShrink:0}}/>
          <span style={{fontSize:12,fontWeight:600,color:text,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',textAlign:'left'}}>{activeChannel.name}</span>
        </>):(
          <span style={{fontSize:12,color:muted,flex:1,textAlign:'left'}}>Select channel…</span>
        )}
        <span style={{fontSize:9,color:muted}}>{open?'▲':'▼'}</span>
      </button>
      <button onClick={onNewChannel} style={{
        fontSize:11,fontWeight:700,padding:'5px 14px',borderRadius:9,cursor:'pointer',flexShrink:0,
        background:accent,color:'#000',border:'none'}}>
        + New Channel
      </button>
      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,minWidth:270,zIndex:2000,
          background:menuBg,border:'1px solid '+menuBorder,borderRadius:12,
          boxShadow:'0 16px 48px rgba(0,0,0,0.5)',overflow:'hidden'}}>
          {channels.length===0?(
            <div style={{padding:'20px 16px',fontSize:12,color:muted,textAlign:'center'}}>
              <div style={{fontSize:24,marginBottom:8}}>📺</div>
              No channels yet<br/>
              <span style={{fontSize:10}}>Click "+ New Channel" to create one</span>
            </div>
          ):channels.map(ch=>(
            <div key={ch.id} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',
              background:activeChannel?.id===ch.id?(isDark?'rgba(200,255,0,0.07)':'rgba(68,0,204,0.05)'):'transparent',
              transition:'background 0.1s'}}
              onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.03)'}
              onMouseLeave={e=>e.currentTarget.style.background=activeChannel?.id===ch.id?(isDark?'rgba(200,255,0,0.07)':'rgba(68,0,204,0.05)'):'transparent'}>
              <div onClick={()=>{setActiveChannel(ch);setOpen(false);setConfirm(null);}}
                style={{display:'flex',alignItems:'center',gap:8,flex:1,minWidth:0,cursor:'pointer'}}>
                <span style={{width:8,height:8,borderRadius:'50%',flexShrink:0,background:PC[ch.preset]||'#888',boxShadow:'0 0 6px '+(PC[ch.preset]||'#888')}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.name}</div>
                  <div style={{fontSize:10,color:muted,marginTop:1}}>{ch.preset}-form · {ch.auto_approve?'Auto':'Manual'}</div>
                </div>
                {activeChannel?.id===ch.id&&<span style={{fontSize:10,color:accent,fontWeight:700}}>✓</span>}
              </div>
              <div style={{display:'flex',gap:3}}>
                <button onClick={async e=>{e.stopPropagation();try{await window.forge.updateChannel(ch.id,{locked:ch.locked?0:1});await loadChannels();}catch(err){}}}
                  title={ch.locked?'Unlock':'Lock'}
                  style={{padding:'3px 6px',borderRadius:5,fontSize:11,cursor:'pointer',
                    background:ch.locked?'rgba(255,170,0,0.12)':'transparent',
                    border:'1px solid '+(ch.locked?'rgba(255,170,0,0.3)':'rgba(255,255,255,0.08)'),
                    color:ch.locked?'#FFAA00':muted}}>
                  {ch.locked?'🔒':'🔓'}
                </button>
                <button onClick={e=>handleDelete(ch,e)} style={{padding:'3px 7px',borderRadius:5,fontSize:10,fontWeight:700,cursor:'pointer',
                  background:confirm===ch.id?'rgba(238,34,68,0.15)':'transparent',
                  border:'1px solid '+(confirm===ch.id?'rgba(238,34,68,0.5)':'rgba(255,255,255,0.08)'),
                  color:confirm===ch.id?'#EE2244':muted,opacity:ch.locked?0.3:1}}>
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

function AlertsBell({isDark}){
  const[notifs,setNotifs]=useState([]);
  const[open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>subscribeNotifications(setNotifs),[]);
  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener('mousedown',h);
    return()=>document.removeEventListener('mousedown',h);
  },[]);
  const unread=notifs.filter(n=>!n.read).length;
  const hasError=notifs.some(n=>!n.read&&n.type==='error');
  const hasWarn=!hasError&&notifs.some(n=>!n.read&&n.type==='warning');
  const badgeColor=hasError?'#EE2244':hasWarn?'#FFAA00':'#00E676';
  const txt=isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.6)';
  return(
    <div ref={ref} style={{position:'relative',flexShrink:0,WebkitAppRegion:'no-drag'}}>
      <button onClick={()=>setOpen(o=>!o)} title="Alerts & Notifications"
        style={{display:'flex',alignItems:'center',gap:5,padding:'4px 10px',
          background:'transparent',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,
          cursor:'pointer',color:txt,fontSize:11,fontWeight:600,transition:'all 0.1s',position:'relative'}}
        onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        <span style={{fontSize:12}}>🔔</span>
        <span>Alerts</span>
        {unread>0&&<span style={{minWidth:16,height:16,borderRadius:99,background:badgeColor,
          fontSize:8,fontWeight:900,color:'#000',display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px'}}>
          {unread>9?'9+':unread}
        </span>}
      </button>
      {open&&<NotificationPanel isDark={isDark} onClose={()=>setOpen(false)}/>}
    </div>
  );
}

export default function TitleBar({onNewChannel,onSystemSetup,onDoctor}){
  const{mode,setMode,theme,setTheme,channels,activeChannel,setActiveChannel,setActiveView,loadChannels}=useApp();
  const isDark=theme==='dark';
  const toggleMode=async()=>{const n=mode==='simple'?'advanced':'simple';setMode(n);try{await window.forge.updateSettings({mode:n});}catch(e){}};
  const toggleTheme=async()=>{const n=isDark?'light':'dark';setTheme(n);try{await window.forge.updateSettings({theme:n});}catch(e){}};
  const txt=isDark?'rgba(255,255,255,0.65)':'rgba(0,0,0,0.6)';
  const accent=isDark?'#C8FF00':'#4400CC';
  function IconBtn({onClick,title,children}){
    return(
      <button onClick={onClick} title={title}
        style={{fontSize:11,fontWeight:600,padding:'4px 10px',borderRadius:8,cursor:'pointer',
          background:'transparent',border:'1px solid rgba(255,255,255,0.1)',color:txt,transition:'all 0.1s'}}
        onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.05)'}
        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
        {children}
      </button>
    );
  }
  return(
    <div style={{height:46,display:'flex',alignItems:'center',gap:6,padding:'0 12px',flexShrink:0,
      background:isDark?'rgba(12,12,24,0.97)':'rgba(248,248,255,0.97)',
      backdropFilter:'blur(20px)',
      borderBottom:'1px solid '+(isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.09)'),
      borderRadius:'14px 14px 0 0',
      userSelect:'none',WebkitAppRegion:'drag'}}>

      <span style={{fontWeight:900,fontSize:13,letterSpacing:'0.16em',textTransform:'uppercase',
        color:accent,textShadow:isDark?'0 0 24px rgba(200,255,0,0.35)':'none',
        marginRight:4,flexShrink:0,WebkitAppRegion:'no-drag'}}>
        MediaMill
      </span>

      <ChannelDropdown isDark={isDark} channels={channels||[]} activeChannel={activeChannel}
        setActiveChannel={setActiveChannel} setActiveView={setActiveView} loadChannels={loadChannels}
        onNewChannel={onNewChannel}/>

      <div style={{flex:1}}/>

      <div style={{display:'flex',alignItems:'center',gap:5,WebkitAppRegion:'no-drag'}}>
        <AlertsBell isDark={isDark}/>
        <span style={{width:1,height:16,background:isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)',margin:'0 2px'}}/>
        <IconBtn onClick={toggleTheme} title={isDark?'Switch to Light mode':'Switch to Dark mode'}>
          {isDark?'☀ Light':'◑ Dark'}
        </IconBtn>
        <IconBtn onClick={toggleMode} title="Toggle operation mode">
          {mode==='simple'?'◎ Simple':'⚡ Advanced'}
        </IconBtn>
        {/* Single settings cog */}
        <IconBtn onClick={()=>setActiveView('settings')} title="Settings">⚙ Settings</IconBtn>
        <span style={{width:1,height:16,background:isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)',margin:'0 2px'}}/>
        {[
          {icon:'—',tip:'Minimize',fn:()=>window.forge?.minimize()},
          {icon:'⬜',tip:'Maximize',fn:()=>window.forge?.maximize()},
          {icon:'✕',tip:'Close',fn:()=>window.forge?.close(),danger:true},
        ].map(b=>(
          <button key={b.tip} title={b.tip} onClick={b.fn}
            style={{background:'transparent',border:'none',cursor:'pointer',color:txt,
              padding:'4px 8px',fontSize:b.icon==='⬜'?10:13,borderRadius:6,transition:'all 0.1s'}}
            onMouseEnter={e=>{e.currentTarget.style.background=b.danger?'rgba(232,17,35,0.9)':'rgba(255,255,255,0.1)';if(b.danger)e.currentTarget.style.color='#fff';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=txt;}}>
            {b.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
