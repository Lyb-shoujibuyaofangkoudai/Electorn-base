import { IPlugin } from '../../interface'
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import yaml from "js-yaml"
import { Core } from '../../Core'

import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'

export class Config implements IPlugin {

  static id = 'config'
  name = Config.id
  _appDir = path.join(app.getAppPath(), '/src/manager')
  _yamlPath = path.join(this._appDir, 'plugins/config/app.config.yaml')

  private configInfo:any = {}

  init(core:Core| any) {
    this.configInfo = this.readConfig()
    core['config'] = core.getPlugin(Config.id)
  }

  readConfig() {
    const yamlPath = this._yamlPath
  //   读取配置文件
    const configContent = fs.readFileSync(yamlPath, 'utf8')
    const configData = yaml.load(configContent)
    return configData
  }

  /**
   * 根据key来获取配置文件中的值 如：theme.name
   * @param key
   */
  getValue(key: string): any {
    const keys = key.split('.')
    let value = this.configInfo

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k]
      } else {
        throw new Error(`Key '${key}' not found in config.`)
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
        throw new Error(`Key '${keys.slice(0, i + 1).join('.')}' is not an object.`)
      }
      obj = obj[k]
    }

    obj[keys[keys.length - 1]] = value
    // 将更新后的配置写入文件
    yaml.dump(this.configInfo)

  }

  setConfig(config:any) {
    this.configInfo = config
    const yamlContent = yaml.dump(this.configInfo)
    fs.writeFileSync(this._yamlPath, yamlContent);
  }
}
