import React,{useState,useEffect}from 'react';import{useApp}from '../../context/AppContext';
const SS={pending:{bg:'rgba(200,255,0,0.06)',color:'#C8FF00',border:'rgba(200,255,0,0.15)',label:'Pending'},processing:{bg:'rgba(0,200,255,0.08)',color:'#00C8FF',border:'rgba(0,200,255,0.2)',label:'Rendering'},review:{bg:'rgba(255,79,0,0.08)',color:'#FF4F00',border:'rgba(255,79,0,0.2)',label:'Review'},approved:{bg:'rgba(0,230,118,0.08)',color:'#00E676',border:'rgba(0,230,118,0.2)',label:'Approved'},published:{bg:'rgba(107,104,136,0.12)',color:'#6B6888',border:'#252538',label:'Published'},failed:{bg:'rgba(255,23,68,0.08)',color:'#FF1744',border:'rgba(255,23,68,0.2)',label:'Failed'}};
export default function Dashboard(){
  const{activeChannel,mode,setActiveView}=useApp();
  const[videos,setVideos]=useState([]);
  useEffect(()=>{if(activeChannel)load();},[activeChannel]);
  async function load(){try{setVideos(await window.forge.getVideos(activeChannel.id)||[]);}catch(e){}}
  if(!activeChannel)return(<div className="flex-1 flex items-center justify-center text-[#6B6888]"><div className="text-center"><div className="text-4xl mb-3">📺</div><div className="font-bold mb-2">No channel selected</div><button onClick={()=>setActiveView('new-channel')} className="px-4 py-2 text-xs font-bold bg-[#C8FF00] text-black mt-2">Create your first channel</button></div></div>);
  const c={total:videos.length,published:videos.filter(v=>v.status==='published').length,rendering:videos.filter(v=>v.status==='processing').length,review:videos.filter(v=>v.status==='review').length,failed:videos.filter(v=>v.status==='failed').length};
  return(<div className="flex flex-1 overflow-hidden">
    <div className="flex-1 overflow-y-auto p-6">
      <div className="flex items-start justify-between mb-5">
        <div><h2 className="text-2xl font-black mb-1">{activeChannel.name}</h2>
          <div className="text-[11px] text-[#6B6888] flex gap-3"><span>🎬 {activeChannel.preset}</span><span>Auto-publish {activeChannel.auto_approve?'ON':'OFF'}</span></div>
        </div>
        <div className="flex gap-2">
          {mode==='advanced'&&<button className="px-3 py-2 text-xs font-bold border border-[#252538] text-[#6B6888]">⚙ Config</button>}
          <button onClick={()=>setActiveView('ideas')} className="px-3 py-2 text-xs font-bold bg-[#C8FF00] text-black">＋ New Video</button>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-2 mb-6">
        {[{label:'Total',val:c.total,color:'#C8FF00'},{label:'Published',val:c.published,color:'#00E676'},{label:'Rendering',val:c.rendering,color:'#00C8FF'},{label:'Review',val:c.review,color:'#FF4F00'},{label:'Failed',val:c.failed,color:'#FF1744'}].map(k=>(
          <div key={k.label} className="p-3.5" style={{background:'#12121F',border:'1px solid #1A1A2A',borderBottom:`3px solid ${k.color}`}}>
            <div className="text-[9px] font-bold tracking-widest uppercase text-[#6B6888] mb-1.5">{k.label}</div>
            <div className="text-2xl font-black" style={{color:k.color}}>{k.val}</div>
          </div>
        ))}
      </div>
      <div className="text-[9px] font-bold tracking-[3px] uppercase text-[#6B6888] mb-3">Video Queue</div>
      {videos.length===0?(<div className="text-center py-16 text-[#6B6888]"><div className="text-3xl mb-3">🎬</div><div className="font-bold mb-1">No videos yet</div><button onClick={()=>setActiveView('ideas')} className="px-4 py-2 text-xs font-bold bg-[#C8FF00] text-black mt-3">Go to Idea Board</button></div>):(
        <table className="w-full" style={{borderCollapse:'collapse'}}>
          <thead><tr>{['Title','Status','Length','Actions'].map(h=><th key={h} className="text-left px-3 py-2 text-[9px] font-bold tracking-widest uppercase text-[#2E2E48]" style={{borderBottom:'1px solid #1A1A2A'}}>{h}</th>)}</tr></thead>
          <tbody>{videos.map(v=>{const s=SS[v.status]||SS.pending;return(<tr key={v.id} className="hover:bg-[#12121F] transition-colors">
            <td className="px-3 py-3" style={{borderBottom:'1px solid #1A1A2A'}}><div className="font-semibold text-[13px]">{v.title||'Untitled'}</div><div className="text-[10px] text-[#6B6888]">{v.preset} · {v.stage}</div></td>
            <td className="px-3" style={{borderBottom:'1px solid #1A1A2A'}}><span className="inline-flex items-center gap-1 px-2 py-1 text-[9px] font-bold tracking-wider uppercase" style={{background:s.bg,color:s.color,border:`1px solid ${s.border}`}}>{s.label}</span></td>
            <td className="px-3 text-xs text-[#6B6888]" style={{borderBottom:'1px solid #1A1A2A'}}>{v.target_length?`~${v.target_length}min`:'—'}</td>
            <td className="px-3" style={{borderBottom:'1px solid #1A1A2A'}}><div className="flex gap-1.5">
              {v.status==='review'&&<button onClick={async()=>{await window.forge.approveVideo(v.id);load();}} className="px-2 py-1 text-[10px] font-bold border border-[rgba(0,230,118,0.3)] text-[#00E676]">✓ Approve</button>}
              {v.status==='pending'&&<button onClick={()=>window.forge.startPipeline(v.id)} className="px-2 py-1 text-[10px] font-bold border border-[rgba(200,255,0,0.3)] text-[#C8FF00]">▶ Start</button>}
              {mode==='advanced'&&<button onClick={()=>setActiveView('pipeline')} className="px-2 py-1 text-[10px] font-bold border border-[#252538] text-[#6B6888]">Pipeline</button>}
              <button onClick={async()=>{await window.forge.deleteVideo(v.id);load();}} className="px-2 py-1 text-[10px] font-bold border border-[rgba(255,23,68,0.2)] text-[#FF1744]">✕</button>
            </div></td>
          </tr>);})}</tbody>
        </table>
      )}
    </div>
    <div className="w-64 overflow-y-auto flex-shrink-0" style={{background:'#0E0E1A',borderLeft:'1px solid #1A1A2A'}}>
      <div className="p-4 border-b border-[#1A1A2A]">
        <div className="text-[9px] font-bold tracking-[3px] uppercase text-[#2E2E48] mb-3">Today</div>
        {[{time:'9:00',label:'Voice Render',color:'#00E676'},{time:'12:00',label:'Compose',color:'#00C8FF'},{time:'14:00',label:'Your Review',color:'#FF4F00'},{time:'18:00',label:'Upload',color:'#C8FF00'}].map(s=>(
          <div key={s.time} className="flex items-center gap-2.5 py-2 border-b border-[#1A1A2A] last:border-0">
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.color}}/>
            <span className="text-xs font-black w-12 font-mono" style={{color:s.color}}>{s.time}</span>
            <span className="text-xs">{s.label}</span>
          </div>
        ))}
      </div>
      {mode==='advanced'&&<div className="p-4"><div className="text-[9px] font-bold tracking-[3px] uppercase text-[#2E2E48] mb-3">System</div><div className="text-[10px] text-[#6B6888] space-y-1"><div className="flex justify-between"><span>GPU</span><span className="text-[#FF4F00] font-bold">82%</span></div><div className="flex justify-between"><span>Today spend</span><span className="text-[#C8FF00] font-bold">$1.84</span></div></div></div>}
    </div>
  </div>);
}