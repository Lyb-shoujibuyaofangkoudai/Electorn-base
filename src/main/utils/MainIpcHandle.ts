import { MainWindow } from '../windows/MainWindow'
import { Core } from '../../manager/Core'
import { BRIDGE_EVENT, BridgeDataType } from '../../manager/plugins/Bridge/bridgeType'
import { EVENT_TYPE } from '../../manager/plugins/Bridge/eventType'
import { Bridge } from '../../manager/plugins/Bridge/Bridge'

export class MainIpcHandle {
  logger = Core.getInstance().logger
  bridge = Core.getInstance().bridge as Bridge

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
    )

    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_CLOSED,
      () => {
        MainWindow.instance.closeWindow()
      }
    )

    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_RESTORED,
      () => {
        MainWindow.instance.setWindowRestore()
      }
    )

    Core.getInstance().bridge.addCall(
      EVENT_TYPE.WINDOW_UNMAXIMIZED,
      () => {
        MainWindow.instance.setWindowUnmaximization()
      }
    )
  }

  /**
   * 用户修改配置信息 需要修改的话需要渲染段传入整个修改后的配置信息
   * @example
   * 渲染进程：ipc.call(EVENT_TYPE.SET_LOL_DETAILS,{
   *     "test": {
   *       "a": 1,
   *       "b": 4,
   *       "c": {
   *         "d": 90000
   *       }
   *     },
   *     "theme": {
   *       "name": "dark"
   *     },
   *     "main_window": {
   *       "width": 1280,
   *       "height": 960
   *     }
   *   })
   */
  settingHandle() {
    this.bridge.addCall(
      EVENT_TYPE.SET_DETAILS,
      (data?: BridgeDataType<any>): BridgeDataType<any> => {
        if ( data?.data ) {
          Core.getInstance().config?.setConfig(data?.data)
        }
        this.leagueHandle() // 写在这里可以保证渲染端已经在监听事件了

        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.SET_DETAILS,
          success: true,
          data: Core.getInstance().config?.configInfo
        }
      }
    )
  }

  leagueHandle() {
    this.bridge.send(
      EVENT_TYPE.SET_LOL_DETAILS,
      Core.getInstance().league?.cmdParsedInfo,
      "lol客户端参数详情"
    )
  }
}
