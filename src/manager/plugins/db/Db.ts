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

// todo: 数据库插件
export class Db implements IPlugin {
  static id: string = 'db'
  name = Db.id
  _logger: Logger = Core.getInstance().logger! // 因为这个插件是在logger插件之后初始化的，所以这里可以直接使用
  _dbSource: DataSource | null = null
  _dbPath: string = ''
  _upgrades = {
    10: (a:any) => {},
    20: (a:any) => {}
  }

  get dbSource() {
    return this._dbSource
  }


  async init(core: Core): Promise<void> {
    core[this.name] = core.getPlugin(Db.id)
    this._initDataBase()
  }

  async _initDataBase() {
    try {
      this._dbPath = import.meta.env.MODE === 'production' ? join(app.getPath('userData'), import.meta.env.VITE_DB_NAME) : join(app.getAppPath(), `/src/manager/plugins/db/${ import.meta.env.VITE_DB_NAME }`)
      this._dbSource = new DataSource({
        type: 'sqlite',
        database: this._dbPath,
        synchronize: false,
        entities: [ Settings ]
      })

      this._logger!.info(`当前数据库文件位于 ${ this._dbPath }`, LOGGER_NAMESPACE.APP)

      await this._dbSource.initialize()
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
        this._upgrade(this._dbSource,cv)
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
      const metadataTable = await queryRunner.getTable('Metadata')
      if ( metadataTable ) {
        const versionResult = await queryRunner.manager.query(
          'SELECT value FROM Metadata WHERE key = \'version\''
        )
        if ( versionResult.length ) {
          currentVersion = parseInt(versionResult[0].value, 10)
          if ( currentVersion > import.meta.env.VITE_DB_VERSION ) {
            // version is too high and needs recreation
            needToRecreateDatabase = true
            needToPerformUpgrade = true
          } else if ( currentVersion < import.meta.env.VITE_DB_VERSION ) {
            // low version, need to upgrade
            needToPerformUpgrade = true
          }
        } else {
          // no version field, malformed db
          needToRecreateDatabase = true
          needToPerformUpgrade = true
        }
      } else {
        // just created, need to build the db
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

    for (const [v, fn] of pendingUpgrades) {
      this._logger.info(`正在执行 => 版本 ${v} 的迁移`, LOGGER_NAMESPACE.APP)
      await fn(r)
    }

    this._logger.info(`已完成所有数据库迁移`, LOGGER_NAMESPACE.APP)
  }

}

