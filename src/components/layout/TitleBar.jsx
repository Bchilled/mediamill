import React,{useState,useRef,useEffect}from 'react';
import{useApp}from '../../context/AppContext';
import{subscribeNotifications}from '../../utils/notifications';
import NotificationPanel from '../shared/NotificationPanel';

function ChannelDropdown({channels,activeChannel,setActiveChannel,setActiveView,loadChannels,onNewChannel}){
  const[open,setOpen]=useState(false);
  const[confirm,setConfirm]=useState(null);
  const ref=useRef();

  useEffect(()=>{
    const h=e=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setConfirm(null);}};
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);

  const PC={short:'#6C63FF',mid:'#34C759',long:'#FF9F0A'};

  async function del(ch,e){
    e.stopPropagation();
    if(ch.locked){alert('Unlock before deleting.');return;}
    if(confirm===ch.id){
      try{await window.forge.deleteChannel(ch.id);await loadChannels();setConfirm(null);setOpen(false);}catch(_){}
    }else{setConfirm(ch.id);setTimeout(()=>setConfirm(null),3000);}
  }

  return(
    <div ref={ref} style={{position:'relative',WebkitAppRegion:'no-drag',display:'flex',gap:6,alignItems:'center'}}>
      <button onClick={()=>setOpen(o=>!o)} style={{
        display:'flex',alignItems:'center',gap:8,padding:'6px 12px',minWidth:155,
        background:'rgba(255,255,255,0.05)',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:8,cursor:'pointer',transition:'border-color 0.15s'}}
        onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(108,99,255,0.5)'}
        onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.1)'}>
        {activeChannel?(
          <>
            <span style={{width:7,height:7,borderRadius:'50%',background:PC[activeChannel.preset]||'#666',flexShrink:0}}/>
            <span style={{fontSize:12,fontWeight:600,color:'#ECECEC',flex:1,textAlign:'left',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{activeChannel.name}</span>
          </>
        ):(
          <span style={{fontSize:12,color:'#666',flex:1,textAlign:'left'}}>Select channel…</span>
        )}
        <span style={{fontSize:8,color:'#666',marginLeft:2}}>{open?'▲':'▼'}</span>
      </button>

      <button onClick={onNewChannel} style={{
        fontSize:11,fontWeight:700,padding:'6px 14px',borderRadius:8,cursor:'pointer',
        background:'var(--accent)',color:'#fff',border:'none',flexShrink:0,
        boxShadow:'0 2px 10px rgba(108,99,255,0.35)',transition:'all 0.15s'}}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-1px)';e.currentTarget.style.boxShadow='0 4px 16px rgba(108,99,255,0.5)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 2px 10px rgba(108,99,255,0.35)';}}>
        + New Channel
      </button>

      {open&&(
        <div style={{position:'absolute',top:'calc(100% + 6px)',left:0,minWidth:280,zIndex:2000,
          background:'#1A1A1E',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,
          boxShadow:'0 16px 48px rgba(0,0,0,0.7)',overflow:'hidden'}}>
          {channels.length===0?(
            <div style={{padding:'24px 16px',textAlign:'center',color:'#666',fontSize:12}}>
              <div style={{fontSize:32,marginBottom:10}}>📺</div>
              <div style={{color:'#999',marginBottom:4}}>No channels yet</div>
              <div style={{fontSize:11,color:'#555'}}>Click "+ New Channel" to create one</div>
            </div>
          ):channels.map(ch=>(
            <div key={ch.id} style={{display:'flex',alignItems:'center',gap:8,padding:'10px 14px',
              background:activeChannel?.id===ch.id?'rgba(108,99,255,0.1)':'transparent',transition:'background 0.1s'}}
              onMouseEnter={e=>e.currentTarget.style.background=activeChannel?.id===ch.id?'rgba(108,99,255,0.12)':'rgba(255,255,255,0.04)'}
              onMouseLeave={e=>e.currentTarget.style.background=activeChannel?.id===ch.id?'rgba(108,99,255,0.1)':'transparent'}>
              <div onClick={()=>{setActiveChannel(ch);setOpen(false);}} style={{display:'flex',alignItems:'center',gap:8,flex:1,cursor:'pointer',minWidth:0}}>
                <span style={{width:8,height:8,borderRadius:'50%',background:PC[ch.preset]||'#666',flexShrink:0}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:12,fontWeight:600,color:'#ECECEC',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.name}</div>
                  <div style={{fontSize:10,color:'#777',marginTop:1}}>{ch.preset}-form · {ch.auto_approve?'Auto':'Manual'}</div>
                </div>
                {activeChannel?.id===ch.id&&<span style={{fontSize:10,color:'#6C63FF',fontWeight:700}}>✓</span>}
              </div>
              <div style={{display:'flex',gap:3}}>
                <button onClick={async e=>{e.stopPropagation();try{await window.forge.updateChannel(ch.id,{locked:ch.locked?0:1});await loadChannels();}catch(_){}}}
                  style={{padding:'3px 7px',borderRadius:6,fontSize:10,cursor:'pointer',
                    background:ch.locked?'rgba(255,159,10,0.12)':'transparent',
                    border:'1px solid '+(ch.locked?'rgba(255,159,10,0.3)':'rgba(255,255,255,0.08)'),
                    color:ch.locked?'#FF9F0A':'#666'}}>
                  {ch.locked?'🔒':'🔓'}
                </button>
                <button onClick={e=>del(ch,e)} style={{padding:'3px 7px',borderRadius:6,fontSize:10,fontWeight:700,cursor:'pointer',
                  background:confirm===ch.id?'rgba(255,59,48,0.12)':'transparent',
                  border:'1px solid '+(confirm===ch.id?'rgba(255,59,48,0.35)':'rgba(255,255,255,0.08)'),
                  color:confirm===ch.id?'#FF3B30':'#666',opacity:ch.locked?0.3:1}}>
                  {confirm===ch.id?'Sure?':'✕'}
                </button>
              </div>
            </div>
          ))}
          <div style={{borderTop:'1px solid rgba(255,255,255,0.07)',padding:'8px 14px'}}>
            <button onClick={()=>{setActiveView('channels');setOpen(false);}}
              style={{fontSize:11,color:'#666',background:'transparent',border:'none',cursor:'pointer',padding:0,transition:'color 0.1s'}}
              onMouseEnter={e=>e.currentTarget.style.color='#999'}
              onMouseLeave={e=>e.currentTarget.style.color='#666'}>
              Manage channels →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AlertsBell(){
  const[notifs,setNotifs]=useState([]);
  const[open,setOpen]=useState(false);
  const ref=useRef();
  useEffect(()=>subscribeNotifications(setNotifs),[]);
  useEffect(()=>{
    function h(e){if(ref.current&&!ref.current.contains(e.target))setOpen(false);}
    document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h);
  },[]);
  const unread=notifs.filter(n=>!n.read).length;
  const hasErr=notifs.some(n=>!n.read&&n.type==='error');
  const hasWarn=!hasErr&&notifs.some(n=>!n.read&&n.type==='warning');
  const bc=hasErr?'#FF3B30':hasWarn?'#FF9F0A':'#34C759';
  return(
    <div ref={ref} style={{position:'relative',WebkitAppRegion:'no-drag'}}>
      <button onClick={()=>setOpen(o=>!o)} title="Alerts"
        style={{display:'flex',alignItems:'center',gap:5,padding:'6px 10px',
          background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:8,cursor:'pointer',color:'#999',fontSize:12,fontWeight:600,
          transition:'all 0.15s'}}
        onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.color='#ECECEC';}}
        onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#999';}}>
        🔔
        <span style={{fontSize:11}}>Alerts</span>
        {unread>0&&<span style={{minWidth:16,height:16,borderRadius:4,background:bc,
          fontSize:9,fontWeight:800,color:'#000',display:'flex',alignItems:'center',
          justifyContent:'center',padding:'0 3px'}}>
          {unread>9?'9+':unread}
        </span>}
      </button>
      {open&&<NotificationPanel isDark={true} onClose={()=>setOpen(false)}/>}
    </div>
  );
}

export default function TitleBar({onNewChannel}){
  const{mode,setMode,theme,setTheme,channels,activeChannel,setActiveChannel,setActiveView,loadChannels}=useApp();
  const isDark=theme==='dark';
  const toggleMode=async()=>{const n=mode==='simple'?'advanced':'simple';setMode(n);try{await window.forge.updateSettings({mode:n});}catch(_){}};
  const toggleTheme=async()=>{const n=isDark?'light':'dark';setTheme(n);try{await window.forge.updateSettings({theme:n});}catch(_){}};

  const TBtn=({onClick,title,children})=>(
    <button onClick={onClick} title={title} style={{
      display:'flex',alignItems:'center',gap:5,padding:'6px 11px',
      background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.08)',
      borderRadius:8,cursor:'pointer',color:'#999',fontSize:11,fontWeight:600,
      WebkitAppRegion:'no-drag',transition:'all 0.15s',whiteSpace:'nowrap'}}
      onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.09)';e.currentTarget.style.color='#ECECEC';}}
      onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.05)';e.currentTarget.style.color='#999';}}>
      {children}
    </button>
  );

  return(
    <div style={{
      height:46,display:'flex',alignItems:'center',gap:8,padding:'0 14px',flexShrink:0,
      background:'#0C0C10',
      borderBottom:'1px solid rgba(255,255,255,0.07)',
      borderRadius:'12px 12px 0 0',
      userSelect:'none',WebkitAppRegion:'drag',
    }}>
      <span style={{fontWeight:800,fontSize:13,letterSpacing:'0.12em',textTransform:'uppercase',
        color:'#6C63FF',marginRight:6,flexShrink:0,WebkitAppRegion:'no-drag',
        textShadow:'0 0 20px rgba(108,99,255,0.4)'}}>
        MediaMill
      </span>

      <ChannelDropdown channels={channels||[]} activeChannel={activeChannel}
        setActiveChannel={setActiveChannel} setActiveView={setActiveView}
        loadChannels={loadChannels} onNewChannel={onNewChannel}/>

      <div style={{flex:1}}/>

      <div style={{display:'flex',alignItems:'center',gap:5,WebkitAppRegion:'no-drag'}}>
        <AlertsBell/>
        <div style={{width:1,height:16,background:'rgba(255,255,255,0.07)',margin:'0 2px'}}/>
        <TBtn onClick={toggleTheme} title="Toggle theme">{isDark?'☀ Light':'◑ Dark'}</TBtn>
        <TBtn onClick={toggleMode} title="Toggle mode">{mode==='simple'?'Simple':'Advanced'}</TBtn>
        <TBtn onClick={()=>setActiveView('settings')} title="Settings">⚙ Settings</TBtn>
        <div style={{width:1,height:16,background:'rgba(255,255,255,0.07)',margin:'0 2px'}}/>
        {[
          {icon:'—',tip:'Minimize',fn:()=>window.forge?.minimize()},
          {icon:'□',tip:'Maximize',fn:()=>window.forge?.maximize()},
          {icon:'✕',tip:'Close',fn:()=>window.forge?.close(),danger:true},
        ].map(b=>(
          <button key={b.tip} title={b.tip} onClick={b.fn}
            style={{background:'transparent',border:'none',cursor:'pointer',color:'#666',
              padding:'4px 8px',fontSize:12,borderRadius:6,transition:'all 0.1s',
              WebkitAppRegion:'no-drag'}}
            onMouseEnter={e=>{e.currentTarget.style.background=b.danger?'#FF3B30':'rgba(255,255,255,0.08)';if(b.danger)e.currentTarget.style.color='#fff';else e.currentTarget.style.color='#ECECEC';}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#666';}}>
            {b.icon}
          </button>
        ))}
      </div>
    </div>
  );
}
