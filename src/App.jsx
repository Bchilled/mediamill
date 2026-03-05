import React,{useState,useEffect}from 'react';
import TitleBar from './components/layout/TitleBar';
import MainPanel from './components/layout/MainPanel';
import FirstRun from './components/views/FirstRun';
import{AppProvider,useApp}from './context/AppContext';

function Inner(){
  const{theme,channels,settings}=useApp();
  const isDark=theme==='dark';
  const[firstRun,setFirstRun]=useState(null);// null=loading

  useEffect(()=>{
    // Show first-run if no channels exist
    if(channels!==null){
      const hasKeys=settings?.apiKeys?.claude||settings?.apiKeys?.gemini;
      setFirstRun(channels.length===0);
    }
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
      <MainPanel/>
    </div>
  );
}

export default function App(){return(<AppProvider><Inner/></AppProvider>);}
