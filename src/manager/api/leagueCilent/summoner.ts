import { SummonerInfo, SummonerProfile } from './types/summoner'
import { AxiosInstance } from 'axios'

export class SummonerHttpApi {
  constructor(private _http: AxiosInstance) {}
  /**
   * 获取当前登录的召唤师信息
   * @returns 包含召唤师详细信息的Promise
   */
  getCurrentSummoner() {
    return this._http.get<SummonerInfo>('/lol-summoner/v1/current-summoner')
  }
  /**
   * 通过召唤师ID获取召唤师信息
   * @param id 召唤师唯一标识符
   * @returns 包含召唤师详细信息的Promise
   */
  getSummoner(id: number) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v1/summoners/${id}`)
  }
  /**
   * 通过PUUID获取召唤师信息
   * @param puuid 玩家唯一通用标识符
   * @returns 包含召唤师详细信息的Promise
   */
  getSummonerByPuuid(puuid: string) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v2/summoners/puuid/${puuid}`)
  }
  /**
   * 通过召唤师名称获取召唤师信息
   * @param name 召唤师名称（区分大小写）
   * @returns 包含召唤师详细信息的Promise
   */
  getSummonerByName(name: string) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v1/summoners?name=${name}`)
  }
  /**
   * 检查召唤师名称是否可用（用于新召唤师创建）
   * @param name 需要验证的名称
   * @returns 返回名称可用性的布尔值Promise
   */
  checkAvailability(name: string) {
    return this._http.get<boolean>(`/lol-summoner/v1/check-name-availability-new-summoners/${name}`)
  }
  /**
   * 更新召唤师个人资料
   * @param data 更新数据对象
   * @param data.key 要更新的配置项键
   * @param data.value 要设置的配置值
   * @param data.inventory 可选库存标识
   * @returns 更新操作结果的Promise
   */
  updateSummonerProfile(data: { inventory?: string; key: string; value: any }) {
    return this._http.post('/lol-summoner/v1/current-summoner/summoner-profile', data)
  }
  /**
   * 获取召唤师别名信息（批量查询）
   * @param nameTagList 包含游戏名称和标签的对象数组
   * @returns 包含召唤师信息数组的Promise
   */
  updateSummonerName(name: string) {
    return this._http.post('/lol-summoner/v1/current-summoner/name', name)
  }

  newSummonerName(name: string) {
    return this._http.post('/lol-summoner/v1/summoners', { name })
  }

  setSummonerBackgroundSkin(skinId: number) {
    return this.updateSummonerProfile({
      key: 'backgroundSkinId',
      value: skinId
    })
  }

  setSummonerBackgroundAugments(augmentId: string) {
    return this.updateSummonerProfile({
      key: 'backgroundSkinAugments',
      value: augmentId
    })
  }

  getSummonerAliases(nameTagList: { gameName: string; tagLine: string }[]) {
    return this._http.post<SummonerInfo[]>('/lol-summoner/v1/summoners/aliases', nameTagList)
  }

  async getSummonerAlias(name: string, tag: string) {
    const response = await this.getSummonerAliases([{ gameName: name, tagLine: tag }])
    const result = response.data[0]
    return result || null
  }

  getCurrentSummonerProfile() {
    return this._http.get<SummonerProfile>('/lol-summoner/v1/current-summoner/summoner-profile')
  }

  getSummonerProfile(puuid: string) {
    return this._http.get<SummonerProfile>(`/lol-summoner/v1/summoner-profile`, {
      params: { puuid }
    })
  }
}
