// 通讯时间通信的channel命名空间
import { EVENT_TYPE } from './eventType'

export enum BRIDGE_EVENT {
  // 注册事件
  REGISTER = '__REGISTER__',
  // 调用事件
  CALL = '__CALL_',
  // 注销事件
  UNREGISTER = '__UNREGISTER__',
  // 主进程和渲染进程互相通讯发送的事件 channel 双向
  MAIN_COMMUNICATION_RENDERER = '__MAIN_COMMUNICATION_RENDERER__',
  // 主进程向渲染进程发送的事件 channel 单向
  MAIN_TO_RENDERER = '__MAIN_TO_RENDERER__',
  // 渲染进程向主进程发送的事件 channel 单向
  RENDERER_TO_MAIN = '__RENDERER_TO_MAIN__',
  // 渲染进程日志专用
  RENDERER_LOG = '__RENDERER_LOG__',
}

/**
 * 调用函数名称 主要为主进程监听到渲染进程发来的事件时，调用的函数名称
 */
export enum CALL_FN_NAME {
  TEST = 'test'
}

export type BridgeDataType<T> = {
  namespace: BRIDGE_EVENT
  eventName: EVENT_TYPE | CALL_FN_NAME
  success?: boolean
  data?: T
  msg?: string
}


export interface IpcMainErrorDataType {
  success: false
  isAxiosError?: boolean
  error: any
}

export type IpcMainDataType<T = any> = BridgeDataType<T> | IpcMainErrorDataType


// 日志插件 特有的命名空间（注意：和通讯的命名空间不是一样的）
export enum LOGGER_NAMESPACE {
  APP = 'app',
  DB = 'db'
}
