import React from 'react';
import{useApp}from '../../context/AppContext';

// Main tabs — clean and purposeful
const TABS=[
  {id:'dashboard',label:'Dashboard',icon:'📺'},
  {id:'pipeline',label:'Pipeline',icon:'🎬'},
  {id:'channels',label:'Channels',icon:'📡'},
  // Advanced only
  {id:'agents',label:'Agents',icon:'🤖',advanced:true},
  {id:'tasks',label:'Tasks',icon:'📋',advanced:true},
  {id:'prompts',label:'Prompts',icon:'📝',advanced:true},
];

// Pipeline sub-tabs
const PIPELINE_TABS=[
  {id:'pipeline:ideas',label:'Ideas',icon:'💡'},
  {id:'pipeline:scripts',label:'Scripts',icon:'📄'},
  {id:'pipeline:assets',label:'Assets',icon:'🖼'},
  {id:'pipeline:voice',label:'Voice',icon:'🎙'},
  {id:'pipeline:compose',label:'Compose',icon:'🎞'},
  {id:'pipeline:review',label:'Review',icon:'👁'},
  {id:'pipeline:publish',label:'Publish',icon:'🚀'},
  {id:'pipeline:analytics',label:'Analytics',icon:'📊'},
];

export default function TabBar(){
  const{activeView,setActiveView,mode,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'rgba(10,10,22,0.7)':'rgba(240,240,255,0.8)';
  const border=isDark?'rgba(255,255,255,0.07)':'rgba(0,0,0,0.08)';
  const activeColor=isDark?'#C8FF00':'#4400CC';
  const inactiveColor=isDark?'rgba(255,255,255,0.45)':'rgba(0,0,20,0.5)';
  const tabs=TABS.filter(t=>!t.advanced||mode==='advanced');
  const isPipeline=activeView.startsWith('pipeline');
  const mainActive=isPipeline?'pipeline':activeView;

  return(
    <div style={{flexShrink:0}}>
      {/* Main tabs */}
      <div style={{display:'flex',overflowX:'auto',background:bg,borderBottom:'1px solid '+border}}>
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>setActiveView(t.id==='pipeline'?'pipeline:ideas':t.id)}
            className="tab-item"
            style={{
              color:mainActive===t.id?activeColor:inactiveColor,
              borderBottom:'2px solid '+(mainActive===t.id?activeColor:'transparent'),
              fontWeight:mainActive===t.id?700:500,
            }}
            onMouseEnter={e=>{if(mainActive!==t.id)e.currentTarget.style.color=isDark?'rgba(255,255,255,0.8)':'rgba(0,0,20,0.8)';}}
            onMouseLeave={e=>{if(mainActive!==t.id)e.currentTarget.style.color=inactiveColor;}}>
            <span>{t.icon}</span><span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Pipeline sub-tabs — only when in pipeline */}
      {isPipeline&&(
        <div style={{display:'flex',overflowX:'auto',background:isDark?'rgba(6,6,16,0.6)':'rgba(232,232,248,0.7)',borderBottom:'1px solid '+(isDark?'rgba(255,255,255,0.05)':'rgba(0,0,0,0.06)')}}>
          {PIPELINE_TABS.map((t,i)=>{
            const isActive=activeView===t.id;
            return(
              <button key={t.id} onClick={()=>setActiveView(t.id)}
                style={{
                  display:'flex',alignItems:'center',gap:5,
                  padding:'7px 14px',fontSize:11,fontWeight:isActive?600:400,
                  cursor:'pointer',border:'none',background:'transparent',
                  color:isActive?activeColor:isDark?'rgba(255,255,255,0.35)':'rgba(0,0,20,0.4)',
                  borderBottom:'2px solid '+(isActive?activeColor:'transparent'),
                  whiteSpace:'nowrap',transition:'all 0.1s',
                  borderRight:'1px solid '+(isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.05)'),
                }}
                onMouseEnter={e=>{if(!isActive)e.currentTarget.style.color=isDark?'rgba(255,255,255,0.65)':'rgba(0,0,20,0.7)';}}
                onMouseLeave={e=>{if(!isActive)e.currentTarget.style.color=isDark?'rgba(255,255,255,0.35)':'rgba(0,0,20,0.4)';}}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
                {i<PIPELINE_TABS.length-1&&(
                  <span style={{marginLeft:6,fontSize:9,color:isDark?'rgba(255,255,255,0.15)':'rgba(0,0,0,0.15)'}}>›</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
