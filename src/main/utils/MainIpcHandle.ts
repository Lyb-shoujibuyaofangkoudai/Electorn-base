import {ipcMain} from "electron"
import { Constant } from '../../preload/utils/Constant'
import { MainWindow } from '../windows/MainWindow'
import { Core } from '../../manager/Core'
import {
  BRIDGE_EVENT,
  BridgeDataType, CALL_FN_NAME, EVENT_TYPE, NAMESPACE
} from '../../manager/plugins/Bridge/bridgeType'

export class MainIpcHandle {
  constructor() {
    this.init()
  }

  init() {
    this.windowHandle()
  }

  windowHandle() {
    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_MAXIMIZED, async () => {
      // console.log("窗口最大化")
      MainWindow.instance.setWindowMaximization()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_MINIMIZED, async () => {
      // console.log("窗口最小化")
      MainWindow.instance.setWindowMinimization()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_CLOSED, async () => {
      // console.log("窗口关闭")
      MainWindow.instance.closeWindow()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_RESTORED, async () => {
      // console.log("窗口恢复")
      MainWindow.instance.setWindowRestore()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_UNMAXIMIZED, async () => {
      // console.log("取消窗口最大化")
      MainWindow.instance.setWindowUnmaximization()
    })

    Core.getInstance().bridge.addCall(
      {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.WINDOW_CLOSED
      },
      ():BridgeDataType<string>  => {
        console.log("监听到渲染进程发送来的窗口关闭事件")
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: CALL_FN_NAME.TEST,
          success: true,
          data: '1.0.0',
        };
      }
    );
  }
}
