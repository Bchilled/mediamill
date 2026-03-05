import React from 'react';
import{useApp}from '../../context/AppContext';

const PS={
  short:{color:'#C8FF00',label:'Short'},
  mid:{color:'#00C8FF',label:'Mid'},
  long:{color:'#FF4F00',label:'Long'},
};

export default function Sidebar(){
  const{channels,activeChannel,setActiveChannel,setActiveView,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'rgba(10,10,22,0.98)':'rgba(242,242,252,0.98)';
  const border=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.08)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.4)';

  return(
    <div className="flex flex-col overflow-hidden" style={{background:bg,borderRight:'1px solid '+border}}>
      <div className="px-3 pt-3 pb-2" style={{borderBottom:'1px solid '+border}}>
        <div className="text-[9px] font-bold tracking-[3px] uppercase mb-2.5" style={{color:muted}}>Channels</div>
        <input placeholder="Search..." className={isDark?'input-dark':'input-light'} style={{width:'100%'}}/>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {channels.length===0&&(
          <div className="px-4 py-8 text-center text-[11px]" style={{color:muted}}>
            No channels yet.<br/>Create one below.
          </div>
        )}
        {channels.map(ch=>{
          const p=PS[ch.preset]||PS.long;
          const isActive=activeChannel?.id===ch.id;
          return(
            <div key={ch.id} onClick={()=>setActiveChannel(ch)}
              className="sidebar-item"
              style={isActive
                ? {background:isDark?'rgba(200,255,0,0.06)':'rgba(34,0,170,0.06)',
                   boxShadow:isDark?'inset 3px 0 0 #C8FF00':'inset 3px 0 0 #2200AA'}
                : {}}>
              <div className="flex items-center gap-1.5 font-semibold text-[13px] mb-0.5" style={{color:text}}>
                {ch.name}
                <span className="text-[9px] px-1.5 py-0.5 font-bold rounded-full"
                  style={{background:p.color+'18',color:p.color,border:'1px solid '+p.color+'30'}}>
                  {p.label}
                </span>
              </div>
              <div className="text-[10px]" style={{color:muted}}>
                {ch.auto_approve?'⚡ Auto-approve':'◎ Manual review'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-2">
        <button onClick={()=>setActiveView('new-channel')}
          className="w-full py-2 text-[11px] font-semibold rounded-lg transition-all"
          style={{
            background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.03)',
            border:'1px dashed '+(isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.15)'),
            color:muted,
          }}
          onMouseEnter={e=>{e.currentTarget.style.borderColor=isDark?'#C8FF00':'#2200AA';e.currentTarget.style.color=isDark?'#C8FF00':'#2200AA';}}
          onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.15)';e.currentTarget.style.color=muted;}}>
          + New Channel
        </button>
      </div>
    </div>
  );
}
