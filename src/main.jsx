import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <div style={{color:'#C8FF00',padding:40,fontSize:24,background:'#0D0D1A',height:'100vh'}}>
    ✓ React works
  </div>
);

// Load full app after confirming React mounts
setTimeout(async()=>{
  try{
    const{I18nProvider}=await import('./i18n');
    const App=(await import('./App')).default;
    ReactDOM.createRoot(document.getElementById('root')).render(
      <I18nProvider><App/></I18nProvider>
    );
  }catch(e){
    document.getElementById('root').querySelector('div').textContent='CRASH: '+e.message;
  }
},100);
