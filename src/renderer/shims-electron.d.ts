// shims-electron.d.ts
// 拓展window对象
interface Window {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: any[]):void,
      send(channel: string, ...args: any[]): void;
      on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void;
      once(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void;
      // 添加其他你需要的方法
    };
    // 添加其他你需要的属性或方法
  };
}
