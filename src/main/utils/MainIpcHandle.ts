import {ipcMain} from "electron"
import { Constant } from '../../preload/utils/Constant'
import { MainWindow } from '../windows/MainWindow'

export class MainIpcHandle {
  constructor() {
    this.init()
  }

  init() {
    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_MAXIMIZED, async () => {
      console.log("窗口最大化")
      MainWindow.instance.setWindowMaximization()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_MINIMIZED, async () => {
      console.log("窗口最小化")
      MainWindow.instance.setWindowMinimization()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_CLOSED, async () => {
      console.log("窗口关闭")
      MainWindow.instance.closeWindow()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_RESTORED, async () => {
      console.log("窗口恢复")
      MainWindow.instance.setWindowRestore()
    })

    ipcMain.handle(Constant.WINDOW_EVENT.WINDOW_UNMAXIMIZED, async () => {
      console.log("取消窗口最大化")
      MainWindow.instance.setWindowUnmaximization()
    })
  }
}
