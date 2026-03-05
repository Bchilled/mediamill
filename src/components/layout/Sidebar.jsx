import React from 'react';
import{useApp}from '../../context/AppContext';

const PS={
  short:{color:'#C8FF00',label:'Short'},
  mid:{color:'#00C8FF',label:'Mid'},
  long:{color:'#FF8040',label:'Long'},
};

export default function Sidebar(){
  const{channels,activeChannel,setActiveChannel,setActiveView,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'rgba(10,10,22,0.7)':'rgba(240,240,255,0.8)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.45)':'rgba(0,0,20,0.5)';
  const label=isDark?'rgba(255,255,255,0.28)':'rgba(0,0,20,0.38)';

  return(
    <div style={{display:'flex',flexDirection:'column',overflow:'hidden',background:bg,borderRight:'1px solid '+border}}>
      <div style={{padding:'12px 12px 10px',borderBottom:'1px solid '+border}}>
        <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:label,marginBottom:8}}>Channels</div>
        <input placeholder="Search..." className={isDark?'input-dark':'input-light'}/>
      </div>

      <div style={{flex:1,overflowY:'auto',padding:'6px 0'}}>
        {channels.length===0&&(
          <div style={{padding:'32px 16px',textAlign:'center',fontSize:11,color:muted}}>
            No channels yet.<br/>Create one below.
          </div>
        )}
        {channels.map(ch=>{
          const p=PS[ch.preset]||PS.long;
          const isActive=activeChannel?.id===ch.id;
          return(
            <div key={ch.id} onClick={()=>setActiveChannel(ch)}
              className="sidebar-item"
              style={isActive?{
                background:isDark?'rgba(200,255,0,0.07)':'rgba(80,60,200,0.07)',
                boxShadow:'inset 3px 0 0 '+(isDark?'#C8FF00':'#4400CC'),
              }:{}}>
              <div style={{display:'flex',alignItems:'center',gap:6,fontWeight:600,fontSize:13,marginBottom:3,color:text}}>
                <span style={{flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{ch.name}</span>
                <span style={{
                  fontSize:9,padding:'2px 6px',fontWeight:700,borderRadius:6,flexShrink:0,
                  background:p.color+'18',color:p.color,border:'1px solid '+p.color+'35',
                }}>{p.label}</span>
              </div>
              <div style={{fontSize:10,color:muted}}>{ch.auto_approve?'⚡ Auto-approve':'◎ Manual review'}</div>
            </div>
          );
        })}
      </div>

      <div style={{padding:10}}>
        <button onClick={()=>setActiveView('new-channel')}
          className="btn" style={{
            width:'100%',
            background:'transparent',
            color:muted,
            border:'1px dashed '+(isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.18)'),
            boxShadow:'none',
            fontSize:12,padding:'9px',borderRadius:10,
          }}
          onMouseEnter={e=>{
            e.currentTarget.style.borderColor=isDark?'#C8FF00':'#4400CC';
            e.currentTarget.style.color=isDark?'#C8FF00':'#4400CC';
            e.currentTarget.style.background=isDark?'rgba(200,255,0,0.05)':'rgba(68,0,204,0.05)';
          }}
          onMouseLeave={e=>{
            e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.18)';
            e.currentTarget.style.color=muted;
            e.currentTarget.style.background='transparent';
          }}>
          + New Channel
        </button>
      </div>
    </div>
  );
}
