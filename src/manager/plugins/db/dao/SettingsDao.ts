import { DataSource, Repository, QueryRunner } from 'typeorm';
import { Settings } from '../entities/Settings';
import { Core } from '../../../Core'
import { LOGGER_NAMESPACE } from '../../Bridge/bridgeType'

export class SettingsDao {
  private static _instance: SettingsDao | null = null;
  private settingsRepository: Repository<Settings>;
  private dataSource: DataSource;
  private _logger = Core.getInstance().logger;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.settingsRepository = dataSource.getRepository(Settings);
  }

  static getInstance(dataSource: DataSource): SettingsDao {
    if (!SettingsDao._instance) {
      SettingsDao._instance = new SettingsDao(dataSource);
    }
    return SettingsDao._instance;
  }

  private async executeInTransaction<T>(actionName:string,action: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await action(queryRunner);
      this._logger.info(`actionName: ${actionName}`, LOGGER_NAMESPACE.DB);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      this._logger.error(`action sql操作失败: ${action.name}，执行事务回滚...`, LOGGER_NAMESPACE.DB);
      await queryRunner.rollbackTransaction();
      this._logger.info(`action sql操作失败: ${action.name}，执行事务回滚成功`, LOGGER_NAMESPACE.DB);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 增加设置
  async addSetting(key: string, value: any): Promise<Settings> {
    return this.executeInTransaction('SettingsDao.addSetting',async (queryRunner) => {
      const setting = this.settingsRepository.create({ key, value });
      return queryRunner.manager.save(setting);
    });
  }

  // 删除设置
  async deleteSetting(key: string): Promise<void> {
    return this.executeInTransaction('SettingsDao.deleteSetting',async (queryRunner) => {
      await queryRunner.manager.delete(Settings, { key });
    });
  }

  // 更新设置
  async updateSetting(key: string, value: any): Promise<void> {
    return this.executeInTransaction('SettingsDao.updateSetting',async (queryRunner) => {
      await queryRunner.manager.update(Settings, { key }, { value });
    });
  }

  // 查询设置
  async getSetting(key: string): Promise<Settings | null> {
    return this.settingsRepository.findOne({ where: { key } });
  }
}
