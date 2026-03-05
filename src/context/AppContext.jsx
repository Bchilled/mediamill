import React,{createContext,useContext,useState,useEffect}from 'react';
const Ctx=createContext(null);
export function AppProvider({children}){
  const[activeView,setActiveView]=useState('dashboard');
  const[activeChannel,setActiveChannel]=useState(null);
  const[channels,setChannels]=useState([]);
  const[mode,setMode]=useState('simple');
  const[theme,setTheme]=useState('dark');
  const[settings,setSettings]=useState({});
  useEffect(()=>{loadChannels();loadSettings();},[]);
  async function loadChannels(){try{const d=await window.forge.getChannels();setChannels(d||[]);if(d?.length>0)setActiveChannel(c=>c||d[0]);}catch(e){}}
  async function loadSettings(){try{const s=await window.forge.getSettings();setSettings(s);setMode(s.mode||'simple');setTheme(s.theme||'dark');}catch(e){}}
  return<Ctx.Provider value={{activeView,setActiveView,activeChannel,setActiveChannel,channels,setChannels,loadChannels,mode,setMode,theme,setTheme,settings,setSettings,loadSettings}}>{children}</Ctx.Provider>;
}
export const useApp=()=>useContext(Ctx);