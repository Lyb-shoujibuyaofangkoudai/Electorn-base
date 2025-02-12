// src/manager/plugins/db/dao/DbVersionsDao.ts
import { DataSource, Repository } from 'typeorm'
import { DbVersions } from '../entities/DbVersions';

export class DbVersionsDao {
  private static _instance: DbVersionsDao | null = null;
  private dbVersionsRepository: Repository<DbVersions>
  constructor(dataSource: DataSource) {
  this.dbVersionsRepository = dataSource.getRepository(DbVersions);
  }

  static getInstance(dataSource: DataSource): DbVersionsDao {
    if (!DbVersionsDao._instance) {
      DbVersionsDao._instance = new DbVersionsDao(dataSource);
      DbVersionsDao._instance.dbVersionsRepository = dataSource.getRepository(DbVersions);
    }
    return DbVersionsDao._instance;
  }

  // 增加 DbVersions
  async addDbVersion(key: string, value: any): Promise<DbVersions> {
    const dbVersion = DbVersions.create(key, value);
    return this.dbVersionsRepository.save(dbVersion);
  }

  // 删除 DbVersions
  async deleteDbVersion(key: string): Promise<void> {
    await this.dbVersionsRepository.delete({ key });
  }

  // 更新 DbVersions
  async updateDbVersion(key: string, value: any): Promise<void> {
    await this.dbVersionsRepository.update({ key }, { value });
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
