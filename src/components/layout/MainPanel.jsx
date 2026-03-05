import React from 'react';
import{useApp}from '../../context/AppContext';
import TabBar from './TabBar';
import Dashboard from '../views/Dashboard';
import NewChannel from '../views/NewChannel';
import Settings from '../views/Settings';
import IdeaBoard from '../views/IdeaBoard';

const makeStub=(name,icon,desc)=>function(){
  const{theme}=useApp();
  const isDark=theme==='dark';
  return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.25)'}}>
        <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
        <div style={{fontSize:17,fontWeight:700,marginBottom:6,color:isDark?'#E8E6FF':'#111122'}}>{name}</div>
        <div style={{fontSize:12}}>{desc||'Coming in next sprint'}</div>
      </div>
    </div>
  );
};

// Channels tab — channel list + create
function ChannelsView(){
  const{channels,activeChannel,setActiveChannel,setActiveView,theme}=useApp();
  const isDark=theme==='dark';
  const text=isDark?'#E8E6FF':'#111122';
  const muted=isDark?'rgba(255,255,255,0.4)':'rgba(0,0,20,0.45)';
  const card=isDark?'linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.025))':'linear-gradient(145deg,#FFFFFF,#F8F8FF)';
  const cardBorder=isDark?'rgba(255,255,255,0.09)':'rgba(0,0,0,0.08)';
  const cardShadow=isDark?'0 8px 32px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.08)':'0 4px 20px rgba(0,0,0,0.08),inset 0 1px 0 rgba(255,255,255,1)';
  const PC={short:'#C8FF00',mid:'#00C8FF',long:'#FF8040'};
  const accentColor=isDark?'#C8FF00':'#4400CC';

  return(
    <div style={{flex:1,overflowY:'auto',padding:32}}>
      <div style={{maxWidth:800,margin:'0 auto'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:24}}>
          <div>
            <h2 style={{fontSize:20,fontWeight:900,color:text,marginBottom:4}}>Channels</h2>
            <div style={{fontSize:12,color:muted}}>{channels.length} channel{channels.length!==1?'s':''} · Each links to a separate YouTube account</div>
          </div>
          <button onClick={()=>setActiveView('new-channel')} className="btn btn-primary">+ New Channel</button>
        </div>

        {channels.length===0?(
          <div style={{textAlign:'center',padding:'64px 32px',color:muted}}>
            <div style={{fontSize:48,marginBottom:16}}>📡</div>
            <div style={{fontSize:16,fontWeight:700,color:text,marginBottom:8}}>No channels yet</div>
            <div style={{fontSize:13,marginBottom:24}}>Create your first channel to get started</div>
            <button onClick={()=>setActiveView('new-channel')} className="btn btn-primary">Create Channel</button>
          </div>
        ):(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:16}}>
            {channels.map(ch=>{
              const isActive=activeChannel?.id===ch.id;
              const color=PC[ch.preset]||'#888';
              return(
                <div key={ch.id}
                  onClick={()=>{setActiveChannel(ch);setActiveView('dashboard');}}
                  style={{
                    background:card,border:'1px solid '+(isActive?accentColor+'40':cardBorder),
                    borderRadius:16,boxShadow:isActive?'0 0 0 1px '+accentColor+'30, '+cardShadow:cardShadow,
                    padding:'20px',cursor:'pointer',transition:'all 0.15s ease',
                    borderTop:'3px solid '+color,
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 12px 40px rgba(0,0,0,0.4),inset 0 1px 0 rgba(255,255,255,0.1)';}}
                  onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow=isActive?'0 0 0 1px '+accentColor+'30, '+cardShadow:cardShadow;}}>
                  <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:10}}>
                    <div>
                      <div style={{fontSize:14,fontWeight:700,color:text,marginBottom:4}}>{ch.name}</div>
                      <div style={{display:'flex',gap:6,alignItems:'center'}}>
                        <span style={{fontSize:9,padding:'2px 7px',borderRadius:6,background:color+'18',color,border:'1px solid '+color+'30',fontWeight:700,textTransform:'capitalize'}}>{ch.preset}</span>
                        <span style={{fontSize:10,color:muted}}>{ch.auto_approve?'⚡ Auto':'◎ Manual'}</span>
                      </div>
                    </div>
                    {isActive&&<span style={{fontSize:10,fontWeight:700,color:accentColor,background:accentColor+'15',padding:'3px 8px',borderRadius:6}}>Active</span>}
                  </div>
                  {(ch.topic||ch.style_prompt)&&(
                    <div style={{fontSize:11,color:muted,lineHeight:1.4,display:'-webkit-box',WebkitLineClamp:2,WebkitBoxOrient:'vertical',overflow:'hidden'}}>
                      {ch.topic||ch.style_prompt}
                    </div>
                  )}
                </div>
              );
            })}
            {/* Add card */}
            <div onClick={()=>setActiveView('new-channel')} style={{
              background:'transparent',border:'2px dashed '+(isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.12)'),
              borderRadius:16,padding:'20px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',
              minHeight:120,transition:'all 0.15s',color:muted,fontSize:13,fontWeight:500,gap:8,
            }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=accentColor;e.currentTarget.style.color=accentColor;e.currentTarget.style.background=isDark?'rgba(200,255,0,0.03)':'rgba(68,0,204,0.03)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=isDark?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.12)';e.currentTarget.style.color=muted;e.currentTarget.style.background='transparent';}}>
              + New Channel
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const PipelineIdeas=()=><IdeaBoard/>;
const PipelineScripts=makeStub('Script Generation','📄','Write scripts, B-roll cues, SEO · EN/FR/ES');
const PipelineAssets=makeStub('Asset Gathering','🖼','Pexels · Pixabay · Wikimedia · Archive');
const PipelineVoice=makeStub('Voice Rendering','🎙','ElevenLabs · Play.ht · Coqui · Windows TTS');
const PipelineCompose=makeStub('Video Composition','🎞','FFmpeg · Remotion · Templates');
const PipelineReview=makeStub('Review','👁','Approve scripts, assets, and final video');
const PipelinePublish=makeStub('Publish','🚀','YouTube upload · Optimal timing · EN/FR/ES');
const PipelineAnalytics=makeStub('Analytics','📊','Views · CTR · Revenue · Best topics · Timing');

const VIEWS={
  dashboard:Dashboard,
  'pipeline:ideas':PipelineIdeas,
  'pipeline:scripts':PipelineScripts,
  'pipeline:assets':PipelineAssets,
  'pipeline:voice':PipelineVoice,
  'pipeline:compose':PipelineCompose,
  'pipeline:review':PipelineReview,
  'pipeline:publish':PipelinePublish,
  'pipeline:analytics':PipelineAnalytics,
  channels:ChannelsView,
  'new-channel':NewChannel,
  settings:Settings,
  agents:makeStub('Agent Manager','🤖','Configure AI agent roles and models'),
  tasks:makeStub('Task Queue','📋','Monitor all running and queued tasks'),
  prompts:makeStub('Prompt Library','📝','Manage and edit AI prompts per stage'),
};

export default function MainPanel(){
  const{activeView,theme}=useApp();
  const isDark=theme==='dark';
  const View=VIEWS[activeView]||Dashboard;
  return(
    <div style={{display:'flex',flexDirection:'column',overflow:'hidden',background:isDark?'rgba(8,8,16,0.5)':'rgba(244,244,255,0.6)'}}>
      <TabBar/>
      <View/>
    </div>
  );
}
