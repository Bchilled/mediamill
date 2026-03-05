import React,{useState,useEffect}from 'react';
import{subscribeNotifications,markRead,markAllRead,clearNotifications}from '../../utils/notifications';
import{fix}from '../../utils/fixRouter';

const TYPE_CONFIG={
  success:{color:'#30C85E',icon:'✓',label:'Success'},
  error:  {color:'#FF4040',icon:'✕',label:'Error'},
  warning:{color:'#FF9500',icon:'⚠',label:'Warning'},
  info:   {color:'#00C8FF',icon:'ℹ',label:'Info'},
  system: {color:'#A060FF',icon:'⚙',label:'System'},
};

function timeAgo(iso){
  const s=Math.round((Date.now()-new Date(iso))/1000);
  if(s<60)return `${s}s ago`;
  if(s<3600)return `${Math.round(s/60)}m ago`;
  if(s<86400)return `${Math.round(s/3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function NotificationPanel({onClose,isDark}){
  const[all,setAll]=useState([]);
  const[filter,setFilter]=useState('all');

  useEffect(()=>subscribeNotifications(setAll),[]);

  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.18)':'rgba(0,0,20,0.22)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const card=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  const bg=isDark?'rgba(10,10,20,0.98)':'rgba(252,252,255,0.98)';
  const accent='#7C6EFA';

  const unread=all.filter(n=>!n.read).length;
  const filtered=filter==='all'?all:filter==='unread'?all.filter(n=>!n.read):all.filter(n=>n.type===filter);

  const FILTERS=[
    {id:'all',label:'All'},
    {id:'unread',label:'Unread',badge:unread},
    {id:'error',label:'Errors'},
    {id:'warning',label:'Warnings'},
    {id:'success',label:'Success'},
    {id:'system',label:'System'},
  ];

  return(
    <div style={{
      position:'absolute',top:'100%',right:0,
      width:360,maxHeight:'70vh',
      background:bg,
      border:'1px solid '+border,
      borderRadius:14,
      boxShadow:'0 16px 48px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.08)',
      display:'flex',flexDirection:'column',
      overflow:'hidden',
      zIndex:10000,
      animation:'slideUp 0.15s ease',
    }}>
      {/* Header */}
      <div style={{padding:'12px 14px',borderBottom:'1px solid '+border,
        display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div style={{fontSize:13,fontWeight:800,color:text}}>
          Notifications {unread>0&&<span style={{fontSize:10,fontWeight:700,color:accent,
            background:accent+'15',padding:'1px 7px',borderRadius:99,marginLeft:6}}>{unread}</span>}
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          {unread>0&&(
            <button onClick={markAllRead}
              style={{fontSize:10,padding:'3px 8px',borderRadius:6,background:'transparent',
                border:'1px solid '+border,color:muted,cursor:'pointer'}}>
              Mark all read
            </button>
          )}
          <button onClick={clearNotifications}
            style={{fontSize:10,padding:'3px 8px',borderRadius:6,background:'transparent',
              border:'1px solid '+border,color:muted,cursor:'pointer'}}>
            Clear
          </button>
          <button onClick={onClose}
            style={{background:'transparent',border:'none',color:muted,cursor:'pointer',fontSize:16,padding:'0 2px'}}>
            ✕
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:2,padding:'6px 8px',borderBottom:'1px solid '+border,
        flexShrink:0,overflowX:'auto',background:isDark?'rgba(0,0,0,0.15)':'rgba(0,0,0,0.02)'}}>
        {FILTERS.map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)}
            style={{padding:'4px 9px',borderRadius:7,border:'none',cursor:'pointer',fontSize:10,fontWeight:filter===f.id?700:400,
              background:filter===f.id?(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)'):'transparent',
              color:filter===f.id?text:muted,flexShrink:0,display:'flex',gap:4,alignItems:'center'}}>
            {f.label}
            {f.badge>0&&<span style={{fontSize:9,fontWeight:700,color:accent,
              background:accent+'15',padding:'0 4px',borderRadius:99}}>{f.badge}</span>}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{flex:1,overflowY:'auto'}}>
        {filtered.length===0?(
          <div style={{padding:'32px 16px',textAlign:'center',color:sub,fontSize:12}}>
            No notifications
          </div>
        ):(
          filtered.map(n=>{
            const cfg=TYPE_CONFIG[n.type]||TYPE_CONFIG.info;
            return(
              <div key={n.id}
                onClick={()=>{markRead(n.id);if(n.onClick)n.onClick();else if(n.fixAction)fix(n.fixAction);}}
                style={{
                  padding:'10px 14px',
                  borderBottom:'1px solid '+border,
                  display:'flex',gap:10,alignItems:'flex-start',
                  background:n.read?'transparent':isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.015)',
                  cursor:(n.fixAction||n.onClick)?'pointer':'default',
                  transition:'background 0.1s',
                }}
                onMouseEnter={e=>{if(n.fixAction||n.onClick)e.currentTarget.style.background=isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)';}}
                onMouseLeave={e=>{e.currentTarget.style.background=n.read?'transparent':isDark?'rgba(255,255,255,0.02)':'rgba(0,0,0,0.015)';}}
              >
                {/* Unread dot */}
                <div style={{width:6,height:6,borderRadius:'50%',background:n.read?'transparent':cfg.color,
                  marginTop:5,flexShrink:0}}/>

                {/* Icon */}
                <div style={{width:24,height:24,borderRadius:7,flexShrink:0,
                  background:cfg.color+'12',border:'1px solid '+cfg.color+'20',
                  display:'flex',alignItems:'center',justifyContent:'center',
                  fontSize:10,fontWeight:900,color:cfg.color}}>
                  {cfg.icon}
                </div>

                {/* Content */}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:n.read?400:700,color:text,marginBottom:1,
                    whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                    {n.title}
                  </div>
                  {n.message&&(
                    <div style={{fontSize:10,color:muted,lineHeight:1.4,marginBottom:2,
                      display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {n.message}
                    </div>
                  )}
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <span style={{fontSize:9,color:sub}}>{timeAgo(n.timestamp)}</span>
                    {n.fixAction&&(
                      <button
                        onClick={e=>{e.stopPropagation();markRead(n.id);fix(n.fixAction);onClose?.();}}
                        style={{fontSize:9,padding:'1px 7px',borderRadius:4,
                          background:cfg.color+'12',border:'1px solid '+cfg.color+'22',
                          color:cfg.color,cursor:'pointer',fontWeight:700}}>
                        {n.fixLabel||'Fix →'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
