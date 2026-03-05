import React,{useState,useEffect}from 'react';
import TitleBar from './components/layout/TitleBar';
import MainPanel from './components/layout/MainPanel';
import TabBar from './components/layout/TabBar';
import StatusBar from './components/layout/StatusBar';
import FirstRun from './components/views/FirstRun';
import ErrorBoundary from './components/shared/ErrorBoundary';
import{AppProvider,useApp}from './context/AppContext';

function Inner(){
  const{theme,channels,settings}=useApp();
  const isDark=theme==='dark';
  const[firstRun,setFirstRun]=useState(null);// null=loading

  useEffect(()=>{
    // Wait for both channels AND settings to load before deciding
    if(channels===null)return;
    const hasKeys=settings?.apiKeys&&Object.values(settings.apiKeys).some(v=>v);
    const hasChannels=channels.length>0;
    // Show wizard only if no keys AND no channels
    setFirstRun(!hasKeys&&!hasChannels);
  },[channels,settings]);

  if(firstRun===null)return null;// Loading

  if(firstRun)return<FirstRun onComplete={()=>setFirstRun(false)}/>;

  return(
    <div style={{
      display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',
      background:isDark?'linear-gradient(145deg,#0D0D1A,#080810)':'linear-gradient(145deg,#EEEEFF,#F4F4FF)',
      color:isDark?'#E8E6FF':'#111122',borderRadius:14,
      boxShadow:isDark?'0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.06)':'0 32px 80px rgba(0,0,0,0.2),0 0 0 1px rgba(0,0,0,0.08)',
    }}>
      <TitleBar/>
      <TabBar/>
      <ErrorBoundary name="MainPanel" isDark={isDark}>
        <MainPanel/>
      </ErrorBoundary>
      <StatusBar/>
    </div>
  );
}

export default function App(){return(<AppProvider><Inner/></AppProvider>);}
