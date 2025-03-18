const { contextBridge, ipcRenderer } = require('electron');

// 暴露ipcRenderer API给渲染进程
contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
    on: (channel, func) => {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    },
    once: (channel, func) => {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    },
    removeListener: (channel, func) => {
      ipcRenderer.removeListener(channel, func);
    }
  }
});