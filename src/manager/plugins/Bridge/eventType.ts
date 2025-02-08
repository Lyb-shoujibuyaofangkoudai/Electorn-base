/**
 * 事件类型
 */
export enum EVENT_TYPE {
  TEST = 'test',
  RENDERER_LOG = 'RENDERER_LOG',
  // 窗口创建
  WINDOW_CREATED = 'window-created',
  // 窗口关闭
  WINDOW_CLOSED = 'window-closed',
  // 窗口最小化
  WINDOW_MINIMIZED = 'window-minimized',
  // 窗口最大化
  WINDOW_MAXIMIZED = 'window-maximized',
  // 窗口取消最大化
  WINDOW_UNMAXIMIZED = 'window-unmaximized',
  // 窗口恢复
  WINDOW_RESTORED = 'window-restored',
  // 注册窗口
  REGISTER_WINDOW = 'register-window',
  // 注销窗口
  UNREGISTER_WINDOW = 'unregister-window',
  // 设置详情
  SET_DETAILS = 'set-details',
  //   LOL命令行参数详情
  SET_LOL_DETAILS = 'set-lol-details',
  //   管理员
  ADMIN_DETAILS = 'admin-details',
  // 日志配置信息
  LOGGER_DETAILS = 'logger-details',
  // 调试信息 主要用于打包后的调试信息 在渲染进程中显示
  DEBUG_DETAILS = 'debug-details',


}
