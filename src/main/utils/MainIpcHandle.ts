import { MainWindow } from '../windows/MainWindow'
import { Core } from '../../manager/Core'
import { BRIDGE_EVENT, BridgeDataType } from '../../manager/plugins/Bridge/bridgeType'
import { EVENT_TYPE } from '../../manager/plugins/Bridge/eventType'
import { Bridge } from '../../manager/plugins/Bridge/Bridge'
// import lolTools from '../../../resources/addons/lol-tools.node'
import lolTools from 'lol-tools.node'


/**
 * 同意管理主进程和渲染进程的通信
 */
export class MainIpcHandle {
  private static _instance: MainIpcHandle | null = null
  logger = Core.getInstance().logger
  bridge = Core.getInstance().bridge as Bridge
  _tools = lolTools

  static getInstance(): MainIpcHandle {
    if ( !MainIpcHandle._instance ) {
      MainIpcHandle._instance = new MainIpcHandle()
    }
    return MainIpcHandle._instance
  }
  constructor() {
    this.init()
  }

  init() {
    this.windowHandle()
    this.settingHandle()
    this.adminHandle()
    this.loggerHandle()
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
    if(!Core.getInstance().league?.cmdParsedInfo) return
    this.bridge.send(
      EVENT_TYPE.SET_LOL_DETAILS,
      Core.getInstance().league?.cmdParsedInfo,
      "lol客户端参数详情"
    )
  }

  adminHandle() {
    this.bridge.addCall(
      EVENT_TYPE.ADMIN_DETAILS,
      (data?: BridgeDataType<{
        applyAdmin:boolean
      }>): BridgeDataType<any> => {
        if(data?.data?.applyAdmin) {
          if(this._tools.requestAdmin())
            return {
              namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
              eventName: EVENT_TYPE.ADMIN_DETAILS,
              data: true
            }
          else return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.ADMIN_DETAILS,
            data: false
          }
        } else return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.ADMIN_DETAILS,
          data: this._tools.isElevated()
        }
      }
    )
  }

  loggerHandle() {
    this.bridge.addCall(
      EVENT_TYPE.LOGGER_DETAILS,
      (): BridgeDataType<any> => {
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.LOGGER_DETAILS,
          data: {
            loggerSavePath: Core.getInstance().logger?.logDirPath,
          }
        }
      }
    )
  }

  debugHandle(info:any) {
    this.bridge.addCall(
      EVENT_TYPE.DEBUG_DETAILS,
      (): BridgeDataType<any> => {
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.DEBUG_DETAILS,
          data: info
        }
      })
  }
}
