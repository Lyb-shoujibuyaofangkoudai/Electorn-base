import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { MainWindow } from './windows/MainWindow'
import { MainIpcHandle } from './utils/MainIpcHandle'
import { Core } from '../manager'
import { Logger } from '../manager/plugins/logger/Logger'
import { NAMESPACE } from '../manager/plugins/logger/LoggerCommon'

init()
function init() {
  app.whenReady().then(() => {
    electronApp.setAppUserModelId('com.electron')
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    createPluginSys()
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
function createPluginSys() {
  const core = new Core();
  core.use(new Logger())
  core.run()
}


function createWindow(): void {
  MainWindow.instance._createWindow()
}



