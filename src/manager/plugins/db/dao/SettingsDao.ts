// src/manager/plugins/db/repositories/SettingsRepository.ts
import { DataSource, Repository } from 'typeorm'
import { Settings } from '../entities/Settings';

export class SettingsDao {
  private static _instance: SettingsDao | null = null;
  private settingsRepository: Repository<Settings>
  constructor(dataSource: DataSource) {
    this.settingsRepository = dataSource.getRepository(Settings);
  }

  static getInstance(dataSource: DataSource): SettingsDao {
    if (!SettingsDao._instance) {
      SettingsDao._instance = new SettingsDao(dataSource);
      SettingsDao._instance.settingsRepository = dataSource.getRepository(Settings);
    }
    return SettingsDao._instance;
  }

  // 增加设置
  async addSetting(key: string, value: any): Promise<Settings> {
    const setting = this.settingsRepository.create({ key, value });
    return this.settingsRepository.save(setting);
  }

  // 删除设置
  async deleteSetting(key: string): Promise<void> {
    await this.settingsRepository.delete({ key });
  }

  // 更新设置
  async updateSetting(key: string, value: any): Promise<void> {
    await this.settingsRepository.update({ key }, { value });
  }

  // 查询设置
  async getSetting(key: string): Promise<Settings | null> {
    return this.settingsRepository.findOne({ where: { key } });
  }
}
