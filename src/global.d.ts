// 拓展window对象
import { BridgeDataType } from './src/manager/plugins/Bridge/bridgeType'

interface Window {
  electron: {
    ipcRenderer: {
      invoke(channel: string, ...args: any[]): BridgeDataType<T>,
      send(channel: string, ...args: any[]): void;
      on(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void;
      once(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void;
      // 添加其他你需要的方法
    };
    // 添加其他你需要的属性或方法
  };
}


interface LOLToolsAddon {
  /**
   * 获取进程 PID
   */
  getProcessCommandLine(pid: number): string

  /**
   * 获取进程名的 PID
   * @param name 进程名
   */
  getPidByName(name: string): number
}
