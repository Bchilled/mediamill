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
import SystemDoctor from './components/views/SystemDoctor';
import ToastContainer from './components/shared/ToastContainer';

function SetupGate({onDone}){
  // Full-screen first-run experience
  return(
    <div style={{
      display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',
      height:'100vh',background:'#0C0C10',color:'#ECECEC',textAlign:'center',padding:40,
    }}>
      <div style={{fontSize:48,marginBottom:16}}>🎬</div>
      <div style={{fontSize:28,fontWeight:800,marginBottom:8,color:'#ECECEC',letterSpacing:'-0.02em'}}>
        Welcome to MediaMill
      </div>
      <div style={{fontSize:14,color:'#777',marginBottom:40,maxWidth:360,lineHeight:1.7}}>
        Your AI-powered video content factory.<br/>
        Connect an AI model to get started.
      </div>
      <button onClick={onDone} style={{
        padding:'14px 32px',borderRadius:10,fontSize:14,fontWeight:700,
        background:'#6C63FF',color:'#fff',border:'none',cursor:'pointer',
        boxShadow:'0 4px 24px rgba(108,99,255,0.45)',transition:'all 0.15s'}}
        onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 32px rgba(108,99,255,0.6)';}}
        onMouseLeave={e=>{e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='0 4px 24px rgba(108,99,255,0.45)';}}>
        Connect AI → Get Started
      </button>
      <div style={{marginTop:16,fontSize:11,color:'#555'}}>
        Claude or Gemini — takes 30 seconds
      </div>
    </div>
  );
}

function Inner(){
  const{theme,channels,settings,modal,setModal}=useApp();
  const isDark=theme==='dark';
  const hasKeys=settings?.apiKeys&&Object.values(settings.apiKeys).some(v=>v);
  const loading=channels===null;

  if(loading)return(
    <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',
      background:'#0C0C10',color:'#555',fontSize:13,gap:8}}>
      <span style={{animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span>
      Loading…
    </div>
  );

  // First-run: no AI keys yet → full-screen setup gate
  if(!hasKeys&&!modal)return(
    <>
      <SetupGate onDone={()=>fix(FIX.ADD_ANY_AI)}/>
      {modal?.type==='system'&&(
        <SystemSetup initialTab={modal.payload?.tab} initialSubTab={modal.payload?.subTab} onClose={()=>setModal(null)}/>
      )}
    </>
  );

  const bg=isDark?'#0C0C0E':'#F0F0F5';

  return(
    <div style={{
      display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',
      background:bg,color:isDark?'#ECECEC':'#111',
      borderRadius:14,
      boxShadow:isDark
        ?'0 0 0 1px rgba(255,255,255,0.06),0 32px 80px rgba(0,0,0,0.9)'
        :'0 0 0 1px rgba(0,0,0,0.06),0 24px 60px rgba(0,0,0,0.15)',
    }}>
      <TitleBar onNewChannel={()=>fix(FIX.NEW_CHANNEL)}/>
      <TabBar/>
      <ErrorBoundary name="MainPanel" isDark={isDark}>
        <MainPanel/>
      </ErrorBoundary>
      <StatusBar/>

      {modal?.type==='system'&&(
        <SystemSetup initialTab={modal.payload?.tab} initialSubTab={modal.payload?.subTab} onClose={()=>setModal(null)}/>
      )}
      {modal?.type==='channel'&&(
        <ChannelWizard payload={modal.payload} onClose={()=>setModal(null)} onCreated={()=>setModal(null)}/>
      )}
      {modal?.type==='doctor'&&(
        <SystemDoctor section={modal.payload?.section} onClose={()=>setModal(null)}/>
      )}
    </div>
  );
}

export default function App(){
  return(
    <AppProvider>
      <Inner/>
      <ToastContainer/>
    </AppProvider>
  );
}
