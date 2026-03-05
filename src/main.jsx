import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import{I18nProvider}from './i18n';
import App from './App';

const root=document.getElementById('root');

try{
  ReactDOM.createRoot(root).render(<I18nProvider><App/></I18nProvider>);
}catch(err){
  root.innerHTML='<div style="color:#EE2244;padding:40px;font-family:monospace;background:#0D0D1A;height:100vh">'
    +'<div style="color:#C8FF00;font-size:18px;margin-bottom:16px">⚠ Crash</div>'
    +'<pre style="white-space:pre-wrap;font-size:12px">'+String(err?.stack||err)+'</pre></div>';
}
