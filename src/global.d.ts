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

  declare namespace NTheme {
    /** 颜色类型 */
    type ColorType = 'primary' | 'info' | 'success' | 'warning' | 'error'
    /** 颜色类型大写值 */
    type ColorTypeCase = 'Primary' | 'Info' | 'Success' | 'Warning' | 'Error'
    /** 颜色场景 */
    type ColorScene = '' | 'suppl' | 'hover' | 'pressed'
    /** 颜色场景大写值 */
    type ColorSceneCase = '' | 'Suppl' | 'Hover' | 'Pressed'
    /** 按钮颜色场景 */
    type ButtonColorScene = '' | 'hover' | 'pressed' | 'focus' | 'disabled'
    /** 按钮颜色场景大写值 */
    type ButtonColorSceneCase = '' | 'Hover' | 'Pressed' | 'Focus' | 'Disabled'
    type NeutralThemeItemType = {
      color: string,
      effects: string[],
      title: string
    }
    type NeutralThemeType = {
      neutralPopover: NeutralThemeItemType
      neutralCard: NeutralThemeItemType
      neutralModal: NeutralThemeItemType
      neutralBody: NeutralThemeItemType

    }
    // 主题配置
    type Config = {
      [key in NTheme.ColorType]: string
    }
  }

}
