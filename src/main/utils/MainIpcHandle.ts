import { ipcMain } from 'electron'
import { Constant } from '../../preload/utils/Constant'
import { MainWindow } from '../windows/MainWindow'
import { Core } from '../../manager/Core'
import {
  BRIDGE_EVENT,
  BridgeDataType, CALL_FN_NAME, EVENT_TYPE
} from '../../manager/plugins/Bridge/bridgeType'

export class MainIpcHandle {
  constructor() {
    this.init()
  }

  init() {
    this.windowHandle()
  }

  windowHandle() {
    Core.getInstance().bridge.addCall(
      {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.WINDOW_MAXIMIZED
      },
      () => {
        MainWindow.instance.setWindowMaximization()
      }
    )

    Core.getInstance().bridge.addCall(
      {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.WINDOW_MINIMIZED
      },
      () => {
        MainWindow.instance.setWindowMinimization()
      }
    );

    Core.getInstance().bridge.addCall(
      {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.WINDOW_CLOSED
      },
      () => {
        MainWindow.instance.closeWindow()
      }
    );

    Core.getInstance().bridge.addCall(
      {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.WINDOW_RESTORED
      },
      () => {
        MainWindow.instance.setWindowRestore()
      }
    );

    Core.getInstance().bridge.addCall(
      {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.WINDOW_UNMAXIMIZED
      },
      () => {
        MainWindow.instance.setWindowUnmaximization()
      }
    );
  }
}
