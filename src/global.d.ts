// 拓展window对象
import { BridgeDataType } from './manager/plugins/Bridge/bridgeType'

declare global {
  interface Window {
    electron: {
      ipcRenderer: {
        invoke<T = any>(channel: string, data: BridgeDataType<T>): BridgeDataType<T>,
        send<T = any>(channel: string, data: BridgeDataType<T>): void;
        on<T = any>(channel: string, listener: (event: Electron.IpcRendererEvent, data: BridgeDataType<T>) => void): void;
        once<T = any>(channel: string, listener: (event: Electron.IpcRendererEvent, data: BridgeDataType<T>) => void): void;
        // 添加其他你需要的方法
      };
      // 添加其他你需要的属性或方法
    };
  }



}
