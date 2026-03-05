import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

const STAGE_INFO={
  ingest:{label:'Researching',icon:'🔍',color:'#00C8FF'},
  script:{label:'Writing Script',icon:'📄',color:'#B060FF'},
  assets:{label:'Gathering Assets',icon:'🖼',color:'#00C8FF'},
  voice:{label:'Rendering Voice',icon:'🎙',color:'#FFAA00'},
  compose:{label:'Composing Video',icon:'🎞',color:'#FF8040'},
  review:{label:'Awaiting Review',icon:'👁',color:'#C8FF00'},
  publish:{label:'Publishing',icon:'🚀',color:'#00E676'},
  done:{label:'Done',icon:'✓',color:'#00E676'},
};

export default function StatusBar(){
  const{activeChannel,theme}=useApp();
  const[videos,setVideos]=useState([]);
  const[tick,setTick]=useState(0);
  const isDark=theme==='dark';

  useEffect(()=>{
    const id=setInterval(()=>setTick(t=>t+1),8000);
    return()=>clearInterval(id);
  },[]);

  useEffect(()=>{
    if(!activeChannel)return;
    window.forge.getVideos(activeChannel.id).then(v=>setVideos(v||[])).catch(()=>{});
  },[activeChannel,tick]);

  const active=videos.filter(v=>v.status==='processing');
  const review=videos.filter(v=>v.status==='review');
  const pending=videos.filter(v=>v.status==='pending');
  const total=videos.length;

  const bg=isDark?'rgba(6,6,14,0.8)':'rgba(228,228,248,0.85)';
  const border=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.08)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.35)':'rgba(0,0,20,0.4)';
  const dim=isDark?'rgba(255,255,255,0.18)':'rgba(0,0,20,0.25)';

  return(
    <div style={{
      display:'flex',alignItems:'center',gap:0,height:36,flexShrink:0,
      background:bg,borderBottom:'1px solid '+border,
      overflowX:'auto',overflowY:'hidden',
    }}>
      {/* Channel summary */}
      <div style={{display:'flex',alignItems:'center',gap:16,padding:'0 16px',flexShrink:0,borderRight:'1px solid '+border,height:'100%'}}>
        <div style={{display:'flex',alignItems:'center',gap:6}}>
          <span style={{fontSize:9,fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:dim}}>Queue</span>
          <span style={{fontSize:12,fontWeight:700,color:text}}>{total}</span>
        </div>
        {active.length>0&&(
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#00C8FF',boxShadow:'0 0 6px #00C8FF',animation:'pulse 1.5s infinite'}}/>
            <span style={{fontSize:11,color:'#00C8FF',fontWeight:600}}>{active.length} running</span>
          </div>
        )}
        {review.length>0&&(
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:'#C8FF00',boxShadow:'0 0 6px #C8FF00'}}/>
            <span style={{fontSize:11,color:'#C8FF00',fontWeight:600}}>{review.length} need review</span>
          </div>
        )}
        {pending.length>0&&(
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <span style={{width:6,height:6,borderRadius:'50%',background:muted}}/>
            <span style={{fontSize:11,color:muted}}>{pending.length} queued</span>
          </div>
        )}
        {total===0&&<span style={{fontSize:11,color:dim}}>No videos — add ideas to get started</span>}
      </div>

      {/* Active video stages */}
      <div style={{display:'flex',alignItems:'center',gap:0,flex:1,overflowX:'auto',height:'100%'}}>
        {active.length===0&&review.length===0?(
          <span style={{fontSize:11,color:dim,padding:'0 16px'}}>All agents idle</span>
        ):(
          [...active,...review].map(v=>{
            const s=STAGE_INFO[v.stage]||{label:v.stage,icon:'⟳',color:'#888'};
            return(
              <div key={v.id} style={{
                display:'flex',alignItems:'center',gap:8,padding:'0 16px',height:'100%',
                borderRight:'1px solid '+border,flexShrink:0,
              }}>
                <span style={{fontSize:12}}>{s.icon}</span>
                <div>
                  <div style={{fontSize:11,fontWeight:600,color:s.color,lineHeight:1.2}}>{s.label}</div>
                  <div style={{fontSize:9,color:muted,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',maxWidth:140}}>{v.title}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Right: spend today */}
      <div style={{flexShrink:0,padding:'0 16px',borderLeft:'1px solid '+border,height:'100%',display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontSize:10,color:dim}}>Today</span>
        <span style={{fontSize:11,fontWeight:700,fontFamily:'monospace',color:'#AACC00'}}>$0.00</span>
      </div>
    </div>
  );
}
