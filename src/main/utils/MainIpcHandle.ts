import { MainWindow } from '../windows/MainWindow'
import { Core } from '../../manager/Core'
import { BRIDGE_EVENT, BridgeDataType, LOGGER_NAMESPACE } from '../../manager/plugins/Bridge/bridgeType'
import { DATA_ACTION, EVENT_BUS_TYPE, EVENT_TYPE } from '../../manager/plugins/Bridge/eventType'
import { Bridge } from '../../manager/plugins/Bridge/Bridge'
import lolTools from 'lol-tools.node'
import { openFolder } from './util'
import { Settings } from '../../manager/plugins/db/entities/Settings'
import { EventManager } from '../../manager/plugins/EventBus'


/**
 * 同意管理主进程和渲染进程的通信
 */
export class MainIpcHandle {
  private static _instance: MainIpcHandle | null = null
  _logger = Core.getInstance().logger
  bridge = Core.getInstance().bridge as Bridge
  _tools = lolTools
  _eventManager:EventManager = Core.getInstance().eventManager!

  static getInstance(): MainIpcHandle {
    if ( !MainIpcHandle._instance ) {
      MainIpcHandle._instance = new MainIpcHandle()
    }
    return MainIpcHandle._instance
  }

  constructor() {
    this.init()
  }

  async init() {
    this.windowHandle()
    this.adminHandle()
    this.loggerHandle()
    this.dbHandle()
    this.settingHandle()
    this.folderHandle()
    this.leagueHandle()
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
        if(data?.data?.action === DATA_ACTION.INIT ) {
          //   初始化配置信息
          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.SET_DETAILS,
            success: true,
            data: Settings.defaultSettings
          }
        }

        if ( data?.data?.config && data?.data?.action === DATA_ACTION.UPDATE ) {
          Core.getInstance().config.setConfig(data?.data.config)
          Core.getInstance().config.settingsDao.updateSetting('config', data?.data.config)
        }

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
    this.bridge.addCall(
      EVENT_TYPE.SET_LOL_DETAILS,
      (): BridgeDataType<any> => {
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.SET_LOL_DETAILS,
          data: Core.getInstance().league?.cmdParsedInfo
        }
      }
    )

    this._eventManager.on(EVENT_BUS_TYPE.LOL_CONN_SUCCESS,() => {
      this._logger?.info('连接LOL客户端成功', LOGGER_NAMESPACE.APP)
      this.bridge.send(
        EVENT_TYPE.SET_LOL_DETAILS,
        Core.getInstance().league?.cmdParsedInfo,
        "lol客户端参数详情"
      )
    })
  }

  adminHandle() {
    this.bridge.addCall(
      EVENT_TYPE.ADMIN_DETAILS,
      (data?: BridgeDataType<{
        applyAdmin: boolean
      }>): BridgeDataType<any> => {
        if ( data?.data?.applyAdmin ) {
          console.log('申请管理员权限')
          if ( this._tools.requestAdmin() )
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

  /**
   * 日志相关的handle
   */
  loggerHandle() {
    this.bridge.addCall(
      EVENT_TYPE.LOGGER_DETAILS,
      (): BridgeDataType<any> => {
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.LOGGER_DETAILS,
          data: {
            loggerSavePath: this._logger?.logDirPath
          }
        }
      }
    )
  }

  /**
   * 数据库相关的handle
   */
  dbHandle() {
    this.bridge.addCall(
      EVENT_TYPE.DB_DETAILS,
      (): BridgeDataType<any> => {
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.DB_DETAILS,
          data: {
            dbPath: Core.getInstance().db?._dbPath
          }
        }
      }
    )
  }

  /**
   * 文件夹handle
   */
  folderHandle() {
    this.bridge.onEvent(EVENT_TYPE.OPEN_FOLDER, (data?: BridgeDataType<string>) => {
      const filePath = data?.data
      if ( !filePath ) return
      openFolder(filePath)
    })
  }

  debugHandle(info: any) {
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
