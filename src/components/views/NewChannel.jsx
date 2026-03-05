import React,{useState}from 'react';import{useApp}from '../../context/AppContext';
const PRESETS={short:{label:'Shorts',icon:'⚡',desc:'Under 60s',color:'#C8FF00'},mid:{label:'Mid-Form',icon:'📰',desc:'5–20 min',color:'#00C8FF'},long:{label:'Long-Form',icon:'🎬',desc:'20min–3hr',color:'#FF4F00'}};
export default function NewChannel(){
  const{loadChannels,setActiveView,mode}=useApp();
  const[form,setForm]=useState({name:'',preset:'long',style_prompt:'',auto_approve:false});
  const[saving,setSaving]=useState(false);const[error,setError]=useState('');
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  async function save(){
    if(!form.name.trim()){setError('Name required');return;}
    setSaving(true);try{await window.forge.createChannel(form);await loadChannels();setActiveView('dashboard');}catch(e){setError(e.message);}finally{setSaving(false);}
  }
  return(<div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full">
    <h2 className="text-2xl font-black mb-1">Create Channel</h2>
    <p className="text-xs text-[#6B6888] mb-8">Each channel is a separate YouTube presence.</p>
    {error&&<div className="p-3 mb-4 text-xs text-[#FF1744] border border-[rgba(255,23,68,0.3)]">{error}</div>}
    <div className="mb-6"><label className="text-[9px] font-bold tracking-widest uppercase text-[#6B6888] block mb-2">Channel Name</label>
      <input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. True North Daily" className="w-full px-3 py-2.5 text-sm outline-none text-[#E8E6FF] placeholder-[#2E2E48]" style={{background:'#12121F',border:'1px solid #252538'}}/>
    </div>
    <div className="mb-6"><label className="text-[9px] font-bold tracking-widest uppercase text-[#6B6888] block mb-2">Preset</label>
      <div className="grid grid-cols-3 gap-3">{Object.entries(PRESETS).map(([key,p])=>(
        <div key={key} onClick={()=>set('preset',key)} className="p-4 cursor-pointer text-center transition-all" style={{background:form.preset===key?'rgba(200,255,0,0.04)':'#12121F',border:form.preset===key?`1px solid ${p.color}`:'1px solid #1A1A2A'}}>
          <div className="text-2xl mb-2">{p.icon}</div>
          <div className="font-bold text-sm mb-1" style={{color:form.preset===key?p.color:'#E8E6FF'}}>{p.label}</div>
          <div className="text-[10px] text-[#6B6888]">{p.desc}</div>
        </div>
      ))}</div>
    </div>
    {mode==='advanced'&&<div className="mb-6"><label className="text-[9px] font-bold tracking-widest uppercase text-[#6B6888] block mb-2">Style Prompt</label>
      <textarea value={form.style_prompt} onChange={e=>set('style_prompt',e.target.value)} placeholder="Describe the tone and style…" rows={3} className="w-full px-3 py-2.5 text-sm outline-none text-[#E8E6FF] placeholder-[#2E2E48] resize-none" style={{background:'#12121F',border:'1px solid #252538'}}/>
    </div>}
    <div className="mb-8 flex items-center justify-between p-4" style={{background:'#12121F',border:'1px solid #1A1A2A'}}>
      <div><div className="font-bold text-sm mb-0.5">Auto-approve videos</div><div className="text-[10px] text-[#6B6888]">Skip review. You lose creative control.</div></div>
      <div onClick={()=>set('auto_approve',!form.auto_approve)} className="w-10 h-6 rounded-full cursor-pointer relative transition-all flex-shrink-0"
        style={{background:form.auto_approve?'rgba(200,255,0,0.2)':'#1E1E30',border:form.auto_approve?'1px solid #C8FF00':'1px solid #252538'}}>
        <div className="absolute top-1 w-4 h-4 rounded-full transition-all" style={{left:form.auto_approve?'20px':'3px',background:form.auto_approve?'#C8FF00':'#2E2E48'}}/>
      </div>
    </div>
    <div className="flex gap-3">
      <button onClick={()=>setActiveView('dashboard')} className="px-4 py-2.5 text-xs font-bold border border-[#252538] text-[#6B6888]">Cancel</button>
      <button onClick={save} disabled={saving} className="flex-1 py-2.5 text-xs font-bold bg-[#C8FF00] text-black disabled:opacity-50">{saving?'Creating…':'Create Channel →'}</button>
    </div>
  </div>);
}