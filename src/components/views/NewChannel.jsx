import React,{useState}from 'react';
import{useApp}from '../../context/AppContext';

const PRESETS={
  short:{label:'Shorts',icon:'⚡',desc:'Under 60 seconds',color:'#C8FF00'},
  mid:{label:'Mid-Form',icon:'📰',desc:'5 – 20 minutes',color:'#00C8FF'},
  long:{label:'Long-Form',icon:'🎬',desc:'20 min – 3 hours',color:'#FF8040'},
};

const TOPIC_EXAMPLES=[
  'Canadian WWII history and veterans',
  'Canadian political scandals and corruption',
  'Indigenous Canadian history and culture',
  'True crime stories from Canada',
  'Canadian economic news and analysis',
  'Untold stories from Canadian history',
];

export default function NewChannel(){
  const{loadChannels,setActiveView,mode,theme}=useApp();
  const[form,setForm]=useState({name:'',preset:'long',topic:'',style_prompt:'',voice_engine:'elevenlabs',auto_approve:false});
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const isDark=theme==='dark';

  const bg='transparent';
  const card=isDark?'linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))':'linear-gradient(145deg,#FFFFFF,#F8F8FF)';
  const cardBorder=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)';
  const cardShadow=isDark?'0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.08)':'0 4px 20px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,1)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,20,0.38)';
  const label=isDark?'rgba(255,255,255,0.28)':'rgba(0,0,20,0.38)';

  async function save(){
    if(!form.name.trim()){setError('Channel name is required');return;}
    if(!form.topic.trim()){setError('Channel topic is required — the AI needs this to find relevant content');return;}
    setSaving(true);
    try{
      await window.forge.createChannel({...form,style_prompt:form.style_prompt||form.topic});
      await loadChannels();
      setActiveView('dashboard');
    }catch(e){setError(e.message);}
    finally{setSaving(false);}
  }

  return(
    <div style={{flex:1,overflowY:'auto',padding:32,background:bg}}>
      <div style={{maxWidth:560,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
          <button onClick={()=>setActiveView('dashboard')} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'6px 12px'}}>← Back</button>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:text}}>Create Channel</h2>
            <p style={{fontSize:11,color:muted}}>Each channel is a separate YouTube presence with its own topic focus</p>
          </div>
        </div>

        {error&&<div style={{marginBottom:16,padding:'12px 16px',borderRadius:10,background:'rgba(238,34,68,0.08)',border:'1px solid rgba(238,34,68,0.2)',color:'#EE2244',fontSize:13}}>{error}</div>}

        {/* Name */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:14}}>
          <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:label,display:'block',marginBottom:8}}>Channel Name</label>
          <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Due North News"
            className={isDark?'input-dark':'input-light'}/>
        </div>

        {/* Topic — the key field */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:14}}>
          <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:label,display:'block',marginBottom:4}}>Channel Topic *</label>
          <p style={{fontSize:11,color:muted,marginBottom:10}}>The AI uses this to hyper-focus its content search. Be specific.</p>
          <textarea value={form.topic} onChange={e=>set('topic',e.target.value)}
            placeholder="e.g. Unbiased Canadian political news and analysis, focusing on federal politics, policy, and accountability"
            rows={3} className={isDark?'input-dark':'input-light'} style={{resize:'none',marginBottom:10}}/>
          <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
            {TOPIC_EXAMPLES.map(ex=>(
              <button key={ex} onClick={()=>set('topic',ex)}
                style={{fontSize:10,padding:'4px 10px',borderRadius:8,border:'1px solid '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'),background:'transparent',color:muted,cursor:'pointer'}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=isDark?'#C8FF00':'#4400CC';e.currentTarget.style.color=isDark?'#C8FF00':'#4400CC';}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)';e.currentTarget.style.color=muted;}}>
                {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Preset */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:14}}>
          <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:label,display:'block',marginBottom:12}}>Content Format</label>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {Object.entries(PRESETS).map(([key,p])=>{
              const isSelected=form.preset===key;
              return(
                <div key={key} onClick={()=>set('preset',key)} style={{
                  padding:'14px 12px',textAlign:'center',cursor:'pointer',borderRadius:12,
                  background:isSelected?p.color+'12':'transparent',
                  border:'1px solid '+(isSelected?p.color+'40':cardBorder),
                  boxShadow:isSelected?'0 0 16px '+p.color+'20':'none',
                  transition:'all 0.12s ease',
                }}>
                  <div style={{fontSize:22,marginBottom:6}}>{p.icon}</div>
                  <div style={{fontWeight:700,fontSize:12,marginBottom:2,color:isSelected?p.color:text}}>{p.label}</div>
                  <div style={{fontSize:10,color:muted}}>{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Voice engine */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:14}}>
          <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:label,display:'block',marginBottom:8}}>Voice Engine</label>
          <select value={form.voice_engine} onChange={e=>set('voice_engine',e.target.value)}
            className={isDark?'input-dark':'input-light'}>
            <option value="elevenlabs">ElevenLabs</option>
            <option value="playht">Play.ht</option>
            <option value="coqui">Coqui (free/local)</option>
            <option value="windows">Windows TTS (free)</option>
            <option value="voicecreator">Voice Creator Pro</option>
            <option value="auto">Auto (AI assigns by cost)</option>
          </select>
        </div>

        {/* Advanced: style prompt */}
        {mode==='advanced'&&(
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:14}}>
            <label style={{fontSize:9,fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:label,display:'block',marginBottom:4}}>Style Prompt (Advanced)</label>
            <p style={{fontSize:11,color:muted,marginBottom:8}}>Fine-tune tone, format, and personality beyond the topic.</p>
            <textarea value={form.style_prompt} onChange={e=>set('style_prompt',e.target.value)}
              placeholder="Write in a calm, authoritative documentary tone. No sensationalism. Always cite sources." rows={3}
              className={isDark?'input-dark':'input-light'} style={{resize:'none'}}/>
          </div>
        )}

        {/* Auto-approve */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'16px 24px',marginBottom:24}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <div style={{fontWeight:600,fontSize:13,color:text,marginBottom:2}}>Auto-approve videos</div>
              <div style={{fontSize:11,color:muted}}>Skip manual review — pipeline runs fully autonomous</div>
            </div>
            <div onClick={()=>set('auto_approve',!form.auto_approve)} className="toggle"
              style={{background:form.auto_approve?'rgba(200,255,0,0.15)':'rgba(255,255,255,0.06)',border:'1px solid '+(form.auto_approve?'rgba(200,255,0,0.3)':'rgba(255,255,255,0.1)')}}>
              <div className="toggle-thumb" style={{left:form.auto_approve?20:3,background:form.auto_approve?'#C8FF00':'rgba(255,255,255,0.3)'}}/>
            </div>
          </div>
        </div>

        <div style={{display:'flex',gap:10}}>
          <button onClick={()=>setActiveView('dashboard')} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'10px 20px'}}>Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary" style={{flex:1,padding:'10px 20px',opacity:saving?0.6:1}}>
            {saving?'Creating…':'Create Channel →'}
          </button>
        </div>
      </div>
    </div>
  );
}
