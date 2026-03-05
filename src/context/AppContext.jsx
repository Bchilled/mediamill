import React,{createContext,useContext,useState,useEffect}from 'react';
import{registerFixHandler}from '../utils/fixRouter';

const Ctx=createContext(null);

export function AppProvider({children}){
  const[activeView,setActiveView]=useState('dashboard');
  const[activeChannel,setActiveChannel]=useState(null);
  const[channels,setChannels]=useState(null);
  const[mode,setMode]=useState('simple');
  const[theme,setTheme]=useState('dark');
  const[settings,setSettings]=useState({});
  const[modal,setModal]=useState(null);
  const[settingsTab,setSettingsTab]=useState('ai');
  const[settingsSubTab,setSettingsSubTab]=useState(null);

  useEffect(()=>{loadChannels();loadSettings();},[]);

  useEffect(()=>{
    registerFixHandler((action,payload={})=>{
      if(action.startsWith('settings:ai')){
        const sub=action.split(':')[2]||null;
        setSettingsTab('ai');setSettingsSubTab(sub);setActiveView('settings');setModal(null);return;
      }
      if(action.startsWith('settings:media')){
        setSettingsTab('media');setSettingsSubTab(action.split(':')[2]||null);setActiveView('settings');setModal(null);return;
      }
      if(action.startsWith('settings:youtube')){
        setSettingsTab('publish');setSettingsSubTab(action.includes('403')?'403':null);setActiveView('settings');setModal(null);return;
      }
      if(action.startsWith('settings:budget')){
        setSettingsTab('budget');setSettingsSubTab(null);setActiveView('settings');setModal(null);return;
      }
      if(action.startsWith('settings:errors')){
        setSettingsTab('errors');setSettingsSubTab(null);setActiveView('settings');setModal(null);return;
      }
      if(action==='settings'){setActiveView('settings');setModal(null);return;}
      if(action==='channel:new'){setModal({type:'channel',payload});return;}
      if(action==='channel:edit'){setModal({type:'channel',payload:{...payload,edit:true}});return;}
      if(action==='channel:branding'){setActiveView('channel:branding');setModal(null);return;}
      if(action==='system:setup'){setModal({type:'system',payload});return;}
      if(action.startsWith('system:doctor')){
        setModal({type:'doctor',payload:{section:action.split(':')[2]||null}});return;
      }
      if(action.startsWith('pipeline:')){setActiveView('pipeline:review');return;}
    });
  },[]);

  async function loadChannels(){
    try{
      const d=await window.forge.getChannels();
      setChannels(d||[]);
      if(d?.length>0){
        setActiveChannel(c=>{
          if(!c)return d[0];
          const still=d.find(ch=>ch.id===c.id);
          return still||d[0];
        });
      }else{setActiveChannel(null);}
    }catch(e){setChannels([]);}
  }

  async function loadSettings(){
    try{
      const s=await window.forge.getSettings();
      setSettings(s);setMode(s.mode||'simple');setTheme(s.theme||'dark');
    }catch(e){}
  }

  return(
    <Ctx.Provider value={{
      activeView,setActiveView,
      activeChannel,setActiveChannel,
      channels,setChannels,loadChannels,
      mode,setMode,theme,setTheme,
      settings,setSettings,loadSettings,
      modal,setModal,
      settingsTab,setSettingsTab,
      settingsSubTab,setSettingsSubTab,
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useApp=()=>useContext(Ctx);
