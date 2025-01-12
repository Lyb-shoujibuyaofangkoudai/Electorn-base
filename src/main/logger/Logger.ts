import path from 'node:path'
import { app } from 'electron'
import dayjs from 'dayjs'
import fs from 'node:fs'
import { createLogger, format, transports } from 'winston'
import { LoggerCommon } from './LoggerCommon'
export class Logger {
  private static instance: Logger
  public logger: any = null

  private constructor() {
    this.logger = this.init()
    this.logger.info({
      message: `日志系统初始化成功`,
      namespace: LoggerCommon.NAMESPACE.APP
    })
  }

  /**
   * 获取单例
   */
  public static getInstance(): Logger {
    if ( !Logger.instance ) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  /**
   * 初始化日志记录器
   * @returns {any} 初始化后的日志记录器对象
   */
  init() {
    const appDir = path.join(app.getAppPath(), '/src')
    const logsDir = path.join(appDir, 'logs')
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
              const timestampColored = `${ LoggerCommon.STYLES.bgBrightGreen }[${ dayjs(timestamp as any).format('YYYY-MM-DD HH:mm:ss:SSS') }]${ LoggerCommon.STYLES.reset }`
              const namespaceColored = `${ LoggerCommon.STYLES.brightBlue }${ LoggerCommon.STYLES.bold }[${ namespace }]${ LoggerCommon.STYLES.reset }`
              const levelColor = LoggerCommon.LEVEL_COLORS[level] || LoggerCommon.STYLES.reset
              const levelColored = `${ levelColor }[${ level }]${ LoggerCommon.STYLES.reset }`
              return `${ timestampColored } ${ namespaceColored } ${ levelColored } ${ message }`
            })
          )
        })
      ]
    })
  }


}
