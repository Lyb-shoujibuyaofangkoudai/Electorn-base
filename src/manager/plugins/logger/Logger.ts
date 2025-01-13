import path from 'node:path'
import { app } from 'electron'
import dayjs from 'dayjs'
import fs from 'node:fs'
import { createLogger, format, transports } from 'winston'
import { NAMESPACE, STYLES, LEVEL_COLORS, NAMESPACE_COLORS, MSG_COLORS } from './LoggerCommon'
import { IPlugin } from '../../interface'
import { Core } from '../../index'
export class Logger implements IPlugin {
  static id: string = 'logger'
  name = Logger.id
  public logger: any = null
  // 日志保存路径
  logDirPath: string = ''

  init(manager:Core & any) {
    this.logger = this.createLogger()
    manager['logger'] = manager.getPlugin(Logger.id)
    manager.logger.info('日志插件初始化成功',NAMESPACE.APP)
    manager.logger.info(`日志保存路径：${this.logDirPath}`,NAMESPACE.APP)
  }

  createLogger() {
    const appDir = path.join(app.getAppPath(), '/src')
    const logsDir = path.join(appDir, 'logs')
    this.logDirPath = logsDir
    // console.log("查看日志路径:", logsDir,import.meta.env)
    try {
      const stats = fs.statSync(logsDir)

      if ( !stats.isDirectory() ) {
        fs.rmSync(logsDir, { recursive: true, force: true })
        fs.mkdirSync(logsDir)
      }
    } catch ( error ) {
      if ( (error as any).code === 'ENOENT' ) {
        fs.mkdirSync(logsDir)
      } else {
        throw error
      }
    }

    return createLogger({
      transports: [
        // new transports.File({
        //   filename: `YYY_${ dayjs().format('YYYY-MM-DD_HHmmssSSS') }.log`,
        //   dirname: logsDir,
        //   level: 'info',
        //   maxsize: 1024 * 1024 * 128, // 128MB
        //   format: format.combine(
        //     format.timestamp(),
        //     format.printf(({ level, message, namespace, timestamp }) => {
        //       return `[${ dayjs(timestamp as number).format('YYYY-MM-DD HH:mm:ss:SSS') }] [${ namespace }] [${ level }] ${ message }`
        //     })
        //   )
        // }),
        new transports.Console({
          level: import.meta.env.DEV ? 'debug' : 'warn',
          format: format.combine(
            format.timestamp(),
            format.printf(({ level, message, namespace, timestamp }) => {
              const timestampColored = `${ LEVEL_COLORS[level] || STYLES.reset}[${ dayjs(timestamp as any).format('YYYY-MM-DD HH:mm:ss:SSS') }]${ STYLES.reset }`
              const namespaceColored = `${ NAMESPACE_COLORS[level] || STYLES.reset }${ STYLES.bold }[${ namespace }]${ STYLES.reset }`
              const levelColor = LEVEL_COLORS[level] || STYLES.reset
              const levelColored = `${ levelColor }[${ level }]${ STYLES.reset }`
              const msg = `${MSG_COLORS[level] || STYLES.reset}${message}`
              return `${ timestampColored } ${ namespaceColored } ${ levelColored } ${ msg }`
            })
          )
        })
      ]
    })
  }

  info(message: any, namespace: NAMESPACE) {
    this.logger.info({
      message,
      namespace
    })
  }

  debug(message: any, namespace: NAMESPACE) {
    this.logger.debug({
      message,
      namespace
    })
  }

  warn(message: any, namespace: NAMESPACE) {
    this.logger.warn({
      message,
      namespace
    })
  }

  error(message: any, namespace: NAMESPACE) {
    this.logger.error({
      message,
      namespace
    })
  }

}
