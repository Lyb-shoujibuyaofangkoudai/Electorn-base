/**
 * 渲染进程专用。
 */

import { BRIDGE_EVENT, BridgeDataType } from './bridgeType'
import { IpcRendererEvent } from 'electron'
import { EVENT_TYPE } from './eventType'
import { LOGGER_LEVEL } from '../logger/LoggerCommon'

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
      eventName: EVENT_TYPE.REGISTER_WINDOW
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
    if ( fns ) {
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
  async call<T = any>(eventName: EVENT_TYPE, data?: T, msg?: string) {
    let resultData = data
    if ( this.hasIsReactiveOrIsRef(data) ) {
      resultData = JSON.parse(JSON.stringify(data))
    }
    return window.electron.ipcRenderer.invoke(BRIDGE_EVENT.CALL, {
      namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
      eventName,
      success: true,
      data: resultData,
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
    const key = `${ BRIDGE_EVENT.MAIN_TO_RENDERER }:${ eventName }`
    if ( !this._eventMap.has(key) ) {
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
    let resultData = data
    if ( this.hasIsReactiveOrIsRef(data) ) {
      resultData = JSON.parse(JSON.stringify(data))
    }
    // 注意这里只能通过preload的方式来使用，不要会报错
    window.electron.ipcRenderer.send(BRIDGE_EVENT.RENDERER_TO_MAIN, {
      namespace: BRIDGE_EVENT.RENDERER_TO_MAIN,
      success: true,
      eventName,
      data: resultData,
      msg
    })
  }

  /**
   * 渲染进程向主进程发送日志 专用方法
   * @param type
   * @param msg
   */
  sendLog(type: LOGGER_LEVEL, msg: string) {
    // import.meta.env.PROD &&
    if ( type !== LOGGER_LEVEL.error ) return
    window.electron.ipcRenderer.send(BRIDGE_EVENT.RENDERER_LOG, {
      namespace: BRIDGE_EVENT.RENDERER_LOG,
      eventName: EVENT_TYPE.RENDERER_LOG,
      success: true,
      data: {
        type,
        msg
      },
      msg
    })
  }

  hasIsReactiveOrIsRef(obj: any): boolean {
    // 如果传入的不是对象或者为null，直接返回false
    if ( typeof obj !== 'object' || obj === null ) {
      return false
    }

    // 遍历对象的每个属性
    for ( const key in obj ) {
      if ( obj.hasOwnProperty(key) ) {
        const value = obj[key]

        // 检查当前值是否是响应式对象或引用对象
        if ( isReactive(value) || isRef(value) ) {
          return true
        }

        // 如果当前属性是对象或数组，递归检查
        if ( typeof value === 'object' ) {
          if ( this.hasIsReactiveOrIsRef(value) ) {
            return true
          }
        }
      }
    }

    // 如果没有找到 isReactive 或 isRef，返回 false
    return false
  }

}

