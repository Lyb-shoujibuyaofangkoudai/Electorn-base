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

  init(manager: any) {
    this.configInfo = this.readConfig()
    manager['config'] = manager.getPlugin(Config.id)
  }

  readConfig() {
    const appDir = path.join(app.getAppPath(), '/src/main')
    const yamlPath = path.join(appDir, 'app.config.yaml')
  //   读取配置文件
    const configContent = fs.readFileSync(yamlPath, 'utf8')
    const configData = yaml.load(configContent)
    Core.getInstance()?.logger.info(configData,NAMESPACE.APP)
    return configData
  }

  editConfigValue(key:string,value:any) {

  }
}
