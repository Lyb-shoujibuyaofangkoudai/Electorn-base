import { DataSource, Repository, QueryRunner } from "typeorm";
import { SearchHistory } from "../entities/SearchHistory";
import { Core } from "../../../Core";
import { LOGGER_NAMESPACE } from "../../Bridge/bridgeType";

export class SearchHistoryDao {
  private static _instance: SearchHistoryDao | null = null;
  private searchHistoryRepository: Repository<SearchHistory>;
  private dataSource: DataSource;
  private _logger = Core.getInstance().logger;

  constructor(dataSource: DataSource) {
    this.dataSource = dataSource;
    this.searchHistoryRepository = dataSource.getRepository(SearchHistory);
  }

  static getInstance(dataSource: DataSource): SearchHistoryDao {
    if (!SearchHistoryDao._instance) {
      SearchHistoryDao._instance = new SearchHistoryDao(dataSource);
    }
    return SearchHistoryDao._instance;
  }

  private async executeInTransaction<T>(
    actionName: string,
    action: (queryRunner: QueryRunner) => Promise<T>,
  ): Promise<T> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await action(queryRunner);
      this._logger.info(`actionName: ${actionName}`, LOGGER_NAMESPACE.DB);
      await queryRunner.commitTransaction();
      return result;
    } catch (err) {
      this._logger.error(
        `action sql操作失败: ${actionName}，执行事务回滚...`,
        LOGGER_NAMESPACE.DB,
      );
      await queryRunner.rollbackTransaction();
      this._logger.info(
        `action sql操作失败: ${actionName}，执行事务回滚成功`,
        LOGGER_NAMESPACE.DB,
      );
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 添加搜索记录
  async addSearchHistory(
    summonerName: string,
    avatar?: string,
    region?: string,
    regionDetail?: string,
  ): Promise<SearchHistory> {
    return this.executeInTransaction(
      "SearchHistoryDao.addSearchHistory",
      async (queryRunner) => {
        const history = SearchHistory.create(summonerName, avatar, region, regionDetail);
        return queryRunner.manager.save(history);
      },
    );
  }

  // 获取最近的搜索记录
  async getRecentSearches(limit: number = 5): Promise<SearchHistory[]> {
    return this.searchHistoryRepository.find({
      order: {
        searchTime: "DESC",
      },
      take: limit,
    });
  }

  // 删除指定召唤师的搜索记录
  async deleteSearchHistory(summonerName: string): Promise<void> {
    return this.executeInTransaction(
      "SearchHistoryDao.deleteSearchHistory",
      async (queryRunner) => {
        await queryRunner.manager.delete(SearchHistory, { summonerName });
      },
    );
  }

  // 清空所有搜索记录
  async clearAllHistory(): Promise<void> {
    return this.executeInTransaction(
      "SearchHistoryDao.clearAllHistory",
      async (queryRunner) => {
        await queryRunner.manager.clear(SearchHistory);
      },
    );
  }
}
