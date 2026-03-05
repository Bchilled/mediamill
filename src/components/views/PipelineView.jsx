import React,{useState,useEffect,useCallback,useRef}from 'react';
import{useApp}from '../../context/AppContext';
import MediaPicker from '../shared/MediaPicker';
import SubtitlesPanel from '../shared/SubtitlesPanel';

function CreatorTools({isDark,video}){
  const[open,setOpen]=useState(false);
  const[tab,setTab]=useState('footage');
  const[saving,setSaving]=useState(false);
  const[assets,setAssets]=useState({footage:[],audio:[],music:[],images:[],script:[],thumbnail:[]});
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const bg=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  const border=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';

  async function save(type,files){
    setAssets(a=>({...a,[type]:files}));
    if(!video?.id||!files.length)return;
    setSaving(true);
    try{await window.forge.attachCreatorAssets(video.id,type,files.map(f=>({name:f.name,path:f.path,type:f.type,size:f.size})));}
    catch(e){console.error(e);}
    setSaving(false);
  }

  const tabs=[
    {id:'footage', label:'📹 Footage',   accept:'video',    hint:'Your own clips — used alongside or instead of stock footage'},
    {id:'audio',   label:'🎙 Voice',     accept:'audio',    hint:'Your narration recording — replaces AI voice for this video'},
    {id:'music',   label:'🎵 Music',     accept:'audio',    hint:'Background music or sound effects layered during compose'},
    {id:'images',  label:'🖼 Images',    accept:'image',    hint:'Your photos, graphics, or B-roll stills matched to the script'},
    {id:'script',  label:'📝 Script',    accept:'document', hint:'Your own script (.txt, .md, .docx) — AI uses this instead of generating'},
    {id:'thumbnail',label:'🎨 Thumbnail',accept:'image',    hint:'Custom thumbnail — skips AI thumbnail generation'},
  ];

  const totalFiles=Object.values(assets).flat().length;

  return(
    <div style={{background:bg,border:'1px solid '+border,borderRadius:14,marginBottom:20,overflow:'hidden'}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{padding:'13px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',cursor:'pointer',
          borderBottom:open?'1px solid '+border:'none'}}>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <span style={{fontSize:16}}>🎨</span>
          <div>
            <div style={{fontSize:12,fontWeight:800,color:text}}>Creator Tools — Add Your Own Media</div>
            <div style={{fontSize:10,color:muted}}>Footage, voice, music, images, script, thumbnail — your content overrides AI defaults</div>
          </div>
        </div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          {totalFiles>0&&<span style={{fontSize:10,fontWeight:700,color:accent,background:accent+'12',padding:'2px 8px',borderRadius:99}}>{totalFiles} file{totalFiles!==1?'s':''} added</span>}
          {saving&&<span style={{fontSize:10,color:muted}}>⟳ saving…</span>}
          <span style={{fontSize:10,color:muted}}>{open?'▲':'▼'}</span>
        </div>
      </div>
      {open&&(
        <div style={{padding:'14px 18px'}}>
          <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:14}}>
            {tabs.map(t=>{
              const c=assets[t.id]?.length||0;
              return(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{fontSize:11,padding:'5px 11px',borderRadius:8,cursor:'pointer',fontWeight:tab===t.id?700:400,
                    background:tab===t.id?accent+'15':'transparent',
                    border:'1px solid '+(tab===t.id?accent+'40':border),
                    color:tab===t.id?accent:muted}}>
                  {t.label}{c>0&&<span style={{marginLeft:4,fontSize:9,background:accent,color:'#000',borderRadius:99,padding:'1px 5px',fontWeight:800}}>{c}</span>}
                </button>
              );
            })}
          </div>
          {tabs.filter(t=>t.id===tab).map(t=>(
            <MediaPicker key={t.id} isDark={isDark} accept={t.accept} hint={t.hint}
              existingFiles={assets[t.id]||[]} onFiles={f=>save(t.id,f)}/>
          ))}
        </div>
      )}
    </div>
  );
}

const STAGES=[
  {id:'ingest',label:'Ingest',icon:'📥',desc:'Idea approved, ready to process'},
  {id:'script',label:'Script',icon:'📄',desc:'AI writes script + SEO + B-roll cues'},
  {id:'assets',label:'Assets',icon:'🖼',desc:'Fetch footage from Pexels, Wikimedia, Archive'},
  {id:'voice',label:'Voice',icon:'🎙',desc:'Render narration audio'},
  {id:'compose',label:'Compose',icon:'🎞',desc:'FFmpeg assembles final video'},
  {id:'review',label:'Review',icon:'👁',desc:'You approve before publish'},
  {id:'publish',label:'Publish',icon:'🚀',desc:'Upload to YouTube'},
];

const STATUS_COLOR={
  pending:'#888899',processing:'#00C8FF',review:'#FF8040',
  approved:'#00E676',published:'#C8FF00',failed:'#EE2244',
};

function StageBar({currentStage,status,isDark}){
  const stageIdx=STAGES.findIndex(s=>s.id===currentStage);
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,20,0.35)';
  return(
    <div style={{display:'flex',alignItems:'center',padding:'16px 0',overflowX:'auto'}}>
      {STAGES.map((s,i)=>{
        const done=stageIdx>i||(stageIdx===i&&status==='approved')||status==='published';
        const active=stageIdx===i&&status!=='published';
        const failed=active&&status==='failed';
        const color=failed?'#EE2244':done||active?STATUS_COLOR[status]||'#C8FF00':'rgba(255,255,255,0.1)';
        return(
          <React.Fragment key={s.id}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6,flexShrink:0}}>
              <div style={{
                width:36,height:36,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                background:done?color:active?color+'22':'rgba(255,255,255,0.05)',
                border:'2px solid '+(done||active?color:'rgba(255,255,255,0.1)'),
                fontSize:16,
                boxShadow:active?'0 0 16px '+color+'60':'none',
                transition:'all 0.3s',
              }}>
                {done&&!active?'✓':s.icon}
              </div>
              <div style={{fontSize:10,fontWeight:active?700:500,color:active?color:muted,textAlign:'center',whiteSpace:'nowrap'}}>{s.label}</div>
            </div>
            {i<STAGES.length-1&&(
              <div style={{flex:1,height:2,background:done?color:'rgba(255,255,255,0.08)',minWidth:20,transition:'all 0.3s',margin:'0 4px',marginBottom:20}}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function ScriptViewer({script,isDark}){
  const[tab,setTab]=useState('script');
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.25)':'rgba(0,0,20,0.3)';
  const card=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const tabs=['script','seo','broll','chapters'];

  return(
    <div>
      <div style={{display:'flex',gap:2,marginBottom:16,background:isDark?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.05)',borderRadius:9,padding:3,width:'fit-content'}}>
        {tabs.map(t=>(
          <button key={t} onClick={()=>setTab(t)} style={{
            fontSize:11,fontWeight:600,padding:'5px 12px',borderRadius:7,border:'none',cursor:'pointer',
            background:tab===t?(isDark?'rgba(255,255,255,0.1)':'#fff'):'transparent',
            color:tab===t?text:muted,
            boxShadow:tab===t?'0 1px 4px rgba(0,0,0,0.15)':'none',
            textTransform:'capitalize',
          }}>{t==='broll'?'B-Roll':t==='seo'?'SEO':t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {tab==='script'&&(
        <div style={{display:'flex',flexDirection:'column',gap:10,maxHeight:400,overflowY:'auto'}}>
          {(script.script||[]).map((seg,i)=>(
            <div key={seg.id||i} style={{background:card,border:'1px solid '+border,borderRadius:10,padding:'12px 14px'}}>
              <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                <span style={{fontSize:9,fontWeight:700,padding:'2px 8px',borderRadius:99,background:accent+'15',color:accent,border:'1px solid '+accent+'25',textTransform:'uppercase'}}>{seg.type}</span>
                {seg.chapter_title&&<span style={{fontSize:10,color:muted}}>📌 {seg.chapter_title}</span>}
                <span style={{fontSize:10,color:sub,marginLeft:'auto'}}>~{seg.duration_seconds}s</span>
              </div>
              <p style={{fontSize:12,color:text,lineHeight:1.6,margin:0}}>{seg.narration}</p>
              {seg.onscreen_text&&<div style={{fontSize:11,color:accent,marginTop:6,fontStyle:'italic'}}>📺 "{seg.onscreen_text}"</div>}
            </div>
          ))}
        </div>
      )}

      {tab==='seo'&&(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {['en','fr','es'].map(lang=>(
            <div key={lang} style={{background:card,border:'1px solid '+border,borderRadius:10,padding:'12px 14px'}}>
              <div style={{fontSize:10,fontWeight:700,color:accent,marginBottom:8,textTransform:'uppercase',letterSpacing:'0.1em'}}>{lang==='en'?'🇨🇦 English':lang==='fr'?'🇫🇷 French':'🇪🇸 Spanish'}</div>
              <div style={{fontSize:13,fontWeight:600,color:text,marginBottom:4}}>{script['title_'+lang]||'—'}</div>
              <div style={{fontSize:11,color:muted,lineHeight:1.5,marginBottom:8}}>{script['description_'+lang]?.slice(0,200)||'—'}...</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4}}>
                {(script['tags_'+lang]||[]).slice(0,8).map(t=>(
                  <span key={t} style={{fontSize:9,padding:'2px 7px',borderRadius:99,background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',color:muted,border:'1px solid '+border}}>#{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='broll'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:400,overflowY:'auto'}}>
          {(script.script||[]).flatMap(seg=>(seg.broll||[]).map((b,i)=>({...b,segType:seg.type,segId:seg.id,bIdx:i}))).map((b,i)=>(
            <div key={i} style={{background:card,border:'1px solid '+border,borderRadius:8,padding:'10px 12px',display:'flex',gap:12,alignItems:'flex-start'}}>
              <span style={{fontSize:18,flexShrink:0}}>🎬</span>
              <div>
                <div style={{fontSize:12,fontWeight:600,color:text,marginBottom:2}}>"{b.query}"</div>
                <div style={{fontSize:10,color:muted}}>{b.duration}s · {b.notes||''}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='chapters'&&(
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {(script.chapters||[]).map((c,i)=>(
            <div key={i} style={{display:'flex',gap:12,padding:'8px 12px',background:card,border:'1px solid '+border,borderRadius:8}}>
              <span style={{fontSize:11,fontWeight:700,fontFamily:'monospace',color:accent,minWidth:40}}>{c.time}</span>
              <span style={{fontSize:12,color:text}}>{c.title}</span>
            </div>
          ))}
        </div>
      )}

      {script.thumbnail_concept&&(
        <div style={{marginTop:12,padding:'10px 14px',background:card,border:'1px solid '+border,borderRadius:10}}>
          <div style={{fontSize:10,fontWeight:700,color:muted,marginBottom:4}}>🖼 THUMBNAIL CONCEPT</div>
          <div style={{fontSize:11,color:text,lineHeight:1.5}}>{script.thumbnail_concept}</div>
        </div>
      )}
    </div>
  );
}

function VideoCard({video,isDark,onSelect,isSelected}){
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const card=isDark?'linear-gradient(145deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))':'linear-gradient(145deg,#fff,#f8f8ff)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  const accent=isDark?'#C8FF00':'#4400CC';
  const sc=STATUS_COLOR[video.status]||'#888';

  return(
    <div onClick={()=>onSelect(video)}
      style={{
        background:card,
        border:'1px solid '+(isSelected?accent+'60':cardBorder),
        borderLeft:'3px solid '+sc,
        borderRadius:12,padding:'12px 14px',cursor:'pointer',
        boxShadow:isSelected?'0 0 0 1px '+accent+'30,0 4px 20px rgba(0,0,0,0.3)':'0 2px 8px rgba(0,0,0,0.2)',
        transition:'all 0.15s',marginBottom:8,
      }}
      onMouseEnter={e=>e.currentTarget.style.transform='translateX(2px)'}
      onMouseLeave={e=>e.currentTarget.style.transform='none'}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:4}}>
        <div style={{fontSize:12,fontWeight:600,color:text,flex:1,marginRight:8,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{video.title}</div>
        <span style={{fontSize:9,fontWeight:700,padding:'2px 7px',borderRadius:99,background:sc+'18',color:sc,border:'1px solid '+sc+'30',flexShrink:0,textTransform:'uppercase'}}>{video.status}</span>
      </div>
      <div style={{fontSize:10,color:muted,textTransform:'capitalize'}}>{video.stage} stage · {video.preset}-form</div>
    </div>
  );
}

export default function PipelineView(){
  const{activeChannel,theme}=useApp();
  const[videos,setVideos]=useState([]);
  const[selected,setSelected]=useState(null);
  const[script,setScript]=useState(null);
  const[tasks,setTasks]=useState([]);
  const[running,setRunning]=useState({});
  const[log,setLog]=useState([]);
  const[showCreateVideo,setShowCreateVideo]=useState(false);
  const[newVideoTitle,setNewVideoTitle]=useState('');
  const pollRef=useRef(null);
  const isDark=theme==='dark';

  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.25)':'rgba(0,0,20,0.3)';
  const panelBg=isDark?'rgba(8,8,18,0.6)':'rgba(236,236,252,0.7)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const accent=isDark?'#C8FF00':'#4400CC';

  const addLog=(msg,type='info')=>setLog(l=>[{msg,type,time:new Date().toLocaleTimeString()},...l].slice(0,50));

  const loadVideos=useCallback(async()=>{
    if(!activeChannel)return;
    try{const v=await window.forge.getVideos(activeChannel.id);setVideos(v||[]);}catch(e){}
  },[activeChannel]);

  const loadSelected=useCallback(async()=>{
    if(!selected)return;
    try{
      const{video,tasks:t}=await window.forge.pipelineStatus(selected.id);
      if(video){
        setSelected(video);
        if(video.script)try{setScript(JSON.parse(video.script));}catch(e){}
      }
      setTasks(t||[]);
    }catch(e){}
  },[selected?.id]);

  useEffect(()=>{loadVideos();},[loadVideos]);

  // Poll selected video every 3s while processing
  useEffect(()=>{
    if(pollRef.current)clearInterval(pollRef.current);
    if(selected?.status==='processing'){
      pollRef.current=setInterval(()=>{loadSelected();loadVideos();},3000);
    }
    return()=>{if(pollRef.current)clearInterval(pollRef.current);};
  },[selected?.status,loadSelected,loadVideos]);

  async function runStage(stage){
    if(!selected)return;
    setRunning(r=>({...r,[stage]:true}));
    addLog(`Starting ${stage}...`,'info');
    try{
      let result;
      if(stage==='script')result=await window.forge.generateScript(selected.id);
      else if(stage==='assets')result=await window.forge.gatherAssets(selected.id);
      else if(stage==='voice')result=await window.forge.renderVoice(selected.id);
      else if(stage==='compose')result=await window.forge.composeVideo(selected.id);
      else if(stage==='pipeline')result=await window.forge.startPipeline(selected.id);
      addLog(`${stage} completed ✓`,'success');
      await loadVideos();
      await loadSelected();
    }catch(e){
      addLog(`${stage} failed: ${e.message}`,'error');
    }finally{
      setRunning(r=>({...r,[stage]:false}));
    }
  }

  async function approveVideo(){
    if(!selected)return;
    try{await window.forge.approveVideo(selected.id);addLog('Video approved ✓','success');loadVideos();loadSelected();}
    catch(e){addLog('Approve failed: '+e.message,'error');}
  }

  async function createVideo(){
    if(!newVideoTitle.trim()||!activeChannel)return;
    try{
      const v=await window.forge.createVideo({channel_id:activeChannel.id,title:newVideoTitle,preset:activeChannel.preset});
      setNewVideoTitle('');setShowCreateVideo(false);
      await loadVideos();setSelected(v);
      addLog('Video created: '+v.title,'success');
    }catch(e){addLog('Create failed: '+e.message,'error');}
  }

  if(!activeChannel)return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:muted}}>
        <div style={{fontSize:48,marginBottom:12}}>🎬</div>
        <div style={{fontSize:16,fontWeight:700,color:text,marginBottom:6}}>Select a channel first</div>
      </div>
    </div>
  );

  return(
    <div style={{flex:1,display:'flex',overflow:'hidden'}}>

      {/* Left — video list */}
      <div style={{width:260,flexShrink:0,display:'flex',flexDirection:'column',background:panelBg,borderRight:'1px solid '+border}}>
        <div style={{padding:'12px 12px 8px',borderBottom:'1px solid '+border}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{fontSize:11,fontWeight:700,color:text}}>Videos</div>
            <button onClick={()=>setShowCreateVideo(true)} className="btn btn-primary" style={{fontSize:10,padding:'4px 10px'}}>+ New</button>
          </div>
          {showCreateVideo&&(
            <div style={{marginBottom:8}}>
              <input value={newVideoTitle} onChange={e=>setNewVideoTitle(e.target.value)}
                placeholder="Video title..." className={isDark?'input-dark':'input-light'}
                style={{marginBottom:6}}
                onKeyDown={e=>e.key==='Enter'&&createVideo()}/>
              <div style={{display:'flex',gap:6}}>
                <button onClick={createVideo} className="btn btn-primary" style={{flex:1,fontSize:10,padding:'5px'}}>Create</button>
                <button onClick={()=>setShowCreateVideo(false)} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:10,padding:'5px 8px'}}>✕</button>
              </div>
            </div>
          )}
          <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
            {['all','pending','processing','review','published','failed'].map(f=>(
              <span key={f} style={{fontSize:9,padding:'2px 7px',borderRadius:99,background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',color:muted,cursor:'pointer',textTransform:'capitalize'}}>{f}</span>
            ))}
          </div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:10}}>
          {videos.length===0&&<div style={{textAlign:'center',padding:24,fontSize:11,color:muted}}>No videos yet.<br/>Create one above or approve an idea.</div>}
          {videos.map(v=><VideoCard key={v.id} video={v} isDark={isDark} onSelect={v=>{setSelected(v);setScript(null);setTasks([]);setTimeout(loadSelected,100);}} isSelected={selected?.id===v.id}/>)}
        </div>
      </div>

      {/* Main — selected video detail */}
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
        {!selected?(
          <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:muted}}>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:40,marginBottom:12}}>👈</div>
              <div style={{fontSize:14,color:text,fontWeight:600,marginBottom:6}}>Select a video</div>
              <div style={{fontSize:12}}>or create a new one</div>
            </div>
          </div>
        ):(
          <div style={{flex:1,overflowY:'auto',padding:24}}>

            {/* Header */}
            <div style={{marginBottom:20}}>
              <h2 style={{fontSize:18,fontWeight:900,color:text,marginBottom:4}}>{selected.title}</h2>
              <div style={{display:'flex',gap:12,alignItems:'center',fontSize:11,color:muted}}>
                <span style={{textTransform:'capitalize'}}>{selected.preset}-form</span>
                <span>·</span>
                <span style={{color:STATUS_COLOR[selected.status]||'#888',fontWeight:600,textTransform:'uppercase'}}>{selected.status}</span>
                {selected.target_length&&<><span>·</span><span>~{selected.target_length} min</span></>}
              </div>
            </div>

            {/* Stage progress bar */}
            <div style={{background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',border:'1px solid '+border,borderRadius:14,padding:'16px 20px',marginBottom:20}}>
              <StageBar currentStage={selected.stage} status={selected.status} isDark={isDark}/>
            </div>

            {/* Action buttons */}
            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
              {selected.status==='pending'&&(
                <>
                  <button onClick={()=>runStage('pipeline')} disabled={running.pipeline} className="btn btn-primary" style={{fontSize:12,padding:'8px 18px',opacity:running.pipeline?0.6:1}}>
                    {running.pipeline?'⟳ Running full pipeline…':'▶ Run Full Pipeline'}
                  </button>
                  <button onClick={()=>runStage('script')} disabled={running.script} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:12,padding:'8px 14px'}}>
                    {running.script?'⟳ Writing…':'📄 Script Only'}
                  </button>
                </>
              )}
              {selected.stage==='assets'&&selected.status!=='failed'&&(
                <button onClick={()=>runStage('assets')} disabled={running.assets} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:12,padding:'8px 14px'}}>
                  {running.assets?'⟳ Fetching…':'🖼 Gather Assets'}
                </button>
              )}
              {selected.stage==='voice'&&selected.status!=='failed'&&(
                <button onClick={()=>runStage('voice')} disabled={running.voice} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:12,padding:'8px 14px'}}>
                  {running.voice?'⟳ Rendering…':'🎙 Render Voice'}
                </button>
              )}
              {selected.stage==='compose'&&selected.status!=='failed'&&(
                <button onClick={()=>runStage('compose')} disabled={running.compose} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{fontSize:12,padding:'8px 14px'}}>
                  {running.compose?'⟳ Composing…':'🎞 Compose Video'}
                </button>
              )}
              {selected.status==='review'&&(
                <>
                  <button onClick={approveVideo} className="btn btn-success" style={{fontSize:12,padding:'8px 18px'}}>✓ Approve & Publish</button>
                  <button className="btn btn-danger" style={{fontSize:12,padding:'8px 14px'}}>✕ Reject</button>
                </>
              )}
              {selected.status==='failed'&&(
                <button onClick={()=>runStage('pipeline')} className="btn btn-danger" style={{fontSize:12,padding:'8px 14px'}}>⟳ Retry Pipeline</button>
              )}
            </div>

            {/* Script viewer */}
            {script&&(
              <div style={{background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',border:'1px solid '+border,borderRadius:14,padding:'16px 20px',marginBottom:20}}>
                <div style={{fontSize:11,fontWeight:700,color:muted,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:12}}>Script Output</div>
                <ScriptViewer script={script} isDark={isDark}/>
              </div>
            )}

            {/* ── Creator Tools ─────────────────────────────────── */}
            <CreatorTools isDark={isDark} video={selected}/>

            {/* ── Subtitles & Captions ──────────────────────────── */}
            <SubtitlesPanel isDark={isDark} video={selected}/>

            {/* Task log */}
            {tasks.length>0&&(
              <div style={{background:isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)',border:'1px solid '+border,borderRadius:14,padding:'16px 20px'}}>
                <div style={{fontSize:11,fontWeight:700,color:muted,letterSpacing:'0.15em',textTransform:'uppercase',marginBottom:12}}>Task Log</div>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {tasks.map(t=>{
                    const tc=t.status==='completed'?'#00E676':t.status==='failed'?'#EE2244':'#00C8FF';
                    return(
                      <div key={t.id} style={{display:'flex',gap:10,alignItems:'flex-start',fontSize:11}}>
                        <span style={{color:tc,flexShrink:0,marginTop:1}}>{t.status==='completed'?'✓':t.status==='failed'?'✕':'⟳'}</span>
                        <span style={{fontWeight:600,color:text,textTransform:'capitalize',flexShrink:0,minWidth:80}}>{t.type}</span>
                        <span style={{color:muted,flex:1}}>{t.output_json?JSON.parse(t.output_json).detail||'':''}</span>
                        <span style={{color:sub,flexShrink:0,fontFamily:'monospace',fontSize:9}}>{t.created_at?.slice(11,19)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right — live log */}
      <div style={{width:220,flexShrink:0,background:panelBg,borderLeft:'1px solid '+border,display:'flex',flexDirection:'column'}}>
        <div style={{padding:'12px 14px',borderBottom:'1px solid '+border}}>
          <div style={{fontSize:11,fontWeight:700,color:text}}>Live Log</div>
        </div>
        <div style={{flex:1,overflowY:'auto',padding:10,display:'flex',flexDirection:'column',gap:6}}>
          {log.length===0&&<div style={{fontSize:10,color:sub,textAlign:'center',paddingTop:16}}>No activity yet</div>}
          {log.map((l,i)=>(
            <div key={i} style={{fontSize:10,lineHeight:1.4}}>
              <div style={{color:sub,fontFamily:'monospace',fontSize:9}}>{l.time}</div>
              <div style={{color:l.type==='error'?'#EE2244':l.type==='success'?'#00E676':muted}}>{l.msg}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
