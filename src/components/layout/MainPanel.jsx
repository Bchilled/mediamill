import React from 'react';
import{useApp}from '../../context/AppContext';
import TabBar from './TabBar';
import Dashboard from '../views/Dashboard';
import NewChannel from '../views/NewChannel';
import Settings from '../views/Settings';
import IdeaBoard from '../views/IdeaBoard';

const makeStub=(name,icon)=>function(){
  const{theme}=useApp();
  const isDark=theme==='dark';
  return(
    <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',color:isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.25)'}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
        <div style={{fontSize:18,fontWeight:700,marginBottom:6,color:isDark?'#E8E6FF':'#111122'}}>{name}</div>
        <div style={{fontSize:13}}>Sprint 2 — Coming soon</div>
      </div>
    </div>
  );
};

const Pipeline=makeStub('Pipeline','🎬');
const PromptLibrary=makeStub('Prompts','📝');
const AgentManager=makeStub('Agents','🤖');
const TaskManager=makeStub('Tasks','📋');
const Analytics=makeStub('Analytics','📊');

const VIEWS={dashboard:Dashboard,pipeline:Pipeline,ideas:IdeaBoard,prompts:PromptLibrary,agents:AgentManager,tasks:TaskManager,settings:Settings,analytics:Analytics,'new-channel':NewChannel};

export default function MainPanel(){
  const{activeView,theme}=useApp();
  const isDark=theme==='dark';
  const View=VIEWS[activeView]||Dashboard;
  return(
    <div style={{display:'flex',flexDirection:'column',overflow:'hidden',background:isDark?'rgba(8,8,16,0.5)':'rgba(244,244,255,0.6)'}}>
      <TabBar/>
      <View/>
    </div>
  );
}
