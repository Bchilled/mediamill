import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import{Sounds}from './utils/sounds';
import './index.css';
import{I18nProvider}from './i18n';
import{installGlobalErrorHandlers}from './utils/errorTracker';

installGlobalErrorHandlers();
try{setTimeout(()=>Sounds.startup(),400);}catch(e){}

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nProvider><App/></I18nProvider>
);
