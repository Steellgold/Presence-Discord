const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  onLog:          cb => ipcRenderer.on("log",        (_, v) => cb(v)),
  onLogs:         cb => ipcRenderer.on("logs-batch", (_, v) => cb(v)),
  onState:        cb => ipcRenderer.on("state",      (_, v) => cb(v)),
  closeWindow:    ()  => ipcRenderer.send("close-window"),
  minimizeWindow: ()  => ipcRenderer.send("minimize-window"),
});