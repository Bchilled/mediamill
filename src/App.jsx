import React,{useState}from 'react';
import TitleBar from './components/layout/TitleBar';
import MainPanel from './components/layout/MainPanel';
import TabBar from './components/layout/TabBar';
import StatusBar from './components/layout/StatusBar';
import SystemSetup from './components/views/SystemSetup';
import ChannelWizard from './components/views/ChannelWizard';
import ErrorBoundary from './components/shared/ErrorBoundary';
import{AppProvider,useApp}from './context/AppContext';

function Inner(){
  const{theme,channels,settings}=useApp();
  const isDark=theme==='dark';
  const[showSystem,setShowSystem]=useState(false);
  const[showChannel,setShowChannel]=useState(false);

  const hasKeys=settings?.apiKeys&&Object.values(settings.apiKeys).some(v=>v);
  const hasChannels=channels&&channels.length>0;
  const loading=channels===null;

  const accent=isDark?'#C8FF00':'#4400CC';
  const muted=isDark?'rgba(255,255,255,0.5)':'rgba(0,0,20,0.5)';

  if(loading)return(
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',
      background:isDark?'#0D0D1A':'#EEEEFF',color:muted,fontSize:13}}>
      Loading…
    </div>
  );

  return(
    <div style={{
      display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',
      background:isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)',
      color:isDark?'#E8E6FF':'#111122',borderRadius:14,
      boxShadow:isDark?'0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.06)':'0 32px 80px rgba(0,0,0,0.2)',
    }}>
      <TitleBar onNewChannel={()=>setShowChannel(true)} onSystemSetup={()=>setShowSystem(true)}/>
      <TabBar/>

      {/* Non-blocking hints — one line, dismissable */}
      {!hasKeys&&(
        <div style={{padding:'6px 16px',background:'rgba(255,170,0,0.06)',borderBottom:'1px solid rgba(255,170,0,0.12)',
          display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <span style={{fontSize:11,color:'#FFAA00'}}>⚠ No AI keys — videos can't be generated yet.</span>
          <button onClick={()=>setShowSystem(true)}
            style={{fontSize:10,padding:'3px 10px',borderRadius:6,background:'rgba(255,170,0,0.1)',
              border:'1px solid rgba(255,170,0,0.25)',color:'#FFAA00',cursor:'pointer',fontWeight:700,flexShrink:0}}>
            Fix →
          </button>
        </div>
      )}
      {hasKeys&&!hasChannels&&(
        <div style={{padding:'6px 16px',background:'rgba(200,255,0,0.03)',borderBottom:'1px solid rgba(200,255,0,0.08)',
          display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
          <span style={{fontSize:11,color:muted}}>No channels yet — create one to start making videos.</span>
          <button onClick={()=>setShowChannel(true)}
            style={{fontSize:10,padding:'3px 10px',borderRadius:6,background:accent+'10',
              border:'1px solid '+accent+'25',color:accent,cursor:'pointer',fontWeight:700,flexShrink:0}}>
            + New Channel
          </button>
        </div>
      )}

      <ErrorBoundary name="MainPanel" isDark={isDark}>
        <MainPanel/>
      </ErrorBoundary>
      <StatusBar/>

      {showSystem&&<SystemSetup onClose={()=>setShowSystem(false)}/>}
      {showChannel&&<ChannelWizard onClose={()=>setShowChannel(false)} onCreated={()=>setShowChannel(false)}/>}
    </div>
  );
}

export default function App(){return(<AppProvider><Inner/></AppProvider>);}
