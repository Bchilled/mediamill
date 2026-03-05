import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import{I18nProvider}from './i18n';
import{installGlobalErrorHandlers}from './utils/errorTracker';

installGlobalErrorHandlers();

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nProvider><App/></I18nProvider>
);
