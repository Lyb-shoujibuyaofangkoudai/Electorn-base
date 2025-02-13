import { IPlugin } from '../../interface'
import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import yaml from 'js-yaml'
import { Core } from '../../Core'
import { Settings } from '../db/entities/Settings'
import { Db } from '../db/Db'
import { SettingsDao } from '../db/dao/SettingsDao'

export class Config implements IPlugin {

  static id = 'config'
  name = Config.id
  _yamlPath = ''

  private configInfo: any = Settings.defaultSettings
  private settingsDao: SettingsDao | null = null

  hooks = {
    dbRegistered: async (db: Db) => {
      this.settingsDao = db._dao.settings
      const configInfo = await this.settingsDao!.getSetting('config')
      if(!configInfo) {
        await db._dao.settings!.addSetting('config', Settings.defaultSettings)
      } else if(!configInfo.value?.main_window) {
        await db._dao.settings!.updateSetting('config', Settings.defaultSettings)
      } else this.setConfig(configInfo.value)
    }
  }

  init(core: Core | any) {
    this.configInfo = this.readConfig()
    core['config'] = core.getPlugin(Config.id)
  }

  /**
   * 检查文件是否存在，如果不存在且目录也不存在，则创建目录并返回 false，
   * 如果文件存在则返回 true。
   * @param filePath - 要检查的文件路径
   * @returns 如果文件存在返回 true，否则返回 false
   */
  checkFileExists(filePath: string): boolean {
    const dirPath = path.dirname(filePath)

    try {
      // 检查文件是否存在
      fs.accessSync(filePath, fs.constants.F_OK)
      return true
    } catch ( err ) {
      if ( (err as any).code === 'ENOENT' ) {
        // 文件不存在，检查目录是否存在
        try {
          fs.accessSync(dirPath, fs.constants.F_OK)
          return false
        } catch ( err ) {
          if ( (err as any).code === 'ENOENT' ) {
            // 目录也不存在，创建目录
            fs.mkdirSync(dirPath, { recursive: true })
          }
          return false
        }
      } else {
        // 其他错误
        throw err
      }
    }
  }

  readConfig() {
    const appDir = import.meta.env.MODE === 'production' ? path.join(app.getPath('userData'), '..') : path.join(app.getAppPath(), '/src/manager/plugins')
    const configDir = path.join(appDir, 'config')
    const configFilePath = path.join(configDir, 'app.config.yaml')
    this._yamlPath = configFilePath
    let configData = this.configInfo
    try {
      const fileExists = this.checkFileExists(configFilePath)
      if ( !fileExists ) this.setConfig(this.configInfo)
      else {
        //   读取配置文件
        const configContent = fs.readFileSync(configFilePath, 'utf8')
        configData = yaml.load(configContent)
        if(!configData) {
          this.setConfig(this.configInfo)
          return this.configInfo
        }
      }
      return configData
    } catch ( error ) {
      if ( (error as any).code === 'ENOENT' ) {
        fs.mkdirSync(configDir)
      }
      this.setConfig(configData) // 保存默认配置信息
      return configData
    }
  }

  /**
   * 根据key来获取配置文件中的值 如：theme.name
   * @param key
   */
  getValue(key: string): any {
    const keys = key.split('.')
    let value = this.configInfo

    for ( const k of keys ) {
      if ( value && typeof value === 'object' && k in value ) {
        value = value[k]
      } else {
        throw new Error(`Key '${ key }' not found in config.`)
      }
    }

    return value
  }

  setValue(key: string, value: any) {
    const keys = key.split('.')
    let obj = this.configInfo

    for ( let i = 0; i < keys.length - 1; i++ ) {
      const k = keys[i]
      if ( !obj[k] || typeof obj[k] !== 'object' ) {
        throw new Error(`Key '${ keys.slice(0, i + 1).join('.') }' is not an object.`)
      }
      obj = obj[k]
    }

    obj[keys[keys.length - 1]] = value
    // 将更新后的配置写入文件
    yaml.dump(this.configInfo)

  }

  setConfig(config: any) {
    this.configInfo = config
    const yamlContent = yaml.dump(this.configInfo)
    fs.writeFileSync(this._yamlPath, yamlContent)
  }
}
