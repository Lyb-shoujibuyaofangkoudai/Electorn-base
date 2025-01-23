/**
 * 渲染进程专用。
 */

import { BRIDGE_EVENT, BridgeDataType } from './bridgeType'
import { IpcRendererEvent } from 'electron'
import { EVENT_TYPE } from './eventType'

/**
 * 桥接
 * 渲染进程专用（vue专用）
 */
export class BridgeRenderer {
  static id = 'bridge_renderer'
  name = BridgeRenderer.id
  static instance: BridgeRenderer | null = null
  _eventMap = new Map<string, Set<Function>>()
  logger = useLogger()

  static getInstance() {
    if ( !BridgeRenderer.instance ) BridgeRenderer.instance = new BridgeRenderer()
    return BridgeRenderer.instance
  }

   constructor() {
     this.init()
  }

  async init() {
    // 监听主进程发送过来的事件（单向）
    window.electron.ipcRenderer.on(BRIDGE_EVENT.MAIN_TO_RENDERER, this._handleDispatchEvent)
    // 通知主进程，注册自己（当前窗口）
    window.electron.ipcRenderer.invoke(BRIDGE_EVENT.REGISTER, {
      namespace: BRIDGE_EVENT.REGISTER,
      eventName: EVENT_TYPE.REGISTER_WINDOW,
    })
  }

  /**
   * 处理主进程发送过来的事件
   * @param _event
   * @param data
   */
  _handleDispatchEvent = (_event: IpcRendererEvent, data: BridgeDataType<any>) => {
    const key = `${ data.namespace }:${ data.eventName }`
    const fns = this._eventMap.get(key)
    if(fns) {
      for ( const fn of fns ) {
        fn(data)
      }
    }
  }

  /**
   * 通知主进程调用对应的函数，会执行类Bridge的_handleCall方法
   * 双向通讯
   * @param eventName
   * @param data
   * @param msg
   */
  async call<T = any>(eventName:EVENT_TYPE,data?: T,msg?: string ) {
    return await window.electron.ipcRenderer.invoke(BRIDGE_EVENT.CALL, {
      namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
      eventName,
      success: true,
      data,
      msg
    })
  }

  /**
   *
   * 监听主进程发送过来的事件 单向通讯
   * @param eventName
   * @param cb
   */
  onEvent<T>(eventName: EVENT_TYPE, cb: (data?: BridgeDataType<T>) => Promise<BridgeDataType<T>> | BridgeDataType<T> | void) {
    const key = `${BRIDGE_EVENT.MAIN_TO_RENDERER}:${eventName}`
    if (!this._eventMap.has(key)) {
      this._eventMap.set(key, new Set())
    }

    this._eventMap.get(key)!.add(cb)

    return () => {
      this._eventMap.get(key)!.delete(cb)
    }
  }

  /**
   * 渲染进程向主进程通讯（单向）
   * @param eventName
   * @param data T
   * @param msg
   */
  send<T = any>(eventName: EVENT_TYPE, data?: T, msg?: string) {
    // 注意这里只能通过preload的方式来使用，不要会报错
    window.electron.ipcRenderer.send(BRIDGE_EVENT.RENDERER_TO_MAIN, {
      namespace: BRIDGE_EVENT.RENDERER_TO_MAIN,
      success: true,
      eventName,
      data,
      msg
    })
  }

}

