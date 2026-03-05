import React from 'react';
import{useApp}from '../../context/AppContext';
const PS={short:{bg:'rgba(200,255,0,0.1)',color:'#C8FF00',border:'rgba(200,255,0,0.2)',label:'Short'},mid:{bg:'rgba(0,200,255,0.1)',color:'#00C8FF',border:'rgba(0,200,255,0.2)',label:'Mid'},long:{bg:'rgba(255,79,0,0.1)',color:'#FF4F00',border:'rgba(255,79,0,0.2)',label:'Long'}};
export default function Sidebar(){
  const{channels,activeChannel,setActiveChannel,setActiveView,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'#0E0E1A':'#E8E8F4';
  const border=isDark?'#1A1A2A':'#D0D0E0';
  const activeBg=isDark?'#181826':'#D8D8F0';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'#6B6888':'#888899';
  const inputBg=isDark?'#12121F':'#F0F0F8';
  return(<div className='flex flex-col overflow-hidden' style={{background:bg,borderRight:'1px solid '+border}}>
    <div className='p-3.5 pb-2.5' style={{borderBottom:'1px solid '+border}}>
      <div className='text-[9px] font-bold tracking-[3px] uppercase mb-2.5' style={{color:muted}}>Channels</div>
      <input placeholder='Search...' className='w-full px-2.5 py-1.5 text-xs outline-none' style={{background:inputBg,border:'1px solid '+border,color:text}}/>
    </div>
    <div className='flex-1 overflow-y-auto py-2'>
      {channels.length===0&&<div className='px-4 py-8 text-center text-[11px]' style={{color:muted}}>No channels yet.<br/>Create one below.</div>}
      {channels.map(ch=>{const p=PS[ch.preset]||PS.long;return(
        <div key={ch.id} onClick={()=>setActiveChannel(ch)} className='px-3.5 py-2.5 cursor-pointer transition-all'
          style={{background:activeChannel?.id===ch.id?activeBg:'transparent',borderLeft:activeChannel?.id===ch.id?'3px solid #C8FF00':'3px solid transparent'}}>
          <div className='flex items-center gap-1.5 font-bold text-[13px] mb-1' style={{color:text}}>{ch.name}
            <span className='text-[9px] px-1.5 py-0.5 font-bold tracking-wider uppercase' style={{background:p.bg,color:p.color,border:'1px solid '+p.border}}>{p.label}</span>
          </div>
          <div className='text-[10px]' style={{color:muted}}>{ch.auto_approve?'⚡ Auto-approve':'⚑ Manual review'}</div>
        </div>
      );})}
    </div>
    <button onClick={()=>setActiveView('new-channel')} className='mx-2.5 my-2 py-2 text-center text-[11px] font-semibold transition-all'
      style={{border:'1px dashed '+border,color:muted}}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='#C8FF00';e.currentTarget.style.color='#C8FF00';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor=border;e.currentTarget.style.color=muted;}}>
      + New Channel
    </button>
  </div>);
}