import React,{createContext,useContext,useState,useEffect}from 'react';
import T,{LANGUAGES}from './translations';

const I18nContext=createContext({t:k=>k,lang:'en',setLang:()=>{},langs:LANGUAGES,isRTL:false});

export function I18nProvider({children}){
  const[lang,setLangState]=useState(()=>localStorage.getItem('mm_lang')||'en');

  function setLang(code){
    setLangState(code);
    localStorage.setItem('mm_lang',code);
    // RTL support
    document.documentElement.setAttribute('dir',LANGUAGES.find(l=>l.code===code)?.rtl?'rtl':'ltr');
  }

  useEffect(()=>{
    document.documentElement.setAttribute('dir',LANGUAGES.find(l=>l.code===lang)?.rtl?'rtl':'ltr');
  },[lang]);

  // t(key) — falls back to English if key missing in current lang
  function t(key){
    return (T[lang]?.[key]) || T['en']?.[key] || key;
  }

  const isRTL=LANGUAGES.find(l=>l.code===lang)?.rtl||false;

  return(
    <I18nContext.Provider value={{t,lang,setLang,langs:LANGUAGES,isRTL}}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(){return useContext(I18nContext);}
export{LANGUAGES};
