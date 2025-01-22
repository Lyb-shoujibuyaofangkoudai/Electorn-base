/**
 * 调用函数名称 主要为主进程监听到渲染进程发来的事件时，调用的函数名称
 */
export enum CALL_FN_NAME {
  TEST = 'test'
}


export enum NAMESPACE {
  APP = 'app', // APP级别
  WINDOW = 'window', // 窗口级别
}
