import { BrowserWindow, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { Logger } from '../logger/Logger'
import { LoggerCommon } from '../logger/LoggerCommon'
export class MainWindow {
  static _instance: MainWindow | null = null
  _window: BrowserWindow | null = null
  private logger = Logger.getInstance().logger


  static get instance() {
    if (!this._instance) {
      this._instance = new MainWindow()
    }
    return this._instance
  }


  _createWindow() {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
      width: 960,
      height: 720,
      frame: false,
      autoHideMenuBar: false,
      fullscreenable: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false,
        spellcheck: false,
        backgroundThrottling: false,
      }
    })
    mainWindow.menuBarVisible = false
    mainWindow.setHasShadow(true)

    mainWindow.on('ready-to-show', () => {
      this.logger.info({
        message: "主窗口创建成功",
        namespace: LoggerCommon.NAMESPACE.APP
      })
      mainWindow.show()
    })

    mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    // HMR for renderer base on electron-vite cli.
    // Load the remote URL for development or the local html file for production.
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
    }
    this._window = mainWindow
    return mainWindow
  }

  /**
   * 窗口最大化
   */
  setWindowMaximization() {
    this._window?.maximize()
  }

  /**
   * 关闭窗口
   */
  closeWindow() {
    this._window?.close()
  }

  /**
   * 最小化窗口
   */
  setWindowMinimization() {
    this._window?.minimize()
  }

  /**
   * 取消窗口最大化
   */
  setWindowUnmaximization() {
    this._window?.unmaximize()
  }

  /**
   * 窗口恢复大小
   */
  setWindowRestore() {
    this._window?.restore()
  }
}
