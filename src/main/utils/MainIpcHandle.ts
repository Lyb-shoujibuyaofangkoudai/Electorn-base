import { MainWindow } from '../windows/MainWindow'
import { Core } from '../../manager/Core'
import {
  BRIDGE_EVENT,
  BridgeDataType, CALL_FN_NAME
} from '../../manager/plugins/Bridge/bridgeType'
import { EVENT_TYPE } from '../../manager/plugins/Bridge/eventType'

export class MainIpcHandle {
  logger = Core.getInstance().logger
  constructor() {
    this.init()
  }

  init() {
    this.windowHandle()
    this.settingHandle()
  }

  windowHandle() {
    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_MAXIMIZED,
      () => {
        MainWindow.instance.setWindowMaximization()
      }
    )

    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_MINIMIZED,
      () => {
        MainWindow.instance.setWindowMinimization()
      }
    );

    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_CLOSED,
      () => {
        MainWindow.instance.closeWindow()
      }
    );

    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_RESTORED,
      () => {
        MainWindow.instance.setWindowRestore()
      }
    );

    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_UNMAXIMIZED,
      () => {
        MainWindow.instance.setWindowUnmaximization()
      }
    );
  }

  settingHandle() {
    Core.getInstance().bridge.addCall(
      EVENT_TYPE.SET_LOL_DETAILS,
      (data): BridgeDataType<any> => {
        console.log("有传过来的数据：",data)
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.SET_LOL_DETAILS,
          success: true,
          data: Core.getInstance().config?.configInfo
        }
      }
    )
  }
}
