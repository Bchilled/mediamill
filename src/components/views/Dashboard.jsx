import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

export default function Dashboard(){
  const{activeChannel,channels,setActiveView,setActiveChannel,theme,loadChannels}=useApp();
  const[stats,setStats]=useState(null);
  const[recentVideos,setRecentVideos]=useState([]);
  const[recentIdeas,setRecentIdeas]=useState([]);
  const[ytStatus,setYtStatus]=useState(null);
  const[scanning,setScanning]=useState(false);
  const[togglingAuto,setTogglingAuto]=useState(false);
  const isDark=theme==='dark';

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.22)':'rgba(0,0,20,0.28)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.85)';
  const cardBorder=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const cardShadow=isDark?'0 2px 12px rgba(0,0,0,0.3)':'0 2px 12px rgba(0,0,0,0.06)';

  useEffect(()=>{if(activeChannel)loadData();},[activeChannel?.id]);

  async function loadData(){
    try{
      const[videos,ideas,yt]=await Promise.all([
        window.forge.getVideos(activeChannel.id),
        window.forge.getIdeas(activeChannel.id,{}),
        window.forge.youtubeStatus(activeChannel.id).catch(()=>({connected:false})),
      ]);
      const s={ideas:ideas.length,pending:0,processing:0,review:0,published:0,failed:0};
      videos.forEach(v=>{if(s[v.status]!==undefined)s[v.status]++;});
      setStats(s);setRecentVideos(videos.slice(0,5));
      setRecentIdeas(ideas.filter(i=>i.status==='idea').slice(0,5));
      setYtStatus(yt);
    }catch(e){console.error(e);}
  }

  async function toggleAutoApprove(){
    setTogglingAuto(true);
    try{
      await window.forge.updateChannel(activeChannel.id,{auto_approve:activeChannel.auto_approve?0:1});
      await loadChannels();
    }catch(e){console.error(e);}
    setTogglingAuto(false);
  }

  async function scanIdeas(){
    setScanning(true);
    try{await window.forge.scanIdeas(activeChannel.id);}catch(e){console.error(e);}
    await loadData();setScanning(false);
  }

  if(!activeChannel)return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,padding:24}}>
      <div style={{fontSize:48}}>📡</div>
      <div style={{fontSize:18,fontWeight:800,color:text}}>No channel selected</div>
      <div style={{fontSize:13,color:muted}}>Create a channel to get started</div>
      <button onClick={()=>setActiveView('new-channel')} className="btn btn-primary" style={{padding:'10px 24px'}}>Create Channel</button>
      {channels?.length>0&&(
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center',marginTop:4}}>
          {channels.map(ch=>(
            <button key={ch.id} onClick={()=>setActiveChannel(ch)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:12}}>{ch.name}</button>
          ))}
        </div>
      )}
    </div>
  );

  const isEmpty=!stats||Object.values({pending:stats.pending,processing:stats.processing,review:stats.review,published:stats.published,failed:stats.failed}).every(v=>v===0);
  const ytUrl=activeChannel.youtube_id?`https://youtube.com/channel/${activeChannel.youtube_id}`:null;

  const statCards=[
    {label:'Ideas',  value:stats?.ideas||0,  icon:'💡',view:'pipeline:ideas', color:'#888'},
    {label:'Pending',value:stats?.pending||0, icon:'⏳',view:'pipeline:ideas', color:'#888899'},
    {label:'In Progress',value:stats?.processing||0,icon:'⚡',view:null,color:'#00C8FF'},
    {label:'Review', value:stats?.review||0,  icon:'👁',view:'pipeline:review',color:'#FF8040'},
    {label:'Published',value:stats?.published||0,icon:'🚀',view:'pipeline:publish',color:'#C8FF00'},
    {label:'Failed', value:stats?.failed||0,  icon:'✗',view:null,             color:'#EE2244'},
  ];

  return(
    <div style={{flex:1,overflowY:'auto',padding:'20px 24px'}}>
      <div style={{maxWidth:1000,margin:'0 auto'}}>

        {/* Header */}
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20,flexWrap:'wrap',gap:12}}>
          <div>
            <h1 style={{fontSize:22,fontWeight:900,color:text,marginBottom:4}}>{activeChannel.name}</h1>
            <div style={{display:'flex',gap:10,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:11,color:muted,textTransform:'capitalize'}}>{activeChannel.preset}-Form</span>
              <span style={{color:sub}}>·</span>
              <span style={{fontSize:11,color:activeChannel.auto_approve?'#00E676':muted}}>
                {activeChannel.auto_approve?'⚡ Full Auto':'👁 Manual review'}
              </span>
              <span style={{color:sub}}>·</span>
              {ytStatus?.connected?(
                ytUrl?<a href="#" onClick={e=>{e.preventDefault();window.forge.openExternal(ytUrl);}} style={{fontSize:11,color:accent,textDecoration:'none'}}>youtube.com/channel ↗</a>
                :<span style={{fontSize:11,color:'#00E676'}}>✓ YouTube connected</span>
              ):(
                <span style={{fontSize:11,color:'#EE2244'}}>✗ YouTube not connected</span>
              )}
            </div>
            {activeChannel.topic&&<div style={{fontSize:11,color:sub,marginTop:4,fontStyle:'italic'}}>"{activeChannel.topic}"</div>}
          </div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            {/* Full Auto toggle */}
            <button onClick={toggleAutoApprove} disabled={togglingAuto}
              style={{display:'flex',alignItems:'center',gap:7,padding:'7px 13px',borderRadius:9,cursor:'pointer',fontSize:11,fontWeight:600,
                background:activeChannel.auto_approve?'rgba(0,230,118,0.1)':'rgba(255,255,255,0.05)',
                border:'1px solid '+(activeChannel.auto_approve?'rgba(0,230,118,0.3)':'rgba(255,255,255,0.12)'),
                color:activeChannel.auto_approve?'#00E676':muted}}>
              <div style={{width:28,height:16,borderRadius:99,background:activeChannel.auto_approve?'rgba(0,230,118,0.3)':'rgba(255,255,255,0.1)',position:'relative',transition:'all 0.2s'}}>
                <div style={{width:12,height:12,borderRadius:'50%',background:activeChannel.auto_approve?'#00E676':'rgba(255,255,255,0.4)',position:'absolute',top:2,left:activeChannel.auto_approve?14:2,transition:'all 0.2s'}}/>
              </div>
              Full Auto
            </button>
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

        {/* Empty state — no stats, show getting started */}
        {isEmpty?(
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,padding:'32px 24px',textAlign:'center',marginBottom:20,boxShadow:cardShadow}}>
            <div style={{fontSize:48,marginBottom:12}}>🚀</div>
            <div style={{fontSize:16,fontWeight:800,color:text,marginBottom:8}}>Ready to make your first video</div>
            <div style={{fontSize:13,color:muted,marginBottom:20,lineHeight:1.6}}>
              MediaMill finds Canadian stories, writes AI scripts, gathers footage, records narration, and composes the video — automatically.
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={scanIdeas} disabled={scanning} className="btn btn-primary" style={{fontSize:13,padding:'10px 22px',opacity:scanning?0.6:1}}>
                {scanning?'⟳ Scanning…':'🔍 Scan for Ideas'}
              </button>
              <button onClick={()=>setActiveView('pipeline:ideas')} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:13,padding:'10px 20px'}}>
                Browse Ideas →
              </button>
            </div>
            <div style={{marginTop:20,display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
              {[
                {n:'1',t:'Scan for ideas', desc:'AI finds current Canadian stories'},
                {n:'2',t:'Approve one',    desc:'Click ✓ on an idea you like'},
                {n:'3',t:'Run pipeline',   desc:'AI scripts, voices, composes video'},
                {n:'4',t:'Review & publish',desc:'Watch it, then send to YouTube'},
              ].map(s=>(
                <div key={s.n} style={{textAlign:'center',maxWidth:110,padding:'12px 10px',background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.025)',borderRadius:12,border:'1px solid '+cardBorder}}>
                  <div style={{width:24,height:24,borderRadius:'50%',background:accent+'15',border:'1px solid '+accent+'30',
                    display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:800,color:accent,margin:'0 auto 6px'}}>
                    {s.n}
                  </div>
                  <div style={{fontSize:11,fontWeight:700,color:text,marginBottom:3}}>{s.t}</div>
                  <div style={{fontSize:10,color:muted,lineHeight:1.3}}>{s.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ):(
          <>
            {/* Stats grid */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:10,marginBottom:20}}>
              {statCards.map(s=>(
                <div key={s.label} onClick={s.view?()=>setActiveView(s.view):undefined}
                  style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,padding:'16px 12px',textAlign:'center',
                    cursor:s.view?'pointer':'default',boxShadow:cardShadow,transition:'transform 0.1s',
                    opacity:s.value===0?0.45:1}}
                  onMouseEnter={e=>{if(s.view)e.currentTarget.style.transform='translateY(-2px)';}}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <div style={{fontSize:20,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:22,fontWeight:900,color:s.value>0?s.color:muted}}>{s.value}</div>
                  <div style={{fontSize:10,fontWeight:600,color:muted,textTransform:'uppercase',letterSpacing:'0.08em',marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Videos + Pending Ideas */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:20}}>
              {[
                {title:'Recent Videos',items:recentVideos,empty:'No videos yet — approve an idea to start',view:'pipeline:review',
                  render:v=><div key={v.id} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid '+cardBorder,alignItems:'center'}}>
                    <span style={{fontSize:16}}>{v.status==='published'?'🚀':v.status==='review'?'👁':'⚡'}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.title||'Untitled'}</div>
                      <div style={{fontSize:10,color:muted,textTransform:'capitalize'}}>{v.status}</div>
                    </div>
                  </div>},
                {title:'Pending Ideas',items:recentIdeas,empty:'No ideas yet',view:'pipeline:ideas',
                  render:i=><div key={i.id} style={{display:'flex',gap:10,padding:'8px 0',borderBottom:'1px solid '+cardBorder,alignItems:'center'}}>
                    <span style={{fontSize:16}}>💡</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{i.title}</div>
                      <div style={{fontSize:10,color:muted}}>{i.source||'AI generated'}</div>
                    </div>
                    <button onClick={async()=>{try{await window.forge.approveIdea(i.id);loadData();}catch(e){}}}
                      style={{fontSize:10,padding:'3px 9px',borderRadius:7,background:accent+'12',color:accent,border:'1px solid '+accent+'30',cursor:'pointer',flexShrink:0}}>✓</button>
                  </div>},
              ].map(panel=>(
                <div key={panel.title} style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,padding:'16px',boxShadow:cardShadow}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{fontSize:13,fontWeight:800,color:text}}>{panel.title}</div>
                    <button onClick={()=>setActiveView(panel.view)} style={{fontSize:11,color:accent,background:'none',border:'none',cursor:'pointer'}}>View all →</button>
                  </div>
                  {panel.items.length>0?panel.items.map(panel.render):(
                    <div style={{textAlign:'center',padding:'16px 0',color:muted,fontSize:12}}>{panel.empty}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
