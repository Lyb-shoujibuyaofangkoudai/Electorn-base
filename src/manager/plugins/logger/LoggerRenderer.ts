import dayjs from 'dayjs'

import { formatError } from '../../utils/error'
import { IPlugin } from '../../interface'
import { Core } from '../../Core'


import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'
import { EVENT_TYPE } from '../Bridge/eventType'
import { LOGGER_LEVEL } from './LoggerCommon'

/**
 * 渲染进程专用打印日志插件
 * 可以不继承 IPlugin 接口，因为这个当作普通类使用最终注入到vue插件
 */
export class LoggerRenderer implements IPlugin {
  static id = 'logger-renderer'
  name = LoggerRenderer.id
  _ipc = useIpc()

  init(manager: Core & any) {
    if ( !manager ) return
    manager['logger'] = manager.getPlugin(LoggerRenderer.id)
  }

  private _objectsToString(...args: any[]) {
    return args
      .map((arg) => {
        if ( arg instanceof Error ) {
          return formatError(arg)
        }

        if ( typeof arg === 'undefined' ) {
          return 'undefined'
        }

        if ( typeof arg === 'function' ) {
          return arg.toString()
        }

        if ( typeof arg === 'object' ) {
          try {
            return JSON.stringify(arg, null, 2)
          } catch ( error ) {
            return arg.toString()
          }
        }

        return arg
      })
      .join(' ')
  }

  info(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE = LOGGER_NAMESPACE.APP) {
    console.info(
      `%c[${ dayjs().format('HH:mm:ss') }] %c[%c${ namespace }%c] %c[info]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #FFA500; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message
    )
    this._ipc.sendLog(LOGGER_LEVEL.info, message)

  }

  warn(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE = LOGGER_NAMESPACE.APP) {
    console.warn(
      `%c[${ dayjs().format('HH:mm:ss') }] %c[%c${ namespace }%c] %c[warn]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #FFA500; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message
    )
    this._ipc.sendLog(LOGGER_LEVEL.warn, message)
  }

  error(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE = LOGGER_NAMESPACE.APP) {
    console.error(
      `%c[${ dayjs().format('HH:mm:ss') }] %c[%c${ namespace }%c] %c[error]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #FFA500; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message
    )
    this._ipc.sendLog(LOGGER_LEVEL.error, message)
  }

  debug(message: any, namespace: EVENT_TYPE | LOGGER_NAMESPACE = LOGGER_NAMESPACE.APP) {
    console.debug(
      `%c[${ dayjs().format('HH:mm:ss') }] %c[%c${ namespace }%c] %c[debug]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #FFA500; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message
    )
    this._ipc.sendLog(LOGGER_LEVEL.debug, message)
  }


}
