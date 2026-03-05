import{suggestFix}from './fixRouter';

let errors=[];
let listeners=[];

function notify(){listeners.forEach(fn=>fn([...errors]));}

export function subscribeErrors(fn){
  listeners.push(fn);
  fn([...errors]);
  return()=>{listeners=listeners.filter(l=>l!==fn);};
}

export function logError(source,message,detail='',stack=''){
  const suggestion=suggestFix(source,message);
  const entry={
    id:Date.now()+Math.random(),
    timestamp:new Date().toISOString(),
    source,
    message:String(message),
    detail:String(detail||''),
    stack:String(stack||''),
    resolved:false,
    fixAction:suggestion.action,
    fixLabel:suggestion.label,
  };
  errors=[entry,...errors].slice(0,200);
  notify();
  try{window.forge.logError(entry);}catch(e){}
}

export function resolveError(id){
  errors=errors.map(e=>e.id===id?{...e,resolved:true}:e);
  notify();
}

export function clearErrors(){
  errors=[];
  notify();
}

export function installGlobalErrorHandlers(){
  window.onerror=(msg,src,line,col,err)=>{
    logError('window',msg,`${src}:${line}`,err?.stack||'');
    return false;
  };
  window.onunhandledrejection=e=>{
    logError('promise',e.reason?.message||String(e.reason),'Unhandled promise rejection',e.reason?.stack||'');
  };
  const origError=console.error.bind(console);
  console.error=(...args)=>{
    origError(...args);
    const msg=args.map(a=>typeof a==='object'?JSON.stringify(a):String(a)).join(' ');
    if(msg.includes('[vite]')||msg.includes('ResizeObserver'))return;
    logError('console',msg.slice(0,200));
  };
}
