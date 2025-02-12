import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { DataSource, QueryRunner } from 'typeorm'
import { join } from 'path'
import { app } from 'electron'
import { Settings } from './entities/Settings'
import { Logger } from '../logger/Logger'
import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'
import dayjs from 'dayjs'
import { existsSync, renameSync } from 'node:fs'
import { DbVersions } from './entities/DbVersions'
import { V_1 } from './migrations/v1.0'
import { SettingsDao } from './dao/SettingsDao'
import { DbVersionsDao } from './dao/DbVersionsDao'


type DaoType = {
  settings: SettingsDao | null
  dbVersions: DbVersionsDao | null
}

// todo: 数据库插件
export class Db implements IPlugin {
  static id: string = 'db'
  name = Db.id
  _logger: Logger = Core.getInstance().logger! // 因为这个插件是在logger插件之后初始化的，所以这里可以直接使用
  _dbSource: DataSource | null = null
  _dbPath: string = ''
  _upgrades = {
    1: new V_1(),
  }
  _dao: DaoType = {
    settings: null,
    dbVersions: null
  }

  get dbSource() {
    return this._dbSource
  }

  constructor() {
  }


  async init(core: Core): Promise<void> {
    await this._initDataBase()
    core[this.name] = core.getPlugin(Db.id)
    core.emit('dbRegistered',this)
  }

  async _initDataBase() {
    try {
      this._dbPath = import.meta.env.MODE === 'production' ? join(app.getPath('userData'), import.meta.env.VITE_DB_NAME) : join(app.getAppPath(), `/src/manager/plugins/db/${ import.meta.env.VITE_DB_NAME }`)
      this._dbSource = new DataSource({
        type: 'sqlite',
        database: this._dbPath,
        synchronize: false,
        entities: [ Settings,DbVersions ]
      })

      this._logger!.info(`当前数据库文件位于 ${ this._dbPath }`, LOGGER_NAMESPACE.APP)

      await this._dbSource.initialize()
      this._dao.settings = new SettingsDao(this._dbSource)
      this._dao.dbVersions = new DbVersionsDao(this._dbSource)
      const {
        needToRecreateDatabase,
        needToPerformUpgrade,
        currentVersion
      } = await this._checkDatabaseVersion(this._dbSource)

      this._logger.info(`当前版本 ${currentVersion}`, LOGGER_NAMESPACE.APP)

      let cv = currentVersion

      if (!needToPerformUpgrade && !needToPerformUpgrade) {
        this._logger.info(`当前版本数据库无需迁移`,LOGGER_NAMESPACE.APP)
      }

      if (needToRecreateDatabase) {
        this._logger.warn(`错误的数据库格式，需要重建数据库`,LOGGER_NAMESPACE.APP)
        await this._recreateDatabase(this._dbSource, this._dbPath)
        cv = 0
      }

      if (needToPerformUpgrade) {
        this._logger.info(`数据库需要从 ${cv} 版本升级`,LOGGER_NAMESPACE.APP)
        await this._upgrade(this._dbSource,cv)
      }



    } catch ( e ) {
      this._logger!.error('数据库初始化失败' + e, LOGGER_NAMESPACE.APP)
    }
  }

  private async _checkDatabaseVersion(dataSource: DataSource): Promise<{
    needToRecreateDatabase: boolean
    needToPerformUpgrade: boolean
    currentVersion: number
  }> {
    const queryRunner = dataSource.createQueryRunner()
    let needToRecreateDatabase = false
    let needToPerformUpgrade = false
    let currentVersion = 0

    try {
      const metadataTable = await queryRunner.getTable('db_versions')
      if ( metadataTable ) {
        const versionResult = await this._dao.dbVersions!.getDbVersion('version')
        if ( versionResult ) {
          currentVersion = parseInt(versionResult.value, 10)
          if ( currentVersion > import.meta.env.VITE_DB_VERSION ) {
            needToRecreateDatabase = true
            needToPerformUpgrade = true
          } else if ( currentVersion < import.meta.env.VITE_DB_VERSION ) {
            needToPerformUpgrade = true
          }
        } else {
          needToRecreateDatabase = true
          needToPerformUpgrade = true
        }
      } else {
        needToPerformUpgrade = true
      }
    } finally {
      await queryRunner.release()
    }

    return { needToRecreateDatabase, needToPerformUpgrade, currentVersion }
  }

  private async _recreateDatabase(dataSource: DataSource, dbPath: string) {
    await dataSource.destroy()

    if (existsSync(dbPath)) {
      const backupPath = join(dbPath, `../${dayjs().format('YYYYMMDDHHmmssSSS')}_bk.db`)

      renameSync(dbPath, backupPath)
      this._logger.info(`原数据库无法使用, 已备份至 ${backupPath}`, LOGGER_NAMESPACE.APP)
    }

    await dataSource.initialize()
  }

  private async _upgrade(dbSource:DataSource,cv:number) {
    const queryRunner = dbSource.createQueryRunner()
    await queryRunner.startTransaction()

    try {
      await this._performUpgrades(queryRunner, cv)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  /**
   * todo: 数据库升级
   * 执行数据库升级
   * @param r
   * @param currentVersion
   * @private
   */

  private async _performUpgrades(r: QueryRunner, currentVersion: number) {
    const pendingUpgrades = Object.entries(this._upgrades)
      .filter(([v]) => Number(v) > currentVersion)
      .toSorted(([v1], [v2]) => Number(v1) - Number(v2))

    this._logger.info(`即将进行的数据库升级数量: ${pendingUpgrades.length}`, LOGGER_NAMESPACE.APP)

    for (const [v, cls] of pendingUpgrades) {
      this._logger.info(`正在执行 => 版本 ${v} 的迁移`, LOGGER_NAMESPACE.APP)
      await cls.up(r)
    }

    this._logger.info(`已完成所有数据库迁移`, LOGGER_NAMESPACE.APP)
  }

}

