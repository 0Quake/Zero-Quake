const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  messageSend: (callback) => ipcRenderer.on("message2", callback),
  messageReturn: (title) => ipcRenderer.send("message", title),
});
