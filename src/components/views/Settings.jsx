import React,{useState,useEffect}from 'react';
import{useApp}from '../../context/AppContext';

const FIELDS=[
  {key:'claude',label:'Claude',co:'Anthropic',placeholder:'sk-ant-...',link:'https://console.anthropic.com',desc:'Scripts, SEO, analytics',icon:'🧠'},
  {key:'gemini',label:'Gemini',co:'Google',placeholder:'AIza...',link:'https://aistudio.google.com/app/apikey',desc:'Ingest, assets, validation',icon:'✨'},
  {key:'openai',label:'OpenAI',co:'Optional fallback',placeholder:'sk-...',link:'https://platform.openai.com/api-keys',desc:'Backup model',icon:'⚡'},
  {key:'pexels',label:'Pexels',co:'Stock media',placeholder:'paste key...',link:'https://www.pexels.com/api/',desc:'Free images & video',icon:'📷'},
  {key:'pixabay',label:'Pixabay',co:'Optional',placeholder:'paste key...',link:'https://pixabay.com/api/docs/',desc:'Additional free assets',icon:'🖼'},
  {key:'youtube',label:'YouTube Data API',co:'Google Cloud',placeholder:'AIza...',link:'https://console.cloud.google.com',desc:'Upload & analytics — OAuth per channel',icon:'▶️'},
];

export default function Settings(){
  const{theme}=useApp();
  const isDark=theme==='dark';
  const[keys,setKeys]=useState({});
  const[budget,setBudget]=useState({daily:5,weekly:20,monthly:80});
  const[saved,setSaved]=useState(false);
  const[show,setShow]=useState({});

  useEffect(()=>{window.forge.getSettings().then(s=>{setKeys(s.apiKeys||{});if(s.budget)setBudget(s.budget);}).catch(()=>{});},[ ]);

  async function save(){
    await window.forge.updateSettings({apiKeys:keys,budget});
    setSaved(true);setTimeout(()=>setSaved(false),2000);
  }

  const bg=isDark?'#08080F':'#F2F2FC';
  const card=isDark?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.9)';
  const cardBorder=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.06)';
  const cardShadow=isDark?'0 4px 24px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.06)':'0 2px 12px rgba(0,0,0,0.06),inset 0 1px 0 rgba(255,255,255,1)';
  const rowBorder=isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.05)';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.3)':'rgba(0,0,0,0.4)';

  return(
    <div className="flex-1 overflow-y-auto p-8" style={{background:bg}}>
      <div className="max-w-2xl mx-auto">
        <h2 className="text-xl font-black mb-1" style={{color:text}}>Settings</h2>
        <p className="text-[11px] mb-8" style={{color:muted}}>API keys are stored locally on your machine and never sent to any server.</p>

        {/* API Keys */}
        <div className="text-[9px] font-bold tracking-[3px] uppercase mb-3" style={{color:muted}}>AI & API Keys</div>
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,overflow:'hidden',marginBottom:24}}>
          {FIELDS.map((f,i)=>(
            <div key={f.key} style={{borderBottom:i<FIELDS.length-1?'1px solid '+rowBorder:'none',padding:'16px 20px'}}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{f.icon}</span>
                  <div>
                    <div className="font-semibold text-sm" style={{color:text}}>{f.label}</div>
                    <div className="text-[10px]" style={{color:muted}}>{f.co} · {f.desc}</div>
                  </div>
                </div>
                <a href={f.link} target="_blank" rel="noreferrer"
                  className="btn" style={{background:'rgba(200,255,0,0.06)',color:'#C8FF00',border:'1px solid rgba(200,255,0,0.2)',padding:'4px 10px',fontSize:10,textDecoration:'none'}}>
                  Get Key ↗
                </a>
              </div>
              <div className="flex gap-2">
                <input
                  type={show[f.key]?'text':'password'}
                  value={keys[f.key]||''}
                  onChange={e=>setKeys(k=>({...k,[f.key]:e.target.value}))}
                  placeholder={f.placeholder}
                  className={isDark?'input-dark':'input-light'}
                  style={{flex:1,fontFamily:'JetBrains Mono, monospace',fontSize:12}}/>
                <button onClick={()=>setShow(s=>({...s,[f.key]:!s[f.key]}))}
                  className={isDark?'btn btn-ghost':'btn btn-ghost-light'} style={{padding:'8px 12px',fontSize:12}}>
                  {show[f.key]?'Hide':'Show'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Budget */}
        <div className="text-[9px] font-bold tracking-[3px] uppercase mb-3" style={{color:muted}}>Spend Limits</div>
        <div style={{background:card,border:'1px solid '+cardBorder,borderRadius:16,boxShadow:cardShadow,padding:'20px',marginBottom:24}}>
          <div className="grid grid-cols-3 gap-4">
            {[{label:'Daily',key:'daily'},{label:'Weekly',key:'weekly'},{label:'Monthly',key:'monthly'}].map(b=>(
              <div key={b.key}>
                <div className="text-[9px] font-bold tracking-widest uppercase mb-2" style={{color:muted}}>{b.label}</div>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-semibold" style={{color:muted}}>$</span>
                  <input type="number" value={budget[b.key]}
                    onChange={e=>setBudget(bv=>({...bv,[b.key]:parseFloat(e.target.value)||0}))}
                    className={isDark?'input-dark':'input-light'} style={{width:'100%',fontFamily:'JetBrains Mono, monospace'}}/>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="flex items-center gap-3">
          <button onClick={save} className="btn btn-primary" style={{padding:'10px 24px'}}>Save Settings</button>
          {saved&&<span className="text-sm font-semibold" style={{color:'#00E676'}}>✓ Saved</span>}
        </div>
      </div>
    </div>
  );
}
