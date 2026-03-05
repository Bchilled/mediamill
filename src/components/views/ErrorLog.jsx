import React,{useState,useEffect}from 'react';
import{subscribeErrors,resolveError,clearErrors}from '../../utils/errorTracker';

export default function ErrorLog({isDark}){
  const[errors,setErrors]=useState([]);
  const[filter,setFilter]=useState('all');// all|unresolved|react|ipc|console|promise
  const[expanded,setExpanded]=useState(null);

  useEffect(()=>subscribeErrors(setErrors),[]);

  const text=isDark?'#F0EFFF':'#0C0C0E';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const sub=isDark?'rgba(255,255,255,0.2)':'rgba(0,0,20,0.25)';
  const border=isDark?'rgba(255,255,255,0.08)':'rgba(0,0,0,0.07)';
  const bg=isDark?'rgba(255,255,255,0.03)':'rgba(0,0,0,0.02)';

  const sources=[...new Set(errors.map(e=>e.source.split(':')[0]))];
  const tabs=['all','unresolved',...sources];

  const filtered=errors.filter(e=>{
    if(filter==='unresolved')return!e.resolved;
    if(filter==='all')return true;
    return e.source.startsWith(filter);
  });

  const unresolved=errors.filter(e=>!e.resolved).length;

  function fmt(iso){
    const d=new Date(iso);
    return d.toLocaleTimeString()+' '+d.toLocaleDateString();
  }

  function sourceColor(src){
    if(src.startsWith('react'))return'#FF8040';
    if(src.startsWith('ipc'))return'#FF4040';
    if(src.startsWith('promise'))return'#FF9500';
    if(src.startsWith('console'))return'#00C8FF';
    return'#888';
  }

  async function exportLog(){
    const text=errors.map(e=>`[${e.timestamp}] [${e.source}] ${e.message}\n${e.detail}\n${e.stack}`).join('\n---\n');
    try{await window.forge.saveErrorLog(text);}catch(err){
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard (could not save file)');
    }
  }

  return(
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16,flexWrap:'wrap',gap:8}}>
        <div>
          <h3 style={{fontSize:16,fontWeight:800,color:text,marginBottom:3}}>🐛 Error Log</h3>
          <div style={{fontSize:11,color:muted}}>
            {errors.length} total · {unresolved} unresolved
          </div>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={exportLog}
            style={{fontSize:11,padding:'6px 13px',borderRadius:8,cursor:'pointer',
              background:bg,border:'1px solid '+border,color:muted}}>
            ↓ Export
          </button>
          <button onClick={clearErrors}
            style={{fontSize:11,padding:'6px 13px',borderRadius:8,cursor:'pointer',
              background:'rgba(255,64,64,0.07)',border:'1px solid rgba(255,64,64,0.2)',color:'#FF4040'}}>
            🗑 Clear All
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:14}}>
        {tabs.map(t=>{
          const active=filter===t;
          const count=t==='all'?errors.length:t==='unresolved'?unresolved:errors.filter(e=>e.source.startsWith(t)).length;
          return(
            <button key={t} onClick={()=>setFilter(t)}
              style={{fontSize:11,padding:'4px 10px',borderRadius:7,cursor:'pointer',textTransform:'capitalize',
                background:active?(isDark?'rgba(124,110,250,0.1)':'rgba(68,0,204,0.07)'):'transparent',
                border:'1px solid '+(active?(isDark?'rgba(124,110,250,0.3)':'rgba(68,0,204,0.3)'):border),
                color:active?('#7C6EFA'):muted}}>
              {t}{count>0&&<span style={{marginLeft:4,fontSize:9}}>{count}</span>}
            </button>
          );
        })}
      </div>

      {/* Error list */}
      {filtered.length===0?(
        <div style={{textAlign:'center',padding:'32px',color:muted,fontSize:13}}>
          {errors.length===0?'✅ No errors yet':'✅ No errors in this category'}
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          {filtered.map(e=>(
            <div key={e.id}
              style={{background:e.resolved?bg:'rgba(255,64,64,0.04)',
                border:'1px solid '+(e.resolved?border:'rgba(255,64,64,0.15)'),
                borderRadius:10,overflow:'hidden',opacity:e.resolved?0.6:1}}>
              {/* Header row */}
              <div onClick={()=>setExpanded(expanded===e.id?null:e.id)}
                style={{display:'flex',gap:10,alignItems:'flex-start',padding:'10px 12px',cursor:'pointer'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:e.resolved?'#30C85E':sourceColor(e.source),flexShrink:0,marginTop:4}}/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:3,flexWrap:'wrap'}}>
                    <span style={{fontSize:10,fontWeight:700,color:sourceColor(e.source),background:sourceColor(e.source)+'15',padding:'1px 7px',borderRadius:99,flexShrink:0}}>
                      {e.source}
                    </span>
                    <span style={{fontSize:9,color:sub,fontFamily:'monospace',flexShrink:0}}>{fmt(e.timestamp)}</span>
                    {e.resolved&&<span style={{fontSize:9,color:'#30C85E',fontWeight:700}}>✓ resolved</span>}
                  </div>
                  <div style={{fontSize:12,fontWeight:600,color:text,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                    {e.message}
                  </div>
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0,alignItems:'center'}}>
                  {!e.resolved&&(
                    <button onClick={ev=>{ev.stopPropagation();resolveError(e.id);}}
                      style={{fontSize:9,padding:'3px 8px',borderRadius:6,cursor:'pointer',
                        background:'rgba(48,200,94,0.08)',border:'1px solid rgba(48,200,94,0.2)',color:'#30C85E'}}>
                      ✓ Mark resolved
                    </button>
                  )}
                  <span style={{fontSize:10,color:sub}}>{expanded===e.id?'▲':'▼'}</span>
                </div>
              </div>

              {/* Expanded detail */}
              {expanded===e.id&&(
                <div style={{padding:'0 12px 12px',borderTop:'1px solid '+border}}>
                  {e.detail&&(
                    <div style={{marginTop:10}}>
                      <div style={{fontSize:9,fontWeight:700,color:sub,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Detail</div>
                      <pre style={{fontSize:10,color:muted,background:isDark?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.05)',padding:'8px 10px',borderRadius:7,overflow:'auto',maxHeight:120,margin:0,lineHeight:1.4}}>
                        {e.detail}
                      </pre>
                    </div>
                  )}
                  {e.stack&&(
                    <div style={{marginTop:8}}>
                      <div style={{fontSize:9,fontWeight:700,color:sub,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:4}}>Stack Trace</div>
                      <pre style={{fontSize:9,color:sub,background:isDark?'rgba(0,0,0,0.3)':'rgba(0,0,0,0.05)',padding:'8px 10px',borderRadius:7,overflow:'auto',maxHeight:160,margin:0,lineHeight:1.4,fontFamily:'monospace'}}>
                        {e.stack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
