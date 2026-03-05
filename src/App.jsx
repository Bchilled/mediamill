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
    <div className='flex flex-col h-screen overflow-hidden'
      style={{background:isDark?'#080810':'#F0F0F8',color:isDark?'#E8E6FF':'#111122'}}>
      <TitleBar/>
      <div className='flex flex-1 overflow-hidden' style={{display:'grid',gridTemplateColumns:'56px 200px 1fr'}}>
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