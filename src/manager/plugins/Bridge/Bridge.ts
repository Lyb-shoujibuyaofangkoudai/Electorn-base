import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { BRIDGE_EVENT, BridgeDataType, EVENT_TYPE, IpcMainDataType } from './bridgeType'
import { ipcMain, IpcMainInvokeEvent, webContents } from 'electron'
import { isAxiosError } from 'axios'


export class Bridge implements IPlugin {
  static id: string = 'bridge'
  name = Bridge.id

  _renderersWebContentIdsSet = new Set()
  _callMap = new Map<string, Function>()

  constructor() {
    this._handleRegister = this._handleRegister.bind(this)
  }

  init(core: Core): void {
    // 监听渲染进程的register 事件 注意：不使用箭头函数会丢失this，需要在构造函数中绑定
    ipcMain.handle(BRIDGE_EVENT.REGISTER, this._handleRegister)
    // 监听渲染进程的call 事件 使用了箭头函数不会丢失this
    ipcMain.handle(BRIDGE_EVENT.CALL, this._handleCall)
    core[this.name] = core.getPlugin(this.name)
  }

  destroy(core: Core) {
    ipcMain.removeHandler(BRIDGE_EVENT.REGISTER)
    ipcMain.removeHandler(BRIDGE_EVENT.CALL)
  }

  /**
   * 用于主进程注册函数，用于渲染进程调用主进程的函数
   * 回调函数传入的data是渲染进程传过来的数据，也需要满足 BridgeDataType 的数据结构
   * @param data BridgeDataType
   * @param cb
   * @example Core.getInstance().bridge.addCall(
   *   LOGGER_NAMESPACE.APP,
   *   'appVersion',
   *   (data: BridgeDataType<string>) => {
   *     return {
   *       namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
   *       eventName: CALL_FN_NAME.TEST,
   *       success: true,
   *       data: '1.0.0',
   *     };
   *   }
   * );
   *
   *
   */
  addCall<T = any>(data: Pick<BridgeDataType<T>, 'namespace' | 'eventName'>, cb: (data?: BridgeDataType<T>) => Promise<BridgeDataType<T>> | BridgeDataType<T> | void) {
    const key = `${ data.namespace }:${ data.eventName }`
    if ( this._callMap.has(key) ) {
      throw new Error(`Function "${ data.eventName }" in namespace "${ data.namespace }" already exists`)
    }

    this._callMap.set(key, cb)
  }

  /**
   * 主进程向渲染进程通讯（单向）
   * @param eventName
   * @param data T
   * @param msg
   */
  send<T>(eventName: EVENT_TYPE, data?: T, msg?: string) {
    Core.getInstance().logger.info(`发送${this._renderersWebContentIdsSet.size}`, eventName)
    this._renderersWebContentIdsSet.forEach((id) => {
      Core.getInstance().logger.info(`Send event ${ eventName } to renderer process id = ${id}`, eventName)
        webContents.fromId(id as number)?.send(BRIDGE_EVENT.MAIN_TO_RENDERER, {
          namespace: BRIDGE_EVENT.MAIN_TO_RENDERER,
          eventName,
          data,
          msg
        })
      }
    )
  }

  /**
   * 处理渲染进程的注册事件，主要存储渲染进程webContents的id
   * @param e
   * @param action
   */
  _handleRegister(e: IpcMainInvokeEvent, action: BridgeDataType<any>) {
    const id: number = e.sender.id
    Core.getInstance().logger.info(`注册窗口的id = ${id}`, action)
    if ( action.eventName === EVENT_TYPE.REGISTER_WINDOW && !this._renderersWebContentIdsSet.has(id) ) {
      this._renderersWebContentIdsSet.add(id)
    } else if ( action.eventName === EVENT_TYPE.UNREGISTER_WINDOW && this._renderersWebContentIdsSet.has(id) ) {
      this._renderersWebContentIdsSet.delete(id)
    }
  }

  /**
   * 处理渲染进程的调用事件，主要调用主进程中保存在函数_callMap中对应的方法
   * @param _
   * @param data
   */
  _handleCall = (
    _: IpcMainInvokeEvent,
    data: BridgeDataType<any>
  ): BridgeDataType<any> => {
    const key = `${ data.namespace }:${ data.eventName }`
    const fn = this._callMap.get(key)
    if ( !fn ) {
      throw new Error(`No function "${ data.eventName }" in namespace "${ data.namespace }"`)
    }

    return Bridge._standardizeIpcData(() => fn(data))
  }

  private static _standardizeIpcData(wrappedFn: Function) {
    try {
      const result = wrappedFn()
      if ( result instanceof Promise ) {
        return result
          .then((res: BridgeDataType<any>) => res)
          .catch((error: any) => Bridge._handleError(error))
      } else {
        return result
      }
    } catch ( error ) {
      return Bridge._handleError(error)
    }
  }

  /**
   * 处理一般错误和 axios 错误, 包含特例, 对业务错误网开一面
   * @param error
   * @returns
   */
  private static _handleError(error: any): IpcMainDataType {
    if ( isAxiosError(error) ) {
      const errorWithResponse = {
        response: error.response
          ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          }
          : null,
        code: error.code,
        message: error.message,
        stack: error.stack,
        name: error.name
      }

      return {
        success: false,
        isAxiosError: true,
        error: errorWithResponse
      }
    } else if ( error instanceof Error ) {
      return {
        success: false,
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      }
    }

    return {
      success: false,
      error: { message: 'An error occurred' }
    }
  }

}
