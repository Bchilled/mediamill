import React from 'react';
import{useApp}from '../../context/AppContext';
import TabBar from './TabBar';
import Dashboard from '../views/Dashboard';
import NewChannel from '../views/NewChannel';
import Settings from '../views/Settings';

const makeStub=(name,icon)=>function(){
  const{theme}=useApp();
  const isDark=theme==='dark';
  return(
    <div className="flex-1 flex items-center justify-center" style={{color:isDark?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)'}}>
      <div className="text-center">
        <div className="text-5xl mb-4">{icon}</div>
        <div className="text-lg font-bold mb-1" style={{color:isDark?'#E8E6FF':'#111122'}}>{name}</div>
        <div className="text-sm">Sprint 2 — Coming soon</div>
      </div>
    </div>
  );
};

const Pipeline=makeStub('Pipeline','🎬');
const IdeaBoard=makeStub('Idea Board','💡');
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
    <div className="flex flex-col overflow-hidden" style={{background:isDark?'#08080F':'#F2F2FC'}}>
      <TabBar/>
      <View/>
    </div>
  );
}
