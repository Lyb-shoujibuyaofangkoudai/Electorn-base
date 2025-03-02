/**
 * 用于进程间通信的事件类型
 */
export enum EVENT_TYPE {
  TEST = "test",
  RENDERER_LOG = "RENDERER_LOG",
  // 窗口创建
  WINDOW_CREATED = "window-created",
  // 窗口关闭
  WINDOW_CLOSED = "window-closed",
  // 窗口最小化
  WINDOW_MINIMIZED = "window-minimized",
  // 窗口最大化
  WINDOW_MAXIMIZED = "window-maximized",
  // 窗口取消最大化
  WINDOW_UNMAXIMIZED = "window-unmaximized",
  // 窗口恢复
  WINDOW_RESTORED = "window-restored",
  // 注册窗口
  REGISTER_WINDOW = "register-window",
  // 注销窗口
  UNREGISTER_WINDOW = "unregister-window",
  // 设置详情
  SET_DETAILS = "set-details",
  //   LOL命令行参数详情
  SET_LOL_DETAILS = "set-lol-details",
  //   管理员
  ADMIN_DETAILS = "admin-details",
  // 日志配置信息
  LOGGER_DETAILS = "logger-details",
  // 调试信息 主要用于打包后的调试信息 在渲染进程中显示
  DEBUG_DETAILS = "debug-details",
  // 数据库
  DB_DETAILS = "db-details",
  // 打开文件夹
  OPEN_FOLDER = "open-folder",
  // LCU API是否可用
  API_CAN_USE = "api-can-use",
  // riot 服务器本地文件信息
  LOCAL_SERVER_DETAILS = "local-server-details",
  // 添加搜索历史
  DB_ADD_SEARCH_HISTORY = "db:addSearchHistory",
  // 获取最近搜索记录
  DB_GET_RECENT_SEARCHES = "db:getRecentSearches",
  // 删除搜索记录
  DB_DELETE_SEARCH_HISTORY = "db:deleteSearchHistory",
  // 清空所有搜索记录
  DB_CLEAR_ALL_HISTORY = "db:clearAllHistory",
}

export enum DATA_ACTION {
  ADD = "add",
  DELETE = "delete",
  UPDATE = "update",
  QUERY = "query",
  INIT = "init",
}

export enum EVENT_BUS_TYPE {
  LOL_CONN_SUCCESS = "lol-conn-success",
}
