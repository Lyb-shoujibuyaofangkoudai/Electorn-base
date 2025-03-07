import { DataSource } from "typeorm";
import { RecentSearch } from "../entities/RecentSearch";

export class RecentSearchDao {
  constructor(private dataSource: DataSource) {}

  /**
   * 添加或更新最近搜索记录
   * @param puuid 召唤师 puuid
   * @param summonerName 召唤师名称
   * @param avatar 头像
   * @param region 区服
   * @param regionDetail 区服详情
   */
  async addRecentSearch(
    puuid: string,
    summonerName: string,
    avatar?: string,
    region?: string,
    regionDetail?: string,
  ): Promise<RecentSearch> {
    const recentSearchRepository = this.dataSource.getRepository(RecentSearch);

    // 检查是否已存在相同 puuid 的记录
    let recentSearch = await recentSearchRepository.findOne({
      where: { puuid },
    });

    if (recentSearch) {
      // 更新现有记录
      recentSearch.summonerName = summonerName;
      recentSearch.avatar = avatar;
      recentSearch.region = region;
      recentSearch.regionDetail = regionDetail;
      recentSearch.searchTime = new Date();
    } else {
      // 创建新记录
      recentSearch = RecentSearch.create(
        puuid,
        summonerName,
        avatar,
        region,
        regionDetail,
      );
    }

    return await recentSearchRepository.save(recentSearch);
  }

  /**
   * 获取最近搜索记录列表
   */
  async getRecentSearches(): Promise<RecentSearch[]> {
    const recentSearchRepository = this.dataSource.getRepository(RecentSearch);
    return await recentSearchRepository.find({
      order: {
        searchTime: "DESC",
      },
      take: 10, // 限制返回最近的10条记录
    });
  }

  /**
   * 删除指定的搜索记录
   * @param puuid 召唤师 puuid
   */
  async removeRecentSearch(puuid: string): Promise<void> {
    const recentSearchRepository = this.dataSource.getRepository(RecentSearch);
    await recentSearchRepository.delete({ puuid });
  }

  /**
   * 清空所有搜索记录
   */
  async clearAllRecentSearches(): Promise<void> {
    const recentSearchRepository = this.dataSource.getRepository(RecentSearch);
    await recentSearchRepository.clear();
  }
}
