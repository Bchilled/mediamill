import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

const SS={
  pending:{color:'#C8FF00',label:'Pending'},
  processing:{color:'#00C8FF',label:'Rendering'},
  review:{color:'#FF4F00',label:'Review'},
  approved:{color:'#00E676',label:'Approved'},
  published:{color:'rgba(255,255,255,0.3)',label:'Published'},
  failed:{color:'#FF1744',label:'Failed'},
};

export default function Dashboard(){
  const{activeChannel,mode,setActiveView,theme}=useApp();
  const[videos,setVideos]=useState([]);
  const isDark=theme==='dark';
  const bg=isDark?'#08080F':'#F2F2FC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.9)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)';
  const cardShadow=isDark?'0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06)':'0 2px 12px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,1)';
  const rowBorder=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.4)';
  const sideBg=isDark?'rgba(10,10,22,0.98)':'rgba(238,238,250,0.98)';
  const sideBorder=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.08)';

  useEffect(()=>{if(activeChannel)load();},[activeChannel]);
  async function load(){try{setVideos(await window.forge.getVideos(activeChannel.id)||[]);}catch(e){}}

  if(!activeChannel)return(
    <div className="flex-1 flex items-center justify-center" style={{background:bg}}>
      <div className="text-center">
        <div className="text-5xl mb-4">📺</div>
        <div className="text-lg font-bold mb-2" style={{color:text}}>No channel selected</div>
        <div className="text-sm mb-6" style={{color:muted}}>Create your first channel to get started</div>
        <button onClick={()=>setActiveView('new-channel')} className="btn btn-primary">+ Create Channel</button>
      </div>
    </div>
  );

  const c={total:videos.length,published:videos.filter(v=>v.status==='published').length,rendering:videos.filter(v=>v.status==='processing').length,review:videos.filter(v=>v.status==='review').length,failed:videos.filter(v=>v.status==='failed').length};

  return(
    <div className="flex flex-1 overflow-hidden" style={{background:bg}}>
      <div className="flex-1 overflow-y-auto p-6">

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-black mb-1" style={{color:text}}>{activeChannel.name}</h2>
            <div className="text-[11px] flex items-center gap-3" style={{color:muted}}>
              <span className="capitalize">{activeChannel.preset}-form</span>
              <span className="w-1 h-1 rounded-full inline-block" style={{background:muted}}/>
              <span>Auto-publish {activeChannel.auto_approve?'ON':'OFF'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {mode==='advanced'&&<button className={isDark?'btn btn-ghost':'btn btn-ghost-light'}>⚙ Config</button>}
            <button onClick={()=>setActiveView('ideas')} className="btn btn-primary">+ New Video</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-3 mb-6">
          {[
            {label:'Total',val:c.total,color:'#C8FF00'},
            {label:'Published',val:c.published,color:'#00E676'},
            {label:'Rendering',val:c.rendering,color:'#00C8FF'},
            {label:'Review',val:c.review,color:'#FF4F00'},
            {label:'Failed',val:c.failed,color:'#FF1744'},
          ].map(k=>(
            <div key={k.label} style={{
              background:card,
              border:'1px solid '+cardBorder,
              borderRadius:12,
              boxShadow:cardShadow,
              padding:'14px 16px',
              borderBottom:'3px solid '+k.color,
            }}>
              <div className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{color:muted}}>{k.label}</div>
              <div className="text-2xl font-black" style={{color:k.color}}>{k.val}</div>
            </div>
          ))}
        </div>

        {/* Queue */}
        <div className="text-[9px] font-bold tracking-[3px] uppercase mb-3" style={{color:muted}}>Video Queue</div>

        {videos.length===0?(
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'48px 24px',textAlign:'center'}}>
            <div className="text-4xl mb-3">🎬</div>
            <div className="font-semibold mb-1" style={{color:text}}>No videos yet</div>
            <div className="text-sm mb-4" style={{color:muted}}>Start with an idea and let MediaMill do the rest</div>
            <button onClick={()=>setActiveView('ideas')} className="btn btn-primary">Go to Idea Board</button>
          </div>
        ):(
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,overflow:'hidden'}}>
            <table className="w-full" style={{borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid '+rowBorder}}>
                  {['Title','Status','Length','Actions'].map(h=>(
                    <th key={h} className="text-left px-4 py-3 text-[9px] font-bold tracking-widest uppercase" style={{color:muted}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{videos.map(v=>{
                const s=SS[v.status]||SS.pending;
                return(
                  <tr key={v.id} style={{borderBottom:'1px solid '+rowBorder}}>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-sm" style={{color:text}}>{v.title||'Untitled'}</div>
                      <div className="text-[10px] mt-0.5 capitalize" style={{color:muted}}>{v.stage}</div>
                    </td>
                    <td className="px-4">
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                        style={{background:s.color+'15',color:s.color,border:'1px solid '+s.color+'25'}}>
                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{background:s.color}}/>
                        {s.label}
                      </span>
                    </td>
                    <td className="px-4 text-xs font-mono" style={{color:muted}}>{v.target_length?`${v.target_length}m`:'—'}</td>
                    <td className="px-4">
                      <div className="flex gap-1.5">
                        {v.status==='review'&&<button onClick={async()=>{await window.forge.approveVideo(v.id);load();}} className="btn" style={{background:'rgba(0,230,118,0.1)',color:'#00E676',border:'1px solid rgba(0,230,118,0.2)',padding:'4px 10px',fontSize:11}}>✓ Approve</button>}
                        {v.status==='pending'&&<button onClick={()=>window.forge.startPipeline(v.id)} className="btn btn-primary" style={{padding:'4px 10px',fontSize:11}}>▶ Start</button>}
                        <button onClick={async()=>{await window.forge.deleteVideo(v.id);load();}} className="btn btn-danger" style={{padding:'4px 10px',fontSize:11}}>✕</button>
                      </div>
                    </td>
                  </tr>
                );
              })}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Side panel */}
      <div className="w-60 flex-shrink-0 overflow-y-auto" style={{background:sideBg,borderLeft:'1px solid '+sideBorder}}>
        <div className="p-4">
          <div className="text-[9px] font-bold tracking-[3px] uppercase mb-3" style={{color:muted}}>Today</div>
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,boxShadow:cardShadow,overflow:'hidden'}}>
            {[
              {time:'9:00',label:'Voice Render',color:'#00E676'},
              {time:'12:00',label:'Compose',color:'#00C8FF'},
              {time:'14:00',label:'Your Review',color:'#FF4F00'},
              {time:'18:00',label:'Upload',color:'#C8FF00'},
            ].map((s,i,arr)=>(
              <div key={s.time} className="flex items-center gap-3 px-3 py-2.5"
                style={{borderBottom:i<arr.length-1?'1px solid '+rowBorder:'none'}}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{background:s.color,boxShadow:'0 0 6px '+s.color}}/>
                <span className="text-xs font-black font-mono w-10" style={{color:s.color}}>{s.time}</span>
                <span className="text-xs font-medium" style={{color:text}}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {mode==='advanced'&&(
          <div className="px-4 pb-4">
            <div className="text-[9px] font-bold tracking-[3px] uppercase mb-3" style={{color:muted}}>System</div>
            <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:12,boxShadow:cardShadow,padding:'12px 14px'}}>
              {[{label:'GPU Usage',val:'82%',color:'#FF4F00'},{label:'Today Spend',val:'$1.84',color:'#C8FF00'}].map((r,i,arr)=>(
                <div key={r.label} className="flex justify-between items-center py-1.5"
                  style={{borderBottom:i<arr.length-1?'1px solid '+rowBorder:'none'}}>
                  <span className="text-[11px]" style={{color:muted}}>{r.label}</span>
                  <span className="text-[11px] font-bold font-mono" style={{color:r.color}}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
