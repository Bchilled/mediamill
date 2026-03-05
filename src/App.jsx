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
      display:'flex',
      flexDirection:'column',
      height:'100vh',
      overflow:'hidden',
      background:isDark?'#08080F':'#F2F2FC',
      color:isDark?'#E8E6FF':'#111122',
      borderRadius:12,
    }}>
      <TitleBar/>
      <div style={{display:'grid',gridTemplateColumns:'52px 200px 1fr',flex:1,overflow:'hidden'}}>
        <IconNav/>
        <Sidebar/>
        <MainPanel/>
      </div>
    </div>
  );
}

export default function App(){
  return(<AppProvider><Inner/></AppProvider>);
}
