import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

export default function AnalyticsView(){
  const{activeChannel,theme}=useApp();
  const[data,setData]=useState(null);
  const[loading,setLoading]=useState(false);
  const[error,setError]=useState('');
  const[ytStatus,setYtStatus]=useState(null);
  const isDark=theme==='dark';

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const card=isDark?'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))':'linear-gradient(145deg,#fff,#f8f8ff)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  const cardShadow=isDark?'0 4px 24px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.07)':'0 2px 16px rgba(0,0,0,0.07),inset 0 1px 0 #fff';
  const accent=isDark?'#C8FF00':'#4400CC';
  const rowBorder=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';

  useEffect(()=>{
    if(!activeChannel)return;
    window.forge.youtubeStatus(activeChannel.id).then(setYtStatus).catch(()=>setYtStatus({connected:false}));
  },[activeChannel?.id]);

  async function fetchAnalytics(){
    setLoading(true);setError('');
    try{
      const result=await window.forge.youtubeAnalytics(activeChannel.id,30);
      setData(result);
    }catch(e){setError(e.message);}
    setLoading(false);
  }

  async function connectYouTube(){
    try{await window.forge.youtubeConnect(activeChannel.id);const s=await window.forge.youtubeStatus(activeChannel.id);setYtStatus(s);}
    catch(e){setError(e.message);}
  }

  if(!activeChannel)return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:muted}}>
      <div style={{textAlign:'center'}}><div style={{fontSize:40,marginBottom:12}}>📊</div><div>Select a channel first</div></div>
    </div>
  );

  // Parse YouTube Analytics response
  const rows=data?.analytics?.rows||[];
  const headers=data?.analytics?.columnHeaders?.map(h=>h.name)||[];
  const totalViews=rows.reduce((s,r)=>s+(r[headers.indexOf('views')]||0),0);
  const totalMins=rows.reduce((s,r)=>s+(r[headers.indexOf('estimatedMinutesWatched')]||0),0);
  const totalRevenue=rows.reduce((s,r)=>s+(parseFloat(r[headers.indexOf('estimatedRevenue')])||0),0);
  const totalSubs=rows.reduce((s,r)=>s+(r[headers.indexOf('subscribersGained')]||0),0);

  const videoItems=data?.videoStats?.items||[];

  return(
    <div style={{flex:1,overflowY:'auto',padding:28}}>
      <div style={{maxWidth:1000,margin:'0 auto'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:4}}>Analytics</h2>
            <div style={{fontSize:12,color:muted}}>{activeChannel.name} · Last 30 days</div>
          </div>
          <div style={{display:'flex',gap:8}}>
            {!ytStatus?.connected?(
              <button onClick={connectYouTube} className="btn btn-primary" style={{fontSize:12}}>🔗 Connect YouTube</button>
            ):(
              <button onClick={fetchAnalytics} disabled={loading} className="btn btn-primary" style={{fontSize:12,opacity:loading?0.6:1}}>
                {loading?'⟳ Loading…':'📊 Fetch Analytics'}
              </button>
            )}
          </div>
        </div>

        {error&&<div style={{padding:'12px 16px',borderRadius:10,background:'rgba(238,34,68,0.08)',border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',fontSize:13,marginBottom:20}}>{error}</div>}

        {!ytStatus?.connected&&(
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'40px',textAlign:'center',marginBottom:24}}>
            <div style={{fontSize:48,marginBottom:16}}>📺</div>
            <div style={{fontSize:16,fontWeight:700,color:text,marginBottom:8}}>YouTube Not Connected</div>
            <div style={{fontSize:13,color:muted,marginBottom:20,lineHeight:1.5}}>
              Connect your YouTube channel to see views, watch time, revenue, and subscriber data.<br/>
              You'll need a YouTube Data API key in Settings → Publishing first.
            </div>
            <button onClick={connectYouTube} className="btn btn-primary" style={{fontSize:13,padding:'10px 24px'}}>🔗 Connect YouTube</button>
          </div>
        )}

        {ytStatus?.connected&&!data&&(
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'40px',textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>📊</div>
            <div style={{fontSize:16,fontWeight:700,color:text,marginBottom:8}}>Ready to Fetch</div>
            <div style={{fontSize:13,color:muted,marginBottom:20}}>Click "Fetch Analytics" to pull data from YouTube Studio.</div>
            <button onClick={fetchAnalytics} className="btn btn-primary" style={{fontSize:13,padding:'10px 24px'}}>Fetch Analytics</button>
          </div>
        )}

        {data&&(
          <>
            {/* Summary stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
              {[
                {label:'Views',val:totalViews.toLocaleString(),icon:'👁',color:'#00C8FF'},
                {label:'Watch Hours',val:Math.round(totalMins/60).toLocaleString(),icon:'⏱',color:'#C8FF00'},
                {label:'Revenue',val:'$'+totalRevenue.toFixed(2),icon:'💰',color:'#00E676'},
                {label:'New Subs',val:(totalSubs>0?'+':'')+totalSubs.toLocaleString(),icon:'👤',color:'#FF8040'},
              ].map(s=>(
                <div key={s.label} style={{background:card,border:'1px solid '+cardBorder,borderRadius:14,boxShadow:cardShadow,padding:'18px',textAlign:'center',borderTop:'3px solid '+s.color}}>
                  <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
                  <div style={{fontSize:22,fontWeight:900,color:s.color}}>{s.val}</div>
                  <div style={{fontSize:10,color:muted,marginTop:4,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600}}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Daily breakdown */}
            {rows.length>0&&(
              <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,overflow:'hidden',marginBottom:20}}>
                <div style={{padding:'14px 18px',borderBottom:'1px solid '+rowBorder}}>
                  <div style={{fontSize:12,fontWeight:700,color:text}}>Daily Views (Last 30 Days)</div>
                </div>
                <div style={{padding:'16px 18px',overflowX:'auto'}}>
                  <div style={{display:'flex',alignItems:'flex-end',gap:3,height:80,minWidth:rows.length*14}}>
                    {rows.map((r,i)=>{
                      const views=r[headers.indexOf('views')]||0;
                      const maxViews=Math.max(...rows.map(row=>row[headers.indexOf('views')]||0),1);
                      const height=Math.max(2,(views/maxViews)*72);
                      return(
                        <div key={i} title={`${r[0]}: ${views} views`}
                          style={{flex:1,minWidth:10,height:height,background:accent+'90',borderRadius:'3px 3px 0 0',transition:'all 0.2s',cursor:'pointer'}}
                          onMouseEnter={e=>e.currentTarget.style.background=accent}
                          onMouseLeave={e=>e.currentTarget.style.background=accent+'90'}/>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Top videos */}
            {videoItems.length>0&&(
              <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,overflow:'hidden'}}>
                <div style={{padding:'14px 18px',borderBottom:'1px solid '+rowBorder}}>
                  <div style={{fontSize:12,fontWeight:700,color:text}}>Published Videos</div>
                </div>
                {videoItems.map((v,i)=>{
                  const stats=v.statistics||{};
                  return(
                    <div key={v.id} style={{display:'flex',gap:14,padding:'12px 18px',borderBottom:i<videoItems.length-1?'1px solid '+rowBorder:'none',alignItems:'center'}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:12,fontWeight:600,color:text,marginBottom:2,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{v.snippet?.title}</div>
                        <div style={{fontSize:10,color:muted}}>{new Date(v.snippet?.publishedAt).toLocaleDateString()}</div>
                      </div>
                      <div style={{display:'flex',gap:16,flexShrink:0,fontSize:11}}>
                        <div style={{textAlign:'center'}}><div style={{fontWeight:700,color:text}}>{parseInt(stats.viewCount||0).toLocaleString()}</div><div style={{color:muted,fontSize:9}}>views</div></div>
                        <div style={{textAlign:'center'}}><div style={{fontWeight:700,color:text}}>{parseInt(stats.likeCount||0).toLocaleString()}</div><div style={{color:muted,fontSize:9}}>likes</div></div>
                        <div style={{textAlign:'center'}}><div style={{fontWeight:700,color:text}}>{parseInt(stats.commentCount||0).toLocaleString()}</div><div style={{color:muted,fontSize:9}}>comments</div></div>
                      </div>
                      <a href={`https://youtube.com/watch?v=${v.id}`} target="_blank" rel="noreferrer"
                        style={{fontSize:10,color:accent,textDecoration:'none',flexShrink:0}}>Watch ↗</a>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
