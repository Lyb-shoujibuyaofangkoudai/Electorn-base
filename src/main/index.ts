import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { MainWindow } from './windows/MainWindow'
import { MainIpcHandle } from './utils/MainIpcHandle'
import { Core } from '../manager/Core'
import { Logger } from '../manager/plugins/logger/Logger'
import { NAMESPACE } from '../manager/plugins/logger/LoggerCommon'
import { Config } from '../manager/plugins/config'

init()
function init() {
  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    initPluginSys()
    createWindow()
    new MainIpcHandle()

    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })


  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
function initPluginSys() {
  try {
    const core = new Core()
    core.use(new Logger())
    core.use(new Config())
  } catch ( e ) {
    if(Core.getInstance()) Core.getInstance().logger.error(e,NAMESPACE.APP)
  }
}


function createWindow(): void {
  MainWindow.instance._createWindow()
}



