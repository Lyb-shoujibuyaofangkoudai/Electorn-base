import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { MainIpcHandle } from '../main/utils/MainIpcHandle'
import { Core } from './Core'
import { Logger } from './plugins/logger/Logger'
import { Config } from './plugins/config'
import { MainWindow } from '../main/windows/MainWindow'
import { League } from './plugins/League'
import { Bridge } from './plugins/Bridge/Bridge'


import { LOGGER_NAMESPACE } from './plugins/Bridge/bridgeType'
import { Schemes } from './plugins/Schemes'
import { AxiosRequestConfig } from 'axios'
import { LeagueMainHelper } from './plugins/LeagueMainHelper'
import { Db } from './plugins/db/Db'
import { EventManager } from './plugins/EventBus'
import { SgpMainHelper } from './plugins/SgpMainHelper'
import { LeagueWs } from './plugins/LeagueWs/LeagueWs'

export class Manager {
  _logger: Logger | null = null

  constructor() {
    this.init()
  }

  init() {
    this.initPluginSys()
    app.whenReady().then(() => {
      electronApp.setAppUserModelId('com.electron')
      app.on('browser-window-created', (_, window) => {
        optimizer.watchWindowShortcuts(window)
      })
      this.createWindow()
      MainIpcHandle.getInstance()
    })
    app.on('activate', () => {
      if ( BrowserWindow.getAllWindows().length === 0 ) this.createWindow()
    })
    app.on('ready', () => {
      Core.getInstance().schemes!.handleProtocol()
    })
    app.on('window-all-closed', () => {
      if ( process.platform !== 'darwin' ) {
        app.quit()
      }
    })
    app.on("render-process-gone", function (event, webContents, details) {
      // 输出一下捕捉到的reason，实际可以根据不同的“原因”进行具体处理
      console.error("render-process-gone, reason => ", JSON.stringify(details));
      Core.getInstance().logger?.error(`render-process-gone, reason => ${ JSON.stringify(details) }`, LOGGER_NAMESPACE.APP)
      // 尝试关闭所有窗口
      app.quit();
    });
  }

  initPluginSys() {
    try {
      const core = new Core()
      // 一个一个添加插件，可以被自定义vite插件识别自动添加类型到corePlugin.d.ts文件中，注意：实现的插件内部需要将类名挂载到Core上，且类名小写
      core.use(new Logger(core)) // 提前传入core，让日志文件在插件执行注册之前提前挂载到Core的上
      core.use(new Bridge())
      core.use(new EventManager())
      core.use(new League())
      core.use(new Config())
      core.use(new Schemes())
      core.use(new Db())
      core.use(new LeagueMainHelper())
      // core.use(new LeagueWs())
      core.use(new SgpMainHelper())
      core.run()
      this._logger = Core.getInstance().logger
      Core.getInstance().logger?.info('插件系统初始化完成', LOGGER_NAMESPACE.APP)
    } catch ( e ) {
      if ( Core.getInstance().logger ) Core.getInstance().logger.error(`插件系统错误：${ e }`, LOGGER_NAMESPACE.APP)
    }
  }


  createWindow(): void {
    MainWindow.instance._createWindow()
  }


}
