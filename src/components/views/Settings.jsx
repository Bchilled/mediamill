import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';
const FIELDS=[
  {key:'claude',label:'Claude (Anthropic)',placeholder:'sk-ant-...',link:'https://console.anthropic.com',desc:'Script writing, SEO, analytics'},
  {key:'gemini',label:'Google Gemini',placeholder:'AIza...',link:'https://aistudio.google.com/app/apikey',desc:'Ingest, assets, validation'},
  {key:'openai',label:'OpenAI (optional)',placeholder:'sk-...',link:'https://platform.openai.com/api-keys',desc:'Fallback model'},
  {key:'pexels',label:'Pexels',placeholder:'...',link:'https://www.pexels.com/api/',desc:'Free stock images and video'},
  {key:'pixabay',label:'Pixabay (optional)',placeholder:'...',link:'https://pixabay.com/api/docs/',desc:'Additional free assets'},
  {key:'youtube',label:'YouTube Data API',placeholder:'AIza...',link:'https://console.cloud.google.com',desc:'Upload and analytics — per-channel OAuth configured in channel settings'},
];
export default function Settings(){
  const{theme}=useApp();
  const isDark=theme==='dark';
  const[keys,setKeys]=useState({});
  const[saved,setSaved]=useState(false);
  useEffect(()=>{window.forge.getSettings().then(s=>setKeys(s.apiKeys||{})).catch(()=>{});},[]);
  async function save(){await window.forge.updateSettings({apiKeys:keys});setSaved(true);setTimeout(()=>setSaved(false),2000);}
  const bg=isDark?'#080810':'#F8F8FF';
  const card=isDark?'#12121F':'#FFFFFF';
  const border=isDark?'#1A1A2A':'#E0E0EE';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'#6B6888':'#888899';
  const inp=isDark?'#0E0E1A':'#F0F0F8';
  return(<div className='flex-1 overflow-y-auto p-8' style={{background:bg}}>
    <h2 className='text-2xl font-black mb-1' style={{color:text}}>Settings</h2>
    <p className='text-xs mb-8' style={{color:muted}}>Configure AI services to power MediaMill. Keys are stored locally on your machine.</p>
    <div className='text-[9px] font-bold tracking-[3px] uppercase mb-4' style={{color:muted}}>AI and API Keys</div>
    <div className='space-y-3 mb-8'>
      {FIELDS.map(f=>(
        <div key={f.key} className='p-4' style={{background:card,border:'1px solid '+border}}>
          <div className='flex items-start justify-between mb-2'>
            <div>
              <div className='font-bold text-sm' style={{color:text}}>{f.label}</div>
              <div className='text-[10px]' style={{color:muted}}>{f.desc}</div>
            </div>
            <a href={f.link} target='_blank' rel='noreferrer'
              className='text-[10px] font-bold px-2 py-1 border'
              style={{color:'#C8FF00',borderColor:'rgba(200,255,0,0.3)',background:'rgba(200,255,0,0.06)'}}>
              Get Key
            </a>
          </div>
          <input type='password' value={keys[f.key]||''} onChange={e=>setKeys(k=>({...k,[f.key]:e.target.value}))}
            placeholder={f.placeholder} className='w-full px-3 py-2 text-xs outline-none font-mono'
            style={{background:inp,border:'1px solid '+border,color:text}}/>
        </div>
      ))}
    </div>
    <div className='flex items-center gap-3'>
      <button onClick={save} className='px-6 py-2.5 text-xs font-bold bg-[#C8FF00] text-black'>Save Keys</button>
      {saved&&<span className='text-xs font-bold' style={{color:'#00E676'}}>Saved.</span>}
    </div>
    <div className='mt-10 pt-6' style={{borderTop:'1px solid '+border}}>
      <div className='text-[9px] font-bold tracking-[3px] uppercase mb-4' style={{color:muted}}>Budget Limits</div>
      <div className='grid grid-cols-3 gap-3'>
        {[{label:'Daily',def:5},{label:'Weekly',def:20},{label:'Monthly',def:80}].map(b=>(
          <div key={b.label} className='p-4' style={{background:card,border:'1px solid '+border}}>
            <div className='text-[9px] font-bold tracking-widest uppercase mb-2' style={{color:muted}}>{b.label}</div>
            <div className='flex items-center gap-1'>
              <span className='text-sm' style={{color:muted}}>$</span>
              <input type='number' defaultValue={b.def} className='w-full px-2 py-1 text-sm outline-none font-mono'
                style={{background:inp,border:'1px solid '+border,color:text}}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>);
}