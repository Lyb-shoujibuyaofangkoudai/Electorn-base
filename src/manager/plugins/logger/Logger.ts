import path from 'node:path'
import { app } from 'electron'
import dayjs from 'dayjs'
import fs from 'node:fs'
import { createLogger, format, transports, Logger as WinstonLogger } from 'winston'
import { STYLES, LEVEL_COLORS, NAMESPACE_COLORS, MSG_COLORS } from './LoggerCommon'
import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'
import { EVENT_TYPE } from '../Bridge/eventType'


export class Logger implements IPlugin {
  static id: string = 'logger'
  name = Logger.id
  public logger: any = null
  // 日志保存路径
  logDirPath: string = ''

  init(core:Core & any) {
    this.logger = this.createLogger()
    this.logger.info('日志插件初始化成功',LOGGER_NAMESPACE.APP)
    this.logger.info(`日志保存路径：${this.logDirPath}`,LOGGER_NAMESPACE.APP)
    core[this.name] = core.getPlugin(Logger.id) // 挂载到Core上
    core.emit('loggerRegistered',this.logger)
  }

  createLogger() {
    // const appDir = path.join(app.getPath('exe'), '..')
    // const logsDir = path.join(appDir, 'logs')
    const appDir = import.meta.env.MODE === 'production' ? path.join(app.getPath('userData'), '..') : path.join(app.getAppPath(), '/src')
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

  info(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE) {
    this.logger.info({
      message: JSON.stringify(message),
      namespace
    })
  }

  debug(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE) {
    this.logger.debug({
      message: JSON.stringify(message),
      namespace
    })
  }

  warn(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE) {
    this.logger.warn({
      message: JSON.stringify(message),
      namespace
    })
  }

  error(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE) {
    const error = new Error(message)
    this.logger.error({
      message: JSON.stringify(message),
      namespace,
      stack: error.stack
    })
  }
}
