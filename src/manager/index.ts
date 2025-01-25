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
import { EVENT_TYPE } from './plugins/Bridge/eventType'

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
      // 一个一个添加插件，可以被自定义vite插件识别，注意：插件内部将类挂在Core上时需要挂在类名小写，因为插件是这么实现
      core.use(new Bridge())
      core.use(new Logger())
      core.use(new League())
      core.use(new Config())
    } catch ( e ) {
      if ( Core.getInstance().logger ) Core.getInstance().logger.error(e, LOGGER_NAMESPACE.APP)
    }
  }


  createWindow(): void {
    MainWindow.instance._createWindow()
  }


}
