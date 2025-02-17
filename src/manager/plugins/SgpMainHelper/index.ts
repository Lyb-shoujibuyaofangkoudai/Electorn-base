import sgpServersMap from "../../../../resources/sgp/mh-sgp-servers.json?commonjs-external&asset"
import fs from 'node:fs'
import { IPlugin } from '../../interface'
import { Core } from '../../Core'


export class SgpMainHelper implements IPlugin {
  static id: string = 'sgpMainHelper'
  name = SgpMainHelper.id
  static _instance: SgpMainHelper
  _logger = Core.getInstance()?.logger
  static getInstance() {
    if (!SgpMainHelper._instance) {
      SgpMainHelper._instance = new SgpMainHelper()
    }
    return SgpMainHelper._instance
  }

  init(core: Core) {
    core[this.name] = core.getPlugin(this.name)
    this._loadAvailableServersFromLocalFile()
  }

  private async _loadAvailableServersFromLocalFile() {
    try {
      if(fs.existsSync(sgpServersMap)) {
        this._logger.info("加载 SGP 服务器配置文件")
        const data = await fs.promises.readFile(sgpServersMap, 'utf-8')
        console.log(data)
      }

    } catch (error) {
      this._logger.warn('未找到内置的 SGP 服务器配置文件')
    }
  }
}
