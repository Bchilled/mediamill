import React,{useState,useEffect}from 'react';
import TitleBar from './components/layout/TitleBar';
import MainPanel from './components/layout/MainPanel';
import TabBar from './components/layout/TabBar';
import StatusBar from './components/layout/StatusBar';
import SystemSetup from './components/views/SystemSetup';
import ChannelWizard from './components/views/ChannelWizard';
import ErrorBoundary from './components/shared/ErrorBoundary';
import{AppProvider,useApp}from './context/AppContext';

function Inner(){
  const{theme,channels,settings,loadChannels}=useApp();
  const isDark=theme==='dark';
  const[showSystemSetup,setShowSystemSetup]=useState(false);
  const[showChannelWizard,setShowChannelWizard]=useState(false);

  // Check for missing keys — show banner but NEVER block the app
  const hasKeys=settings?.apiKeys&&Object.values(settings.apiKeys).some(v=>v);
  const hasChannels=channels&&channels.length>0;

  const text=isDark?'#E8E6FF':'#111122';
  const accent=isDark?'#C8FF00':'#4400CC';
  const muted=isDark?'rgba(255,255,255,0.5)':'rgba(0,0,20,0.5)';

  return(
    <div style={{
      display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',
      background:isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)',
      color:isDark?'#E8E6FF':'#111122',borderRadius:14,
      boxShadow:isDark?'0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.06)':'0 32px 80px rgba(0,0,0,0.2),0 0 0 1px rgba(0,0,0,0.08)',
    }}>
      <TitleBar onNewChannel={()=>setShowChannelWizard(true)} onSystemSetup={()=>setShowSystemSetup(true)}/>
      <TabBar/>

      {/* Setup banners — informational only, never blocking */}
      {channels!==null&&!hasKeys&&(
        <div style={{padding:'8px 16px',background:'rgba(255,170,0,0.07)',borderBottom:'1px solid rgba(255,170,0,0.15)',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexShrink:0}}>
          <div style={{fontSize:11,color:'#FFAA00'}}>
            ⚠ No AI keys configured — MediaMill needs at least one AI model to generate content.
          </div>
          <button onClick={()=>setShowSystemSetup(true)}
            style={{fontSize:11,padding:'5px 13px',borderRadius:7,background:'rgba(255,170,0,0.12)',
              border:'1px solid rgba(255,170,0,0.3)',color:'#FFAA00',cursor:'pointer',flexShrink:0,fontWeight:700}}>
            Set up now →
          </button>
        </div>
      )}

      {channels!==null&&!hasChannels&&hasKeys&&(
        <div style={{padding:'8px 16px',background:'rgba(200,255,0,0.04)',borderBottom:'1px solid rgba(200,255,0,0.1)',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexShrink:0}}>
          <div style={{fontSize:11,color:muted}}>
            You don't have a channel yet. Create one to start making videos.
          </div>
          <button onClick={()=>setShowChannelWizard(true)}
            style={{fontSize:11,padding:'5px 13px',borderRadius:7,background:accent+'12',
              border:'1px solid '+accent+'30',color:accent,cursor:'pointer',flexShrink:0,fontWeight:700}}>
            + New Channel
          </button>
        </div>
      )}

      <ErrorBoundary name="MainPanel" isDark={isDark}>
        <MainPanel/>
      </ErrorBoundary>
      <StatusBar onSystemSetup={()=>setShowSystemSetup(true)}/>

      {/* Modals */}
      {showSystemSetup&&<SystemSetup onClose={()=>setShowSystemSetup(false)}/>}
      {showChannelWizard&&<ChannelWizard onClose={()=>setShowChannelWizard(false)} onCreated={()=>setShowChannelWizard(false)}/>}
    </div>
  );
}

export default function App(){return(<AppProvider><Inner/></AppProvider>);}
