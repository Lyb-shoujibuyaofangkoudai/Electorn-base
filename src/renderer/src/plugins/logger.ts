import { LoggerRenderer } from '../../../manager/plugins/logger/LoggerRenderer'

export const loggerKey = Symbol('logger')

const loggerPlugin = {
  install: (app, options) => {
    const logger = new LoggerRenderer()
    app.provide(loggerKey, logger)
  }
}
export default loggerPlugin
