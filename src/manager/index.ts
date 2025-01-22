import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { MainIpcHandle } from '../main/utils/MainIpcHandle'
import { Core } from './Core'
import { Logger } from './plugins/logger/Logger'
import { Config } from './plugins/config'
import { MainWindow } from '../main/windows/MainWindow'
import { League } from './plugins/League'
import { Bridge } from './plugins/Bridge/Bridge'


import { NAMESPACE } from './plugins/Bridge/bridgeType'

export class Manager {
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
      new MainIpcHandle()

      app.on('activate', () => {
        if ( BrowserWindow.getAllWindows().length === 0 ) this.createWindow()
      })
    })


    app.on('window-all-closed', () => {
      if ( process.platform !== 'darwin' ) {
        app.quit()
      }
    })
  }

  initPluginSys() {
    try {
      const core = new Core()
      core.use(
        new Logger(), // 日志插件
        new Config(), // 配置插件
        new League(), // LOL客户端相关插件
        new Bridge(), // 进程通讯插件
      )

      Core.getInstance().logger.info(`命令解析数据结果：${ Core.getInstance().league?.cmdParsedInfo?.authToken }`, NAMESPACE.APP)
    } catch ( e ) {
      if ( Core.getInstance() ) Core.getInstance().logger.error(e, NAMESPACE.APP)
    }
  }


  createWindow(): void {
    MainWindow.instance._createWindow()
  }


}
