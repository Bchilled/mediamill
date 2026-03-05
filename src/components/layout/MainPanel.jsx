import React from 'react';
import{useApp}from '../../context/AppContext';
import TabBar from './TabBar';
import StatusBar from './StatusBar';
import Settings from '../views/Settings';
import IdeaBoard from '../views/IdeaBoard';
import NewChannel from '../views/NewChannel';

const Stub=(name,icon,desc)=>function(){
  const{theme}=useApp();
  const isDark=theme==='dark';
  return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center',color:isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)'}}>
        <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
        <div style={{fontSize:17,fontWeight:700,marginBottom:6,color:isDark?'#E8E6FF':'#111122'}}>{name}</div>
        <div style={{fontSize:12}}>{desc||'Coming in next sprint'}</div>
      </div>
    </div>
  );
};

const VIEWS={
  'pipeline:ideas':IdeaBoard,
  'pipeline:scripts':Stub('Script Generation','📄','Claude writes scripts · B-roll cues · SEO · EN/FR/ES'),
  'pipeline:assets':Stub('Asset Gathering','🖼','Pexels · Pixabay · Wikimedia · Internet Archive'),
  'pipeline:voice':Stub('Voice Rendering','🎙','ElevenLabs · Play.ht · Coqui · Windows TTS'),
  'pipeline:compose':Stub('Video Composition','🎞','FFmpeg · Remotion · Templates'),
  'pipeline:review':Stub('Review','👁','Approve scripts, assets, and final video before publish'),
  'pipeline:publish':Stub('Publish','🚀','YouTube upload · Optimal timing · EN/FR/ES descriptions'),
  'pipeline:analytics':Stub('Analytics','📊','Views · CTR · Revenue · Best topics · Optimal post times'),
  agents:Stub('Agent Manager','🤖','Configure AI agent roles and model assignments'),
  tasks:Stub('Task Queue','📋','Monitor all running and queued tasks'),
  prompts:Stub('Prompt Library','📝','Edit AI prompts for every pipeline stage'),
  settings:Settings,
  'new-channel':NewChannel,
};

export default function MainPanel(){
  const{activeView,theme}=useApp();
  const isDark=theme==='dark';
  // Default to ideas if somehow no valid view
  const View=VIEWS[activeView]||IdeaBoard;
  return(
    <div style={{display:'flex',flexDirection:'column',flex:1,overflow:'hidden',background:isDark?'rgba(8,8,16,0.5)':'rgba(244,244,255,0.6)'}}>
      <StatusBar/>
      <TabBar/>
      <View/>
    </div>
  );
}
