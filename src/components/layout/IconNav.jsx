import React from 'react';
import{useApp}from '../../context/AppContext';

const ITEMS=[
  {id:'dashboard',icon:'📺',label:'Dashboard'},
  {id:'pipeline',icon:'🎬',label:'Pipeline',badge:4},
  {id:'ideas',icon:'💡',label:'Ideas'},
  null,
  {id:'agents',icon:'🤖',label:'Agents',advanced:true},
  {id:'tasks',icon:'📋',label:'Tasks',advanced:true},
  {id:'prompts',icon:'📝',label:'Prompts',advanced:true},
  null,
  {id:'analytics',icon:'📊',label:'Analytics'},
  {id:'settings',icon:'⚙️',label:'Settings'},
];

export default function IconNav(){
  const{activeView,setActiveView,mode,theme}=useApp();
  const isDark=theme==='dark';
  const bg=isDark?'rgba(8,8,18,0.98)':'rgba(240,240,250,0.98)';
  const border=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.08)';

  return(
    <div className="flex flex-col items-center py-3 gap-0.5"
      style={{background:bg,borderRight:'1px solid '+border}}>
      {ITEMS.map((item,i)=>{
        if(!item)return<div key={i} className="w-5 h-px my-2" style={{background:border}}/>;
        if(item.advanced&&mode==='simple')return null;
        const isActive=activeView===item.id;
        return(
          <button key={item.id} title={item.label}
            onClick={()=>setActiveView(item.id)}
            className="nav-icon relative"
            style={isActive
              ? {background:isDark?'rgba(200,255,0,0.1)':'rgba(34,0,170,0.08)',
                 boxShadow:isDark?'0 0 0 1px rgba(200,255,0,0.2)':'0 0 0 1px rgba(34,0,170,0.15)',
                 color:isDark?'#C8FF00':'#2200AA'}
              : {color:isDark?'rgba(255,255,255,0.35)':'rgba(0,0,0,0.35)'}}>
            {item.icon}
            {item.badge&&(
              <div className="badge absolute -top-0.5 -right-0.5">{item.badge}</div>
            )}
          </button>
        );
      })}
    </div>
  );
}
