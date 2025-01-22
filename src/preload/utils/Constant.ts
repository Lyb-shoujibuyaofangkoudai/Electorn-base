export class Constant {

  // electron app 事件
  static readonly APP_ELECTRON_EVENT = {
    BROWSER_WINDOW_CREATED: 'browser-window-created',
    ACTIVATE: 'activate',
    WINDOW_ALL_CLOSED: 'window-all-closed'
  }

//   窗口事件
  static readonly WINDOW_EVENT = {
    // 窗口被关闭
    WINDOW_CLOSED: 'window-closed',
    // 窗口被最大化
    WINDOW_MAXIMIZED: 'window-maximized',
    // 窗口被最小化
    WINDOW_MINIMIZED: 'window-minimized',
  //   取消窗口最大化
    WINDOW_UNMAXIMIZED: 'window-unmaximized',
    // 窗口恢复
    WINDOW_RESTORED: 'window-restored',
  }


}
// electron app 事件
export enum APP_ELECTRON_EVENT {
  BROWSER_WINDOW_CREATED =  'browser-window-created',
  ACTIVATE = 'activate',
  WINDOW_ALL_CLOSE =  'window-all-closed'
}

