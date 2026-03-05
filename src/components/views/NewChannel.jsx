import React,{useState}from 'react';
import{useApp}from '../../context/AppContext';

const PRESETS={
  short:{label:'Shorts',icon:'⚡',desc:'Under 60 seconds',color:'#C8FF00'},
  mid:{label:'Mid-Form',icon:'📰',desc:'5 – 20 minutes',color:'#00C8FF'},
  long:{label:'Long-Form',icon:'🎬',desc:'20 min – 3 hours',color:'#FF4F00'},
};

export default function NewChannel(){
  const{loadChannels,setActiveView,mode,theme}=useApp();
  const[form,setForm]=useState({name:'',preset:'long',style_prompt:'',auto_approve:false});
  const[saving,setSaving]=useState(false);
  const[error,setError]=useState('');
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const isDark=theme==='dark';
  const bg=isDark?'#08080F':'#F2F2FC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.9)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)';
  const cardShadow=isDark?'0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06)':'0 2px 12px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,1)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.4)';

  async function save(){
    if(!form.name.trim()){setError('Channel name is required');return;}
    setSaving(true);
    try{await window.forge.createChannel(form);await loadChannels();setActiveView('dashboard');}
    catch(e){setError(e.message);}
    finally{setSaving(false);}
  }

  return(
    <div className="flex-1 overflow-y-auto p-8" style={{background:bg}}>
      <div className="max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={()=>setActiveView('dashboard')} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'6px 10px'}}>← Back</button>
          <div>
            <h2 className="text-xl font-black" style={{color:text}}>Create Channel</h2>
            <p className="text-[11px]" style={{color:muted}}>Each channel links to a separate YouTube account</p>
          </div>
        </div>

        {error&&(
          <div className="mb-4 px-4 py-3 text-sm rounded-xl" style={{background:'rgba(255,23,68,0.08)',border:'1px solid rgba(255,23,68,0.2)',color:'#FF1744'}}>
            {error}
          </div>
        )}

        {/* Name */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:16}}>
          <label className="text-[9px] font-bold tracking-[3px] uppercase block mb-2" style={{color:muted}}>Channel Name</label>
          <input value={form.name} onChange={e=>set('name',e.target.value)}
            placeholder="e.g. Due North News"
            className={isDark?'input-dark':'input-light'} style={{width:'100%'}}/>
        </div>

        {/* Preset */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:16}}>
          <label className="text-[9px] font-bold tracking-[3px] uppercase block mb-3" style={{color:muted}}>Content Format</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(PRESETS).map(([key,p])=>{
              const isSelected=form.preset===key;
              return(
                <div key={key} onClick={()=>set('preset',key)}
                  className="p-4 text-center cursor-pointer transition-all rounded-xl"
                  style={{
                    background:isSelected?p.color+'12':'transparent',
                    border:'1px solid '+(isSelected?p.color+'40':cardBorder),
                    boxShadow:isSelected?'0 0 16px '+p.color+'20':'none',
                  }}>
                  <div className="text-2xl mb-2">{p.icon}</div>
                  <div className="font-bold text-sm mb-0.5" style={{color:isSelected?p.color:text}}>{p.label}</div>
                  <div className="text-[10px]" style={{color:muted}}>{p.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Style prompt (advanced) */}
        {mode==='advanced'&&(
          <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px 24px',marginBottom:16}}>
            <label className="text-[9px] font-bold tracking-[3px] uppercase block mb-2" style={{color:muted}}>Style Prompt</label>
            <textarea value={form.style_prompt} onChange={e=>set('style_prompt',e.target.value)}
              placeholder="Describe tone, style, target audience..."
              rows={3} className={isDark?'input-dark':'input-light'} style={{width:'100%',resize:'none'}}/>
          </div>
        )}

        {/* Auto-approve */}
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'16px 24px',marginBottom:24}}>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm mb-0.5" style={{color:text}}>Auto-approve videos</div>
              <div className="text-[11px]" style={{color:muted}}>Skip manual review — you lose creative control</div>
            </div>
            <div onClick={()=>set('auto_approve',!form.auto_approve)}
              className="toggle"
              style={{background:form.auto_approve?'rgba(200,255,0,0.15)':'rgba(255,255,255,0.06)',border:'1px solid '+(form.auto_approve?'rgba(200,255,0,0.3)':'rgba(255,255,255,0.1)')}}>
              <div className="toggle-thumb"
                style={{left:form.auto_approve?20:3,background:form.auto_approve?'#C8FF00':'rgba(255,255,255,0.3)'}}/>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={()=>setActiveView('dashboard')} className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'10px 20px'}}>Cancel</button>
          <button onClick={save} disabled={saving} className="btn btn-primary" style={{flex:1,padding:'10px 20px',opacity:saving?0.6:1}}>
            {saving?'Creating…':'Create Channel →'}
          </button>
        </div>
      </div>
    </div>
  );
}
