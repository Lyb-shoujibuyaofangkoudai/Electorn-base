import { inject } from 'vue'
import { loggerKey } from '../plugins/logger'
import { LoggerRenderer } from '../../../manager/plugins/logger/LoggerRenderer'
export const useLogger = ():LoggerRenderer => {
  return inject(loggerKey)!
}
