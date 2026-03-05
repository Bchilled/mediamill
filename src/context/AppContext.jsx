import React,{createContext,useContext,useState,useEffect}from 'react';
const Ctx=createContext(null);
export function AppProvider({children}){
  const[activeView,setActiveView]=useState('dashboard');
  const[activeChannel,setActiveChannel]=useState(null);
  const[channels,setChannels]=useState(null);// null=loading
  const[mode,setMode]=useState('simple');
  const[theme,setTheme]=useState('dark');
  const[settings,setSettings]=useState({});

  useEffect(()=>{loadChannels();loadSettings();},[]);

  async function loadChannels(){
    try{
      const d=await window.forge.getChannels();
      setChannels(d||[]);
      if(d?.length>0){
        // If active channel was deleted, switch to first available
        setActiveChannel(c=>{
          if(!c)return d[0];
          const still=d.find(ch=>ch.id===c.id);
          return still||d[0];
        });
      } else {
        setActiveChannel(null);
      }
    }}
    catch(e){setChannels([]);}
  }
  async function loadSettings(){
    try{const s=await window.forge.getSettings();setSettings(s);setMode(s.mode||'simple');setTheme(s.theme||'dark');}
    catch(e){}
  }

  return(
    <Ctx.Provider value={{
      activeView,setActiveView,
      activeChannel,setActiveChannel,
      channels,setChannels,loadChannels,
      mode,setMode,theme,setTheme,
      settings,setSettings,loadSettings,
    }}>
      {children}
    </Ctx.Provider>
  );
}
export const useApp=()=>useContext(Ctx);
