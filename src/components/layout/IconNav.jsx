import React,{useState}from 'react';
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
  const[hovered,setHovered]=useState(null);
  const isDark=theme==='dark';
  const bg=isDark?'rgba(8,8,18,0.6)':'rgba(235,235,252,0.7)';
  const border=isDark?'rgba(255,255,255,0.06)':'rgba(0,0,0,0.07)';
  const activeColor=isDark?'#C8FF00':'#4400CC';

  return(
    <div style={{
      display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 0',gap:2,
      background:bg,borderRight:'1px solid '+border,
    }}>
      {ITEMS.map((item,i)=>{
        if(!item)return<div key={i} style={{width:24,height:1,background:border,margin:'6px 0'}}/>;
        if(item.advanced&&mode==='simple')return null;
        const isActive=activeView===item.id;
        const isHov=hovered===item.id;
        return(
          <div key={item.id} style={{position:'relative'}}>
            {/* Tooltip */}
            {isHov&&(
              <div style={{
                position:'absolute',left:'calc(100% + 10px)',top:'50%',transform:'translateY(-50%)',
                background:isDark?'rgba(20,20,35,0.98)':'rgba(255,255,255,0.98)',
                color:isDark?'#E8E6FF':'#111122',
                border:'1px solid '+(isDark?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.1)'),
                borderRadius:8,padding:'5px 10px',fontSize:11,fontWeight:600,
                whiteSpace:'nowrap',zIndex:999,
                boxShadow:'0 4px 16px rgba(0,0,0,0.3)',pointerEvents:'none',
              }}>
                {item.label}
                <div style={{
                  position:'absolute',right:'100%',top:'50%',transform:'translateY(-50%)',
                  width:0,height:0,borderTop:'5px solid transparent',borderBottom:'5px solid transparent',
                  borderRight:'5px solid '+(isDark?'rgba(20,20,35,0.98)':'rgba(255,255,255,0.98)'),
                }}/>
              </div>
            )}
            <button
              onClick={()=>setActiveView(item.id)}
              onMouseEnter={()=>setHovered(item.id)}
              onMouseLeave={()=>setHovered(null)}
              className={'nav-icon '+(isActive?(isDark?'active-dark':'active-light'):'')}
              title=""
              style={{color:isActive?activeColor:isDark?'rgba(255,255,255,0.4)':'rgba(0,0,0,0.45)'}}>
              {item.icon}
              {item.badge&&<div className="badge" style={{position:'absolute',top:2,right:2,fontSize:8,padding:'1px 4px'}}>{item.badge}</div>}
            </button>
          </div>
        );
      })}
    </div>
  );
}
