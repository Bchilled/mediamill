import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

const STATUS_COLOR={pending:'#888899',processing:'#00C8FF',review:'#FF8040',approved:'#00E676',published:'#C8FF00',failed:'#EE2244'};
const STAGE_ICON={ingest:'📥',script:'📄',assets:'🖼',voice:'🎙',compose:'🎞',review:'👁',publish:'🚀'};

export default function Dashboard(){
  const{activeChannel,channels,setActiveView,setActiveChannel,theme}=useApp();
  const[stats,setStats]=useState(null);
  const[recentVideos,setRecentVideos]=useState([]);
  const[recentIdeas,setRecentIdeas]=useState([]);
  const[ytStatus,setYtStatus]=useState(null);
  const isDark=theme==='dark';

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.25)':'rgba(0,0,20,0.3)';
  const card=isDark?'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))':'linear-gradient(145deg,#fff,#f8f8ff)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  const cardShadow=isDark?'0 4px 24px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.07)':'0 2px 16px rgba(0,0,0,0.07),inset 0 1px 0 #fff';
  const accent=isDark?'#C8FF00':'#4400CC';
  const rowBorder=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';

  useEffect(()=>{
    if(!activeChannel)return;
    loadData();
  },[activeChannel?.id]);

  async function loadData(){
    try{
      const[videos,ideas,yt]=await Promise.all([
        window.forge.getVideos(activeChannel.id),
        window.forge.getIdeas(activeChannel.id,{}),
        window.forge.youtubeStatus(activeChannel.id).catch(()=>({connected:false})),
      ]);
      // Compute stats
      const s={total:videos.length,pending:0,processing:0,review:0,published:0,failed:0,ideas:ideas.length};
      videos.forEach(v=>{if(s[v.status]!==undefined)s[v.status]++;});
      setStats(s);
      setRecentVideos(videos.slice(0,5));
      setRecentIdeas(ideas.filter(i=>i.status==='idea').slice(0,5));
      setYtStatus(yt);
    }catch(e){console.error(e);}
  }

  if(!activeChannel)return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:20}}>
      <div style={{fontSize:48}}>📡</div>
      <div style={{fontSize:18,fontWeight:700,color:text}}>No channel selected</div>
      <div style={{fontSize:13,color:muted,marginBottom:8}}>Create a channel to get started</div>
      <button onClick={()=>setActiveView('new-channel')} className="btn btn-primary" style={{padding:'10px 24px'}}>Create Channel</button>
      {channels.length>0&&(
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginTop:8}}>
          {channels.map(ch=>(
            <button key={ch.id} onClick={()=>setActiveChannel(ch)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:12}}>
              {ch.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return(
    <div style={{flex:1,overflowY:'auto',padding:28}}>
      <div style={{maxWidth:1100,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:28}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:900,color:text,marginBottom:4}}>{activeChannel.name}</h1>
            <div style={{fontSize:12,color:muted,display:'flex',gap:12,alignItems:'center'}}>
              <span style={{textTransform:'capitalize'}}>{activeChannel.preset}-form</span>
              <span>·</span>
              <span>{activeChannel.auto_approve?'⚡ Auto-approve on':'◎ Manual review'}</span>
              <span>·</span>
              <span style={{color:ytStatus?.connected?'#00E676':'#EE2244'}}>{ytStatus?.connected?'✓ YouTube connected':'✗ YouTube not connected'}</span>
            </div>
            {(activeChannel.topic||activeChannel.style_prompt)&&(
              <div style={{fontSize:11,color:sub,marginTop:6,fontStyle:'italic',maxWidth:500}}>"{activeChannel.topic||activeChannel.style_prompt}"</div>
            )}
          </div>
          <div style={{display:'flex',gap:8}}>
            {!ytStatus?.connected&&(
              <button onClick={async()=>{try{await window.forge.youtubeConnect(activeChannel.id);loadData();}catch(e){alert(e.message);}}}
                className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:11}}>
                🔗 Connect YouTube
              </button>
            )}
            <button onClick={()=>setActiveView('channel:branding')} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:11}}>
              🎨 Branding
            </button>
            <button onClick={()=>setActiveView('pipeline:ideas')} className="btn btn-primary" style={{fontSize:12}}>+ New Video</button>
          </div>
        </div>

        {/* Stat cards */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12,marginBottom:24}}>
          {[
            {label:'Ideas',val:stats?.ideas||0,color:'#888',icon:'💡',view:'pipeline:ideas'},
            {label:'Pending',val:stats?.pending||0,color:STATUS_COLOR.pending,icon:'⏳',view:'pipeline:scripts'},
            {label:'Processing',val:stats?.processing||0,color:STATUS_COLOR.processing,icon:'⚡',view:'pipeline:scripts'},
            {label:'Review',val:stats?.review||0,color:STATUS_COLOR.review,icon:'👁',view:'pipeline:review'},
            {label:'Published',val:stats?.published||0,color:STATUS_COLOR.published,icon:'🚀',view:'pipeline:publish'},
            {label:'Failed',val:stats?.failed||0,color:STATUS_COLOR.failed,icon:'✗',view:'pipeline:scripts'},
          ].map(s=>(
            <div key={s.label} onClick={()=>setActiveView(s.view)}
              style={{background:card,border:'1px solid '+(s.val>0&&s.label!=='Published'?s.color+'30':cardBorder),borderRadius:14,boxShadow:cardShadow,padding:'16px',cursor:'pointer',transition:'all 0.15s',textAlign:'center',borderTop:'3px solid '+(s.val>0?s.color:'transparent')}}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:24,fontWeight:900,color:s.val>0?s.color:muted,lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:10,color:sub,marginTop:4,fontWeight:600,textTransform:'uppercase',letterSpacing:'0.08em'}}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:20}}>

          {/* Recent videos */}
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid '+rowBorder,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:12,fontWeight:700,color:text}}>Recent Videos</div>
              <button onClick={()=>setActiveView('pipeline:scripts')} style={{fontSize:10,color:accent,background:'transparent',border:'none',cursor:'pointer'}}>View all →</button>
            </div>
            {recentVideos.length===0?(
              <div style={{padding:'32px 18px',textAlign:'center',color:muted,fontSize:12}}>No videos yet.<br/>Approve an idea to start.</div>
            ):(
              recentVideos.map((v,i)=>{
                const sc=STATUS_COLOR[v.status]||'#888';
                return(
                  <div key={v.id} onClick={()=>setActiveView('pipeline:scripts')}
                    style={{display:'flex',alignItems:'center',gap:12,padding:'11px 18px',borderBottom:i<recentVideos.length-1?'1px solid '+rowBorder:'none',cursor:'pointer',transition:'background 0.1s'}}
                    onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontSize:16,flexShrink:0}}>{STAGE_ICON[v.stage]||'📹'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.title}</div>
                      <div style={{fontSize:10,color:muted,textTransform:'capitalize'}}>{v.stage} · {new Date(v.created_at).toLocaleDateString()}</div>
                    </div>
                    <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99,background:sc+'18',color:sc,border:'1px solid '+sc+'30',flexShrink:0,textTransform:'uppercase'}}>{v.status}</span>
                  </div>
                );
              })
            )}
          </div>

          {/* Pending ideas */}
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid '+rowBorder,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div style={{fontSize:12,fontWeight:700,color:text}}>Pending Ideas</div>
              <button onClick={()=>setActiveView('pipeline:ideas')} style={{fontSize:10,color:accent,background:'transparent',border:'none',cursor:'pointer'}}>View all →</button>
            </div>
            {recentIdeas.length===0?(
              <div style={{padding:'32px 18px',textAlign:'center',color:muted,fontSize:12}}>No pending ideas.<br/>
                <button onClick={async()=>{try{await window.forge.scanIdeas(activeChannel.id);setTimeout(loadData,3000);}catch(e){}}} style={{color:accent,background:'transparent',border:'none',cursor:'pointer',fontSize:12,marginTop:8}}>
                  🤖 Scan for ideas
                </button>
              </div>
            ):(
              recentIdeas.map((idea,i)=>(
                <div key={idea.id}
                  style={{display:'flex',alignItems:'center',gap:12,padding:'11px 18px',borderBottom:i<recentIdeas.length-1?'1px solid '+rowBorder:'none',cursor:'pointer',transition:'background 0.1s'}}
                  onMouseEnter={e=>e.currentTarget.style.background=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <span style={{fontSize:16,flexShrink:0}}>{idea.origin==='manual'?'✏️':idea.origin?.includes('reddit')?'💬':'📰'}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{idea.title}</div>
                    <div style={{fontSize:10,color:muted}}>{idea.origin?.replace('ai_','')}</div>
                  </div>
                  <button onClick={async(e)=>{e.stopPropagation();try{await window.forge.approveIdea(idea.id);loadData();}catch(e){alert(e.message);}}}
                    className="btn btn-primary" style={{fontSize:10,padding:'3px 10px',flexShrink:0}}>
                    ✓ Approve
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pipeline health */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'18px 20px'}}>
          <div style={{fontSize:12,fontWeight:700,color:text,marginBottom:14}}>Pipeline at a Glance</div>
          <div style={{display:'flex',gap:0,alignItems:'center'}}>
            {['ingest','script','assets','voice','compose','review','publish'].map((stage,i,arr)=>{
              return(
                <React.Fragment key={stage}>
                  <div style={{flex:1,textAlign:'center',padding:'8px 4px',cursor:'pointer'}} onClick={()=>setActiveView('pipeline:'+stage)}>
                    <div style={{fontSize:20,marginBottom:4}}>{STAGE_ICON[stage]}</div>
                    <div style={{fontSize:9,color:muted,textTransform:'capitalize',fontWeight:600}}>{stage}</div>
                  </div>
                  {i<arr.length-1&&<div style={{color:sub,fontSize:12,flexShrink:0}}>›</div>}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
