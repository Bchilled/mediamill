import React,{useState,useEffect,useCallback}from 'react';
import{useApp}from '../../context/AppContext';
import MediaPicker from '../shared/MediaPicker';

const STATUS_COLS=[
  {id:'idea',label:'Ideas',color:'#8888FF'},
  {id:'approved',label:'Approved',color:'#00BB66'},
  {id:'rejected',label:'Rejected',color:'#FF4040'},
];

const ORIGINS={
  manual:{icon:'✏️',label:'Manual'},
  ai_news:{icon:'📰',label:'News'},
  ai_wiki:{icon:'📚',label:'Wikipedia'},
  ai_reddit:{icon:'💬',label:'Reddit'},
  ai_archive:{icon:'🗄️',label:'Archive'},
  ai_scan:{icon:'🤖',label:'AI Scan'},
};

function IdeaCard({idea,isDark,onApprove,onReject,onDelete,onEdit}){
  const[hover,setHover]=useState(false);
  const card=isDark?'linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))':'linear-gradient(145deg,#FFFFFF,#F8F8FF)';
  const cardBorder=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)';
  const cardShadow=hover
    ?(isDark?'0 12px 40px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,255,255,0.1)':'0 8px 30px rgba(0,0,0,0.12),inset 0 1px 0 rgba(255,255,255,1)')
    :(isDark?'0 4px 20px rgba(0,0,0,0.35),inset 0 1px 0 rgba(255,255,255,0.07)':'0 2px 12px rgba(0,0,0,0.07),inset 0 1px 0 rgba(255,255,255,1)');
  const text=isDark?'#F0EFFF':'#0C0C0E';
  const sub=isDark?'rgba(255,255,255,0.55)':'rgba(0,0,20,0.55)';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,20,0.38)';
  const rowBorder=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.06)';
  const origin=ORIGINS[idea.origin]||ORIGINS.manual;
  let tags=[];try{tags=JSON.parse(idea.tags||'[]');}catch(e){}
  let sources=[];try{sources=JSON.parse(idea.sources||'[]');}catch(e){}

  return(
    <div
      onMouseEnter={()=>setHover(true)}
      onMouseLeave={()=>setHover(false)}
      style={{
        background:card,border:'1px solid '+cardBorder,borderRadius:14,
        boxShadow:cardShadow,padding:'14px 16px',marginBottom:10,
        transition:'all 0.15s ease',transform:hover?'translateY(-2px)':'none',
        cursor:'default',
      }}>

      {/* Header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8}}>
        <div style={{flex:1,marginRight:8}}>
          <div style={{fontSize:13,fontWeight:700,color:text,lineHeight:1.3,marginBottom:4}}>{idea.title}</div>
          <div style={{display:'flex',alignItems:'center',gap:6}}>
            <span style={{fontSize:9,padding:'2px 6px',borderRadius:6,background:isDark?'rgba(136,136,255,0.12)':'rgba(80,60,200,0.08)',color:isDark?'#AAAAFF':'#7C6EFA',border:'1px solid '+(isDark?'rgba(136,136,255,0.2)':'rgba(80,60,200,0.15)'),fontWeight:600}}>
              {origin.icon} {origin.label}
            </span>
            {idea.target_length&&<span style={{fontSize:9,color:muted}}>~{idea.target_length}min</span>}
            {idea.priority>0&&<span style={{fontSize:9,color:'#FF9500'}}>{'★'.repeat(Math.min(idea.priority,3))}</span>}
          </div>
        </div>
        <button onClick={()=>onDelete(idea.id)} style={{background:'none',border:'none',cursor:'pointer',color:muted,fontSize:14,padding:'0 2px',lineHeight:1}}
          onMouseEnter={e=>e.currentTarget.style.color='#FF4040'}
          onMouseLeave={e=>e.currentTarget.style.color=muted}>✕</button>
      </div>

      {/* Description */}
      {idea.description&&(
        <div style={{fontSize:11,color:sub,lineHeight:1.5,marginBottom:10,display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
          {idea.description}
        </div>
      )}

      {/* AI Summary */}
      {idea.ai_summary&&(
        <div style={{fontSize:10,color:isDark?'rgba(170,170,255,0.7)':'rgba(80,60,200,0.7)',background:isDark?'rgba(136,136,255,0.06)':'rgba(80,60,200,0.04)',border:'1px solid '+(isDark?'rgba(136,136,255,0.15)':'rgba(80,60,200,0.1)'),borderRadius:8,padding:'6px 10px',marginBottom:10,lineHeight:1.4}}>
          🤖 {idea.ai_summary}
        </div>
      )}

      {/* Tags */}
      {tags.length>0&&(
        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:10}}>
          {tags.map(t=>(
            <span key={t} style={{fontSize:9,padding:'2px 7px',borderRadius:99,background:isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.05)',color:muted,border:'1px solid '+(isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)')}}>
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Sources */}
      {sources.length>0&&(
        <div style={{fontSize:9,color:muted,marginBottom:10}}>
          🔗 {sources.slice(0,2).map(s=>typeof s==='string'?s:s.name||s.url).join(' · ')}
          {sources.length>2&&` +${sources.length-2} more`}
        </div>
      )}

      {/* Actions */}
      {idea.status==='idea'&&(
        <>
          <div style={{paddingTop:8,borderTop:'1px solid '+rowBorder,marginBottom:6}}>
            <MediaPicker isDark={isDark} compact accept="any"
              label="Attach reference material"
              onFiles={files=>{try{window.forge.attachCreatorAssets(idea.id,'reference',files.map(f=>({name:f.name,path:f.path,type:f.type})));}catch(e){}}}/>
          </div>
          <div style={{display:'flex',gap:6}}>
            <button onClick={()=>onApprove(idea.id)} className="btn btn-success" style={{flex:1,fontSize:11,padding:'6px 10px'}}>
              ✓ Approve → Pipeline
            </button>
            <button onClick={()=>onEdit(idea)} className="btn btn-ghost" style={{fontSize:11,padding:'6px 10px'}}>
              ✏ Edit
            </button>
            <button onClick={()=>onReject(idea.id)} className="btn btn-danger" style={{fontSize:11,padding:'6px 8px'}}>
              ✕
            </button>
          </div>
        </>
      )}
      {idea.status==='approved'&&(
        <div style={{fontSize:10,color:'#00BB66',fontWeight:600,paddingTop:6,borderTop:'1px solid '+rowBorder}}>✓ Sent to pipeline</div>
      )}
      {idea.status==='rejected'&&(
        <div style={{fontSize:10,color:'#FF4040',fontWeight:600,paddingTop:6,borderTop:'1px solid '+rowBorder}}>✕ Rejected</div>
      )}
    </div>
  );
}

function AddIdeaModal({isDark,channelId,onSave,onClose}){
  const[form,setForm]=useState({title:'',description:'',target_length:'',tags:'',priority:0,sources:''});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const bg=isDark?'rgba(12,12,24,0.98)':'rgba(248,248,255,0.98)';
  const card=isDark?'rgba(255,255,255,0.04)':'#FFFFFF';
  const border=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.09)';
  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,20,0.38)';

  async function save(){
    if(!form.title.trim())return;
    const tags=form.tags.split(',').map(t=>t.trim()).filter(Boolean);
    const sources=form.sources.split('\n').map(s=>s.trim()).filter(Boolean).map(url=>({url,name:url}));
    await onSave({
      channel_id:channelId,title:form.title,description:form.description,
      target_length:form.target_length?parseInt(form.target_length):null,
      tags,sources,priority:form.priority,origin:'manual',
    });
    onClose();
  }

  return(
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000,backdropFilter:'blur(4px)'}}>
      <div style={{background:bg,border:'1px solid '+border,borderRadius:18,padding:28,width:480,maxHeight:'80vh',overflowY:'auto',boxShadow:'0 32px 80px rgba(0,0,0,0.6)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
          <div style={{fontSize:16,fontWeight:800,color:text}}>Add Idea</div>
          <button onClick={onClose} className="btn btn-ghost" style={{padding:'4px 10px',fontSize:13}}>✕</button>
        </div>
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div>
            <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:muted,display:'block',marginBottom:6}}>Title *</label>
            <input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. The Battle of Vimy Ridge"
              className={isDark?'input-dark':'input-light'}/>
          </div>
          <div>
            <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:muted,display:'block',marginBottom:6}}>Description</label>
            <textarea value={form.description} onChange={e=>set('description',e.target.value)}
              placeholder="What's the story about..." rows={3}
              className={isDark?'input-dark':'input-light'} style={{resize:'none'}}/>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div>
              <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:muted,display:'block',marginBottom:6}}>Target Length (min)</label>
              <input type="number" value={form.target_length} onChange={e=>set('target_length',e.target.value)}
                placeholder="20" className={isDark?'input-dark':'input-light'}/>
            </div>
            <div>
              <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:muted,display:'block',marginBottom:6}}>Priority (0-3)</label>
              <input type="number" min={0} max={3} value={form.priority} onChange={e=>set('priority',parseInt(e.target.value)||0)}
                className={isDark?'input-dark':'input-light'}/>
            </div>
          </div>
          <div>
            <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:muted,display:'block',marginBottom:6}}>Tags (comma separated)</label>
            <input value={form.tags} onChange={e=>set('tags',e.target.value)} placeholder="history, war, canada"
              className={isDark?'input-dark':'input-light'}/>
          </div>
          <div>
            <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:muted,display:'block',marginBottom:6}}>Sources / URLs (one per line)</label>
            <textarea value={form.sources} onChange={e=>set('sources',e.target.value)}
              placeholder="https://en.wikipedia.org/wiki/..." rows={2}
              className={isDark?'input-dark':'input-light'} style={{resize:'none'}}/>
          </div>
          <div style={{display:'flex',gap:10,marginTop:4}}>
            <button onClick={onClose} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{flex:1}}>Cancel</button>
            <button onClick={save} className="btn btn-primary" style={{flex:2}}>Add Idea</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IdeaBoard(){
  const{activeChannel,theme}=useApp();
  const[ideas,setIdeas]=useState([]);
  const[scanning,setScanning]=useState(false);
  const[showAdd,setShowAdd]=useState(false);
  const[editIdea,setEditIdea]=useState(null);
  const[filter,setFilter]=useState('all');
  const isDark=theme==='dark';

  const bg='transparent';
  const cardBg=isDark?'rgba(10,10,22,0.6)':'rgba(236,236,252,0.7)';
  const colBorder=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)';
  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,20,0.38)';
  const label=isDark?'rgba(255,255,255,0.28)':'rgba(0,0,20,0.38)';

  const load=useCallback(async()=>{
    if(!activeChannel)return;
    try{const d=await window.forge.getIdeas(activeChannel.id);setIdeas(d||[]);}catch(e){}
  },[activeChannel]);

  useEffect(()=>{load();},[load]);

  async function scan(){
    if(!activeChannel)return;
    setScanning(true);
    try{
      await window.forge.scanIdeas(activeChannel.id);
      // Poll for 5s then reload
      setTimeout(()=>{load();setScanning(false);},5000);
    }catch(e){setScanning(false);}
  }

  async function approve(id){await window.forge.approveIdea(id);load();}
  async function reject(id){await window.forge.rejectIdea(id);load();}
  async function del(id){await window.forge.deleteIdea(id);load();}
  async function addIdea(d){await window.forge.createIdea(d);load();}

  const cols=STATUS_COLS.map(col=>({
    ...col,
    ideas:ideas.filter(i=>i.status===col.id),
  }));

  const totalIdeas=ideas.filter(i=>i.status==='idea').length;
  const totalApproved=ideas.filter(i=>i.status==='approved').length;

  if(!activeChannel)return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.25)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>💡</div>
        <div style={{fontSize:16,fontWeight:700,color:text}}>Select a channel to manage ideas</div>
      </div>
    </div>
  );

  return(
    <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>

      {/* Toolbar */}
      <div style={{
        display:'flex',alignItems:'center',gap:12,padding:'12px 20px',flexShrink:0,
        background:isDark?'rgba(10,10,22,0.6)':'rgba(236,236,252,0.7)',
        borderBottom:'1px solid '+(isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.07)'),
      }}>
        <div style={{fontSize:15,fontWeight:800,color:text}}>Idea Board</div>
        <div style={{fontSize:11,color:muted}}>{totalIdeas} pending · {totalApproved} approved</div>
        <div style={{flex:1}}/>

        {/* Filter */}
        <div style={{display:'flex',gap:2,background:isDark?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.06)',borderRadius:9,padding:3}}>
          {['all','idea','approved','rejected'].map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              style={{
                fontSize:10,fontWeight:600,padding:'4px 10px',borderRadius:7,border:'none',cursor:'pointer',
                background:filter===f?(isDark?'rgba(255,255,255,0.12)':'rgba(255,255,255,0.9)'):'transparent',
                color:filter===f?text:muted,
                boxShadow:filter===f?(isDark?'0 2px 8px rgba(0,0,0,0.3)':'0 1px 4px rgba(0,0,0,0.1)'):'none',
                textTransform:'capitalize',
              }}>
              {f==='all'?'All':STATUS_COLS.find(c=>c.id===f)?.label||f}
            </button>
          ))}
        </div>

        <button onClick={scan} disabled={scanning}
          className="btn btn-ghost" style={{fontSize:11,opacity:scanning?0.6:1}}>
          {scanning?'⟳ Scanning…':'🤖 AI Scan'}
        </button>
        <button onClick={()=>setShowAdd(true)} className="btn btn-primary" style={{fontSize:11}}>
          + Add Idea
        </button>
      </div>

      {/* Kanban */}
      <div style={{flex:1,overflowX:'auto',overflowY:'hidden',display:'flex',gap:0}}>
        {cols.filter(col=>filter==='all'||filter===col.id).map((col,ci,arr)=>(
          <div key={col.id} style={{
            flex:1,minWidth:280,display:'flex',flexDirection:'column',
            borderRight:ci<arr.length-1?'1px solid '+colBorder:'none',
          }}>
            {/* Column header */}
            <div style={{
              padding:'12px 16px',flexShrink:0,
              borderBottom:'1px solid '+colBorder,
              borderTop:'3px solid '+col.color,
            }}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{fontSize:12,fontWeight:700,color:text}}>{col.label}</span>
                <span style={{
                  fontSize:10,fontWeight:700,padding:'1px 7px',borderRadius:99,
                  background:col.color+'20',color:col.color,border:'1px solid '+col.color+'35',
                }}>{col.ideas.length}</span>
              </div>
            </div>

            {/* Cards */}
            <div style={{flex:1,overflowY:'auto',padding:12}}>
              {col.ideas.length===0&&(
                <div style={{textAlign:'center',padding:'32px 16px',color:muted,fontSize:12}}>
                  {col.id==='idea'?'No ideas yet — hit AI Scan or add manually':
                   col.id==='approved'?'Approved ideas appear here':'No rejected ideas'}
                </div>
              )}
              {col.ideas.map(idea=>(
                <IdeaCard key={idea.id} idea={idea} isDark={isDark}
                  onApprove={approve} onReject={reject} onDelete={del}
                  onEdit={setEditIdea}/>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAdd&&(
        <AddIdeaModal isDark={isDark} channelId={activeChannel.id}
          onSave={addIdea} onClose={()=>setShowAdd(false)}/>
      )}
    </div>
  );
}
