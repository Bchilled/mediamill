import{suggestFix}from './fixRouter';

let errors=[];
let listeners=[];
let _persisting=false; // prevent re-entrant IPC calls

function notify(){listeners.forEach(fn=>fn([...errors]));}

export function subscribeErrors(fn){
  listeners.push(fn);
  fn([...errors]);
  return()=>{listeners=listeners.filter(l=>l!==fn);};
}

export function logError(source,message,detail='',stack=''){
  // Never log errors about logging — breaks the loop
  const msg=String(message||'');
  if(msg.includes('log:error')||msg.includes('No handler registered for')||msg.includes('logError'))return;

  const suggestion=suggestFix(source,msg);
  const entry={
    id:Date.now()+Math.random(),
    timestamp:new Date().toISOString(),
    source,
    message:msg,
    detail:String(detail||''),
    stack:String(stack||''),
    resolved:false,
    fixAction:suggestion.action,
    fixLabel:suggestion.label,
  };
  errors=[entry,...errors].slice(0,200);
  notify();

  // Persist to main — guarded against re-entrance
  if(!_persisting){
    _persisting=true;
    try{window.forge.logError(entry);}catch(e){}
    _persisting=false;
  }
}

export function resolveError(id){
  errors=errors.map(e=>e.id===id?{...e,resolved:true}:e);
  notify();
}

export function clearErrors(){errors=[];notify();}

export function installGlobalErrorHandlers(){
  window.onerror=(msg,src,line,col,err)=>{
    logError('window',msg,`${src}:${line}`,err?.stack||'');
    return false;
  };
  window.onunhandledrejection=e=>{
    const msg=e.reason?.message||String(e.reason||'');
    // Skip IPC-related promise rejections — they self-resolve
    if(msg.includes('No handler')||msg.includes('log:error'))return;
    logError('promise',msg,'Unhandled promise rejection',e.reason?.stack||'');
  };
  const origError=console.error.bind(console);
  console.error=(...args)=>{
    origError(...args);
    const msg=args.map(a=>typeof a==='object'?JSON.stringify(a):String(a)).join(' ');
    // Skip known noise — Vite HMR, ResizeObserver, IPC handler errors
    if(
      msg.includes('[vite]')||
      msg.includes('ResizeObserver')||
      msg.includes('No handler registered')||
      msg.includes('log:error')||
      msg.includes('ipcRenderer')
    )return;
    logError('console',msg.slice(0,200));
  };
}
