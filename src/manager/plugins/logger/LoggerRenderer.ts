
import dayjs from 'dayjs'

import { formatError } from '../../utils/error'
import { IPlugin } from '../../interface'
import { Core } from '../../index'
import { NAMESPACE } from './LoggerCommon'


export class LoggerRenderer implements IPlugin{
  static id = 'logger-renderer'
  name = LoggerRenderer.id
  // same as main shard

  init(manager:Core & any) {
    manager['logger'] = manager.getPlugin(LoggerRenderer.id)
  }

  private _objectsToString(...args:any[]) {
    return args
      .map((arg) => {
        if (arg instanceof Error) {
          return formatError(arg)
        }

        if (typeof arg === 'undefined') {
          return 'undefined'
        }

        if (typeof arg === 'function') {
          return arg.toString()
        }

        if (typeof arg === 'object') {
          try {
            return JSON.stringify(arg, null, 2)
          } catch (error) {
            return arg.toString()
          }
        }

        return arg
      })
      .join(' ')
  }

  info(message:any,namespace: NAMESPACE) {
    console.info(
      `%c[${dayjs().format('HH:mm:ss')}] %c[%c${namespace}%c] %c[info]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #2e2571; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message,
    )

  }

  warn(message:any,namespace: NAMESPACE) {
    console.warn(
      `%c[${dayjs().format('HH:mm:ss')}] %c[%c${namespace}%c] %c[warn]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #2e2571; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message,
    )

  }

  error(message:any,namespace: NAMESPACE) {
    console.error(
      `%c[${dayjs().format('HH:mm:ss')}] %c[%c${namespace}%c] %c[error]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #2e2571; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message,
    )

  }

  debug(message:any,namespace: NAMESPACE) {
    console.debug(
      `%c[${dayjs().format('HH:mm:ss')}] %c[%c${namespace}%c] %c[debug]`,
      'color: #3498db; font-weight: bold;',
      'color: inherit;',
      'color: #2e2571; font-weight: bold;',
      'color: inherit;',
      'color: #004c3c; font-weight: bold;',
      message,
    )

  }


}
