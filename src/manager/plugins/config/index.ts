import { IPlugin } from '../../interface'
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import yaml from "js-yaml"
import { Core } from '../../Core'
import { NAMESPACE } from '../logger/LoggerCommon'

export class Config implements IPlugin {

  static id = 'config'
  name = Config.id

  private configInfo:any = {}

  init(core:Core| any) {
    this.configInfo = this.readConfig()
    core['config'] = core.getPlugin(Config.id)
  }

  readConfig() {
    const appDir = path.join(app.getAppPath(), '/src/manager')
    const yamlPath = path.join(appDir, 'plugins/config/app.config.yaml')
  //   读取配置文件
    const configContent = fs.readFileSync(yamlPath, 'utf8')
    const configData = yaml.load(configContent)
    return configData
  }


  getValue(key: string): any {
    const keys = key.split('.')
    let value = this.configInfo

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        return undefined // 或者抛出错误，根据需求选择
      }
    }

    return value
  }

  setValue(key: string, value: any) {
    const keys = key.split('.')
    let obj = this.configInfo

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i]
      if (!obj[k] || typeof obj[k] !== 'object') {
        obj[k] = {}
      }
      obj = obj[k]
    }

    obj[keys[keys.length - 1]] = value
  }
}
