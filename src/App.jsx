import React from 'react';
import TitleBar from './components/layout/TitleBar';
import Sidebar from './components/layout/Sidebar';
import IconNav from './components/layout/IconNav';
import MainPanel from './components/layout/MainPanel';
import{AppProvider,useApp}from './context/AppContext';

function Inner(){
  const{theme}=useApp();
  const isDark=theme==='dark';
  return(
    <div style={{
      display:'flex',flexDirection:'column',height:'100vh',overflow:'hidden',
      background:isDark
        ?'linear-gradient(145deg,#0D0D1A 0%,#080810 60%,#0A0818 100%)'
        :'linear-gradient(145deg,#EEEEFF 0%,#F4F4FF 60%,#EBEBFF 100%)',
      color:isDark?'#E8E6FF':'#111122',
      borderRadius:14,
      boxShadow:isDark
        ?'0 32px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(255,255,255,0.06)'
        :'0 32px 80px rgba(0,0,0,0.2),0 0 0 1px rgba(0,0,0,0.08)',
    }}>
      <TitleBar/>
      <div style={{display:'grid',gridTemplateColumns:'52px 210px 1fr',flex:1,overflow:'hidden'}}>
        <IconNav/>
        <Sidebar/>
        <MainPanel/>
      </div>
    </div>
  );
}
export default function App(){return(<AppProvider><Inner/></AppProvider>);}
