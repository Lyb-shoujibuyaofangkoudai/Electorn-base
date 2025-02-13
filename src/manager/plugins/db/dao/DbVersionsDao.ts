import { DataSource, Repository, QueryRunner } from 'typeorm';
import { DbVersions } from '../entities/DbVersions';
import { Core } from '../../../Core';
import { LOGGER_NAMESPACE } from '../../Bridge/bridgeType';

export class DbVersionsDao {
  private static _instance: DbVersionsDao | null = null;
  private dbVersionsRepository: Repository<DbVersions>;
  private dataSource: DataSource;
  private _logger = Core.getInstance().logger;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.dbVersionsRepository = dataSource.getRepository(DbVersions);
  }

  static getInstance(dataSource: DataSource): DbVersionsDao {
    if (!DbVersionsDao._instance) {
      DbVersionsDao._instance = new DbVersionsDao(dataSource);
    }
    return DbVersionsDao._instance;
  }

  private async executeInTransaction<T>(actionName: string, action: (queryRunner: QueryRunner) => Promise<T>): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await action(queryRunner);
      this._logger.info(`actionName: ${actionName}`, LOGGER_NAMESPACE.DB);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      this._logger.error(`action sql操作失败: ${actionName}，执行事务回滚...`, LOGGER_NAMESPACE.DB);
      await queryRunner.rollbackTransaction();
      this._logger.info(`action sql操作失败: ${actionName}，执行事务回滚成功`, LOGGER_NAMESPACE.DB);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 增加 DbVersions
  async addDbVersion(key: string, value: any): Promise<DbVersions> {
    return this.executeInTransaction('DbVersionsDao.addDbVersion', async (queryRunner) => {
      const dbVersion = DbVersions.create(key, value);
      return queryRunner.manager.save(dbVersion);
    });
  }

  // 删除 DbVersions
  async deleteDbVersion(key: string): Promise<void> {
    return this.executeInTransaction('DbVersionsDao.deleteDbVersion', async (queryRunner) => {
      await queryRunner.manager.delete(DbVersions, { key });
    });
  }

  // 更新 DbVersions
  async updateDbVersion(key: string, value: any): Promise<void> {
    return this.executeInTransaction('DbVersionsDao.updateDbVersion', async (queryRunner) => {
      await queryRunner.manager.update(DbVersions, { key }, { value });
    });
  }

  // 查询 DbVersions
  async getDbVersion(key: string): Promise<DbVersions | null> {
    return this.dbVersionsRepository.findOne({ where: { key } });
  }

  // 查询所有 DbVersions
  async getAllDbVersions(): Promise<DbVersions[]> {
    return this.dbVersionsRepository.find();
  }
}
