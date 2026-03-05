import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

const SS={
  pending:{color:'#AACC00',label:'Pending'},
  processing:{color:'#00AACC',label:'Rendering'},
  review:{color:'#FF6020',label:'Review'},
  approved:{color:'#00BB66',label:'Approved'},
  published:{color:'#888899',label:'Published'},
  failed:{color:'#EE2244',label:'Failed'},
};

export default function Dashboard(){
  const{activeChannel,mode,setActiveView,theme}=useApp();
  const[videos,setVideos]=useState([]);
  const isDark=theme==='dark';

  const bg=isDark?'transparent':'transparent';
  const cardBg=isDark?'linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))':'linear-gradient(145deg,#FFFFFF,#F8F8FF)';
  const cardBorder=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)';
  const cardShadow=isDark?'0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.08)':'0 4px 20px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,1)';
  const rowBorder=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)';
  const text=isDark?'#E8E6FF':'#111122';
  const sub=isDark?'rgba(255,255,255,0.55)':'rgba(0,0,20,0.55)';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,20,0.38)';
  const label=isDark?'rgba(255,255,255,0.28)':'rgba(0,0,20,0.38)';
  const sideBg=isDark?'rgba(8,8,20,0.6)':'rgba(236,236,252,0.8)';
  const sideBorder=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)';

  useEffect(()=>{if(activeChannel)load();},[activeChannel]);
  async function load(){try{setVideos(await window.forge.getVideos(activeChannel.id)||[]);}catch(e){}}

  if(!activeChannel)return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',background:bg}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>📺</div>
        <div style={{fontSize:18,fontWeight:700,marginBottom:8,color:text}}>No channel selected</div>
        <div style={{fontSize:13,marginBottom:24,color:sub}}>Create your first channel to get started</div>
        <button onClick={()=>setActiveView('new-channel')} className="btn btn-primary">+ Create Channel</button>
      </div>
    </div>
  );

  const c={total:videos.length,published:videos.filter(v=>v.status==='published').length,rendering:videos.filter(v=>v.status==='processing').length,review:videos.filter(v=>v.status==='review').length,failed:videos.filter(v=>v.status==='failed').length};
  const statColors=['#AACC00','#00BB66','#00AACC','#FF6020','#EE2244'];

  return(
    <div style={{display:'flex',flex:1,overflow:'hidden'}}>
      <div style={{flex:1,overflowY:'auto',padding:24}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:20}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:4}}>{activeChannel.name}</h2>
            <div style={{fontSize:11,color:sub,display:'flex',gap:12,alignItems:'center'}}>
              <span style={{textTransform:'capitalize'}}>{activeChannel.preset}-form</span>
              <span style={{width:3,height:3,borderRadius:'50%',background:muted,display:'inline-block'}}/>
              <span>Auto-publish {activeChannel.auto_approve?'ON':'OFF'}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {mode==='advanced'&&<button className={isDark?'btn btn-ghost':'btn btn-ghost-light'}>⚙ Config</button>}
            <button onClick={()=>setActiveView('ideas')} className="btn btn-primary">+ New Video</button>
          </div>
        </div>

        {/* Stats */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:12,marginBottom:24}}>
          {['Total','Published','Rendering','Review','Failed'].map((k,i)=>(
            <div key={k} style={{background:cardBg,border:'1px solid '+cardBorder,borderRadius:14,boxShadow:cardShadow,padding:'14px 16px',borderBottom:'3px solid '+statColors[i]}}>
              <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:label,marginBottom:8}}>{k}</div>
              <div style={{fontSize:26,fontWeight:900,color:statColors[i]}}>{Object.values(c)[i]}</div>
            </div>
          ))}
        </div>

        {/* Queue */}
        <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:label,marginBottom:12}}>Video Queue</div>

        {videos.length===0?(
          <div style={{background:cardBg,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'48px 24px',textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:12}}>🎬</div>
            <div style={{fontWeight:600,color:text,marginBottom:6}}>No videos yet</div>
            <div style={{fontSize:13,color:sub,marginBottom:20}}>Start with an idea and let MediaMill do the rest</div>
            <button onClick={()=>setActiveView('ideas')} className="btn btn-primary">Go to Idea Board</button>
          </div>
        ):(
          <div style={{background:cardBg,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{borderBottom:'1px solid '+rowBorder}}>
                  {['Title','Status','Length','Actions'].map(h=>(
                    <th key={h} style={{textAlign:'left',padding:'12px 16px',fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:label}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>{videos.map(v=>{
                const s=SS[v.status]||SS.pending;
                return(
                  <tr key={v.id} style={{borderBottom:'1px solid '+rowBorder}}>
                    <td style={{padding:'12px 16px'}}>
                      <div style={{fontWeight:600,fontSize:13,color:text}}>{v.title||'Untitled'}</div>
                      <div style={{fontSize:10,color:muted,textTransform:'capitalize',marginTop:2}}>{v.stage}</div>
                    </td>
                    <td style={{padding:'0 16px'}}>
                      <span style={{display:'inline-flex',alignItems:'center',gap:6,fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:20,background:s.color+'18',color:s.color,border:'1px solid '+s.color+'30'}}>
                        <span style={{width:6,height:6,borderRadius:'50%',background:s.color,boxShadow:'0 0 6px '+s.color}}/>
                        {s.label}
                      </span>
                    </td>
                    <td style={{padding:'0 16px',fontSize:12,fontFamily:'monospace',color:sub}}>{v.target_length?`${v.target_length}m`:'—'}</td>
                    <td style={{padding:'0 16px'}}>
                      <div style={{display:'flex',gap:6}}>
                        {v.status==='review'&&<button onClick={async()=>{await window.forge.approveVideo(v.id);load();}} className="btn btn-success" style={{padding:'4px 10px',fontSize:11}}>✓ Approve</button>}
                        {v.status==='pending'&&<button onClick={()=>window.forge.startPipeline(v.id)} className="btn btn-primary" style={{padding:'4px 10px',fontSize:11}}>▶ Start</button>}
                        <button onClick={async()=>{await window.forge.deleteVideo(v.id);load();}} className="btn btn-danger" style={{padding:'4px 10px',fontSize:11}}>✕ Delete</button>
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
      <div style={{width:220,flexShrink:0,overflowY:'auto',background:sideBg,borderLeft:'1px solid '+sideBorder}}>
        <div style={{padding:16}}>
          <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:label,marginBottom:12}}>Today</div>
          <div style={{background:cardBg,border:'1px solid '+cardBorder,borderRadius:12,boxShadow:cardShadow,overflow:'hidden'}}>
            {[
              {time:'9:00',label:'Voice Render',color:'#00BB66'},
              {time:'12:00',label:'Compose',color:'#00AACC'},
              {time:'14:00',label:'Your Review',color:'#FF6020'},
              {time:'18:00',label:'Upload',color:'#AACC00'},
            ].map((s,i,arr)=>(
              <div key={s.time} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderBottom:i<arr.length-1?'1px solid '+rowBorder:'none'}}>
                <div style={{width:7,height:7,borderRadius:'50%',flexShrink:0,background:s.color,boxShadow:'0 0 8px '+s.color}}/>
                <span style={{fontSize:11,fontWeight:800,fontFamily:'monospace',width:36,color:s.color}}>{s.time}</span>
                <span style={{fontSize:11,fontWeight:500,color:sub}}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {mode==='advanced'&&(
          <div style={{padding:'0 16px 16px'}}>
            <div style={{fontSize:9,fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:label,marginBottom:12}}>System</div>
            <div style={{background:cardBg,border:'1px solid '+cardBorder,borderRadius:12,boxShadow:cardShadow,padding:'12px 14px'}}>
              {[{label:'GPU Usage',val:'82%',color:'#FF6020'},{label:'Today Spend',val:'$1.84',color:'#AACC00'}].map((r,i,arr)=>(
                <div key={r.label} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'6px 0',borderBottom:i<arr.length-1?'1px solid '+rowBorder:'none'}}>
                  <span style={{fontSize:11,color:sub}}>{r.label}</span>
                  <span style={{fontSize:11,fontWeight:700,fontFamily:'monospace',color:r.color}}>{r.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
