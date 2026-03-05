import React,{useState}from 'react';
import TitleBar from './components/layout/TitleBar';
import MainPanel from './components/layout/MainPanel';
import TabBar from './components/layout/TabBar';
import StatusBar from './components/layout/StatusBar';
import SystemSetup from './components/views/SystemSetup';
import ChannelWizard from './components/views/ChannelWizard';
import ErrorBoundary from './components/shared/ErrorBoundary';
import{AppProvider,useApp}from './context/AppContext';
import{fix,FIX}from './utils/fixRouter';
import{installGlobalErrorHandlers}from './utils/errorTracker';
import SystemDoctor from './components/views/SystemDoctor';

installGlobalErrorHandlers();

function Inner(){
  const{theme,channels,settings,modal,setModal}=useApp();
  const isDark=theme==='dark';

  const hasKeys=settings?.apiKeys&&Object.values(settings.apiKeys).some(v=>v);
  const hasChannels=channels&&channels.length>0;
  const loading=channels===null;

  const accent=isDark?'#C8FF00':'#4400CC';
  const muted=isDark?'rgba(255,255,255,0.45)':'rgba(0,0,20,0.45)';

  if(loading)return(
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',
      background:isDark?'#0D0D1A':'#EEEEFF',color:muted,fontSize:12,letterSpacing:'0.05em'}}>
      ⟳ Loading…
    </div>
  );

  return(
    <div style={{
      display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',
      background:isDark
        ?'linear-gradient(160deg,#0E0E1C 0%,#080812 60%,#0A0816 100%)'
        :'linear-gradient(160deg,#EEEEFF 0%,#F4F4FF 100%)',
      color:isDark?'#E8E6FF':'#111122',
      borderRadius:14,
      boxShadow:isDark
        ?'0 0 0 1px rgba(255,255,255,0.07),0 32px 80px rgba(0,0,0,0.8),inset 0 1px 0 rgba(255,255,255,0.05)'
        :'0 0 0 1px rgba(0,0,0,0.06),0 24px 60px rgba(0,0,0,0.15),inset 0 1px 0 rgba(255,255,255,0.9)',
    }}>
      <TitleBar
        onNewChannel={()=>fix(FIX.NEW_CHANNEL)}
        onSystemSetup={()=>fix('system:setup')}
        onDoctor={()=>fix(FIX.OPEN_DOCTOR)}
      />
      <TabBar/>

      {/* Non-blocking hint banners — one line max, always have a Fix button */}
      {!hasKeys&&(
        <div style={{
          padding:'5px 14px',flexShrink:0,
          background:'rgba(255,100,0,0.06)',
          borderBottom:'1px solid rgba(255,100,0,0.12)',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,
        }}>
          <span style={{fontSize:11,color:'rgba(255,140,0,0.9)'}}>
            ⚠ No AI keys — content generation is disabled.
          </span>
          <button onClick={()=>fix(FIX.ADD_ANY_AI)}
            style={{fontSize:10,padding:'3px 9px',borderRadius:5,
              background:'rgba(255,140,0,0.1)',border:'1px solid rgba(255,140,0,0.25)',
              color:'rgba(255,140,0,0.9)',cursor:'pointer',fontWeight:700,flexShrink:0}}>
            Add AI Key →
          </button>
        </div>
      )}

      {hasKeys&&!hasChannels&&(
        <div style={{
          padding:'5px 14px',flexShrink:0,
          background:'rgba(200,255,0,0.03)',
          borderBottom:'1px solid rgba(200,255,0,0.08)',
          display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,
        }}>
          <span style={{fontSize:11,color:muted}}>No channels yet.</span>
          <button onClick={()=>fix(FIX.NEW_CHANNEL)}
            style={{fontSize:10,padding:'3px 9px',borderRadius:5,
              background:accent+'10',border:'1px solid '+accent+'25',
              color:accent,cursor:'pointer',fontWeight:700,flexShrink:0}}>
            + New Channel →
          </button>
        </div>
      )}

      <ErrorBoundary name="MainPanel" isDark={isDark}>
        <MainPanel/>
      </ErrorBoundary>
      <StatusBar/>

      {/* Modals — driven by AppContext.modal */}
      {modal?.type==='system'&&(
        <SystemSetup
          initialTab={modal.payload?.tab}
          initialSubTab={modal.payload?.subTab}
          onClose={()=>setModal(null)}
        />
      )}
      {modal?.type==='channel'&&(
        <ChannelWizard
          payload={modal.payload}
          onClose={()=>setModal(null)}
          onCreated={()=>setModal(null)}
        />
      )}
      {modal?.type==='doctor'&&(
        <SystemDoctor
          section={modal.payload?.section}
          onClose={()=>setModal(null)}
        />
      )}
    </div>
  );
}



export default function App(){return(<AppProvider><Inner/></AppProvider>);}
