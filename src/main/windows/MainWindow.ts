import { app, BrowserWindow, shell } from 'electron'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import { Core } from '../../manager/Core'
import { formatError } from '../../manager/utils/error'
import { LOGGER_NAMESPACE } from '../../manager/plugins/Bridge/bridgeType'
import logo from '../../../resources/icon.ico?asset'

export class MainWindow {
  static PARTITION_ID = 'main'
  static _instance: MainWindow | null = null
  _window: BrowserWindow | null = null
  private logger = Core.getInstance().logger


  static get instance() {
    if ( !MainWindow._instance ) {
      MainWindow._instance = new MainWindow()
    }
    return MainWindow._instance
  }


  _createWindow() {
    try { // Create the browser window.
      // app.commandLine.appendSwitch('ignore-certificate-errors')
      const width = Core.getInstance().config.getValue('main_window.width') ?? 960
      const height = Core.getInstance().config.getValue('main_window.height') ?? 720
      const mainWindow = new BrowserWindow({
        width,
        height,
        frame: false,
        autoHideMenuBar: false,
        fullscreenable: false,
        icon: logo,
        webPreferences: {
          preload: join(__dirname, '../preload/index.js'),
          sandbox: false,
          spellcheck: false,
          backgroundThrottling: false,
          partition: MainWindow.PARTITION_ID
        }
      })
      mainWindow.menuBarVisible = false
      // 打开调试工具
      mainWindow.webContents.openDevTools({ mode: 'bottom' })
      mainWindow.setHasShadow(true)

      mainWindow.on('ready-to-show', () => {
        this.logger.info('主窗口创建成功', LOGGER_NAMESPACE.APP)
        mainWindow.show()
      })

      mainWindow.webContents.setWindowOpenHandler((details) => {
        shell.openExternal(details.url)
        return { action: 'deny' }
      })

      // HMR for renderer base on electron-vite cli.
      // Load the remote URL for development or the local html file for production.
      if ( is.dev && process.env['ELECTRON_RENDERER_URL'] ) {
        mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
      } else {
        mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
      }
      this._window = mainWindow
      return mainWindow
    } catch ( e ) {
      this.logger.error(`[10001] 应用启动时出现错误 :${ formatError(e) }`, LOGGER_NAMESPACE.APP)
      this.logger.on('finish', () => app.exit(10001))
      this.logger.end()
      return
    }
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
