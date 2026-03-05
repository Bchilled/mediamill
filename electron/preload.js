const{contextBridge,ipcRenderer}=require('electron');
contextBridge.exposeInMainWorld('forge',{
  // Window
  minimize:()=>ipcRenderer.invoke('window:minimize'),
  maximize:()=>ipcRenderer.invoke('window:maximize'),
  close:()=>ipcRenderer.invoke('window:close'),
  // Channels
  getChannels:()=>ipcRenderer.invoke('channels:getAll'),
  createChannel:(d)=>ipcRenderer.invoke('channels:create',d),
  updateChannel:(id,d)=>ipcRenderer.invoke('channels:update',id,d),
  deleteChannel:(id)=>ipcRenderer.invoke('channels:delete',id),
  // Videos
  getVideos:(channelId,f)=>ipcRenderer.invoke('videos:getAll',channelId,f),
  getVideo:(id)=>ipcRenderer.invoke('videos:get',id),
  createVideo:(d)=>ipcRenderer.invoke('videos:create',d),
  updateVideo:(id,d)=>ipcRenderer.invoke('videos:update',id,d),
  deleteVideo:(id)=>ipcRenderer.invoke('videos:delete',id),
  approveVideo:(id)=>ipcRenderer.invoke('videos:approve',id),
  // Pipeline stages
  startPipeline:(id)=>ipcRenderer.invoke('pipeline:start',id),
  pipelineStatus:(id)=>ipcRenderer.invoke('pipeline:status',id),
  generateScript:(id)=>ipcRenderer.invoke('pipeline:generateScript',id),
  gatherAssets:(id)=>ipcRenderer.invoke('pipeline:gatherAssets',id),
  renderVoice:(id)=>ipcRenderer.invoke('pipeline:renderVoice',id),
  composeVideo:(id)=>ipcRenderer.invoke('pipeline:compose',id),
  // Ideas
  getIdeas:(channelId,f)=>ipcRenderer.invoke('ideas:getAll',channelId,f),
  createIdea:(d)=>ipcRenderer.invoke('ideas:create',d),
  updateIdea:(id,d)=>ipcRenderer.invoke('ideas:update',id,d),
  deleteIdea:(id)=>ipcRenderer.invoke('ideas:delete',id),
  approveIdea:(id)=>ipcRenderer.invoke('ideas:approve',id),
  rejectIdea:(id)=>ipcRenderer.invoke('ideas:reject',id),
  scanIdeas:(channelId)=>ipcRenderer.invoke('ideas:scan',channelId),
  // Shell / system
  openExternal:(url)=>ipcRenderer.invoke('shell:openExternal',url),
  testApiKey:(service,key)=>ipcRenderer.invoke('settings:testKey',service,key),
  // Channel logos
  generateChannelLogos:(name,topic)=>ipcRenderer.invoke('channel:generateLogos',name,topic),
  generateChannelBanner:(name,topic)=>ipcRenderer.invoke('channel:generateBanner',name,topic),
  pushBrandingToYouTube:(channelId,images)=>ipcRenderer.invoke('channel:pushBranding',channelId,images),
  // YouTube
  youtubeConnect:(channelId)=>ipcRenderer.invoke('youtube:connect',channelId),
  youtubeStatus:(channelId)=>ipcRenderer.invoke('youtube:status',channelId),
  youtubeUpload:(videoId)=>ipcRenderer.invoke('youtube:upload',videoId),
  youtubeAnalytics:(channelId,days)=>ipcRenderer.invoke('youtube:analytics',channelId,days),
  youtubeDisconnect:(channelId)=>ipcRenderer.invoke('youtube:disconnect',channelId),
  // Agents
  getAgentConfig:()=>ipcRenderer.invoke('agents:getConfig'),
  updateAgentConfig:(c)=>ipcRenderer.invoke('agents:updateConfig',c),
  // Tasks
  getTasks:(f)=>ipcRenderer.invoke('tasks:getAll',f),
  cancelTask:(id)=>ipcRenderer.invoke('tasks:cancel',id),
  retryTask:(id)=>ipcRenderer.invoke('tasks:retry',id),
  // Settings
  getSettings:()=>ipcRenderer.invoke('settings:get'),
  updateSettings:(d)=>ipcRenderer.invoke('settings:update',d),
  getSystemStats:()=>ipcRenderer.invoke('settings:systemStats'),
  getSystemStatus:()=>ipcRenderer.invoke('system:status'),
});
