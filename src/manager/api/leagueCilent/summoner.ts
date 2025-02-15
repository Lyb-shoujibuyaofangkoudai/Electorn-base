import { SummonerInfo, SummonerProfile } from './types/summoner'
import { AxiosInstance } from 'axios'

/**
 * 封装英雄联盟召唤师相关接口的HTTP请求类
 * @class
 */
export class SummonerHttpApi {
  /**
   * @constructor
   * @param {AxiosInstance} _http - 预配置的axios实例，用于发送HTTP请求
   */
  constructor(private _http: AxiosInstance) {}

  /**
   * 获取当前登录的召唤师信息
   * @returns {Promise<SummonerInfo>} 包含召唤师详细信息的Promise对象
   */
  getCurrentSummoner() {
    return this._http.get<SummonerInfo>('/lol-summoner/v1/current-summoner')
  }

  /**
   * 根据召唤师ID获取召唤师信息
   * @param {number} id - 召唤师的唯一数字标识符
   * @returns {Promise<SummonerInfo>} 包含召唤师详细信息的Promise对象
   */
  getSummoner(id: number) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v1/summoners/${id}`)
  }

  /**
   * 根据PUUID（玩家通用唯一标识符）获取召唤师信息
   * @param {string} puuid - 玩家的全局唯一标识符
   * @returns {Promise<SummonerInfo>} 包含召唤师详细信息的Promise对象
   */
  getSummonerByPuuid(puuid: string) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v2/summoners/puuid/${puuid}`)
  }

  /**
   * 根据召唤师名称获取召唤师信息
   * @param {string} name - 召唤师的显示名称（区分大小写）
   * @returns {Promise<SummonerInfo>} 包含召唤师详细信息的Promise对象
   */
  getSummonerByName(name: string) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v1/summoners?name=${name}`)
  }

  /**
   * 检查召唤师名称是否可用（适用于新召唤师）
   * @param {string} name - 需要检查的召唤师名称
   * @returns {Promise<boolean>} 表示名称是否可用的布尔值Promise
   */
  checkAvailability(name: string) {
    return this._http.get<boolean>(`/lol-summoner/v1/check-name-availability-new-summoners/${name}`)
  }

  /**
   * 更新当前召唤师个人资料信息
   * @param {Object} data - 需要更新的配置数据
   * @param {string} [data.inventory] - 库存标识符（可选）
   * @param {string} data.key - 需要更新的配置项键名
   * @param {any} data.value - 需要设置的配置项值
   * @returns {Promise} 表示更新操作结果的Promise对象
   */
  updateSummonerProfile(data: { inventory?: string; key: string; value: any }) {
    return this._http.post('/lol-summoner/v1/current-summoner/summoner-profile', data)
  }

  /**
   * 更新当前召唤师的显示名称
   * @param {string} name - 新的召唤师名称
   * @returns {Promise} 表示更新操作结果的Promise对象
   */
  updateSummonerName(name: string) {
    return this._http.post('/lol-summoner/v1/current-summoner/name', name)
  }

  /**
   * 创建新召唤师（名称注册）
   * @param {string} name - 需要创建的新召唤师名称
   * @returns {Promise} 包含新召唤师创建结果的Promise对象
   */
  newSummonerName(name: string) {
    return this._http.post('/lol-summoner/v1/summoners', { name })
  }

  /**
   * 设置召唤师个人资料背景皮肤
   * @param {number} skinId - 背景皮肤的ID标识符
   * @returns {Promise} 表示配置更新结果的Promise对象
   */
  setSummonerBackgroundSkin(skinId: number) {
    return this.updateSummonerProfile({
      key: 'backgroundSkinId',
      value: skinId
    })
  }

  /**
   * 设置召唤师个人资料背景增强效果
   * @param {string} augmentId - 背景增强效果的ID标识符
   * @returns {Promise} 表示配置更新结果的Promise对象
   */
  setSummonerBackgroundAugments(augmentId: string) {
    return this.updateSummonerProfile({
      key: 'backgroundSkinAugments',
      value: augmentId
    })
  }

  /**
   * 批量获取召唤师别名信息
   * @param {Array<Object>} nameTagList - 包含多个游戏名称和标签的对象数组
   * @param {string} nameTagList[].gameName - 游戏内显示名称
   * @param {string} nameTagList[].tagLine - 玩家标签
   * @returns {Promise<SummonerInfo[]>} 包含多个召唤师信息的Promise数组
   */
  getSummonerAliases(nameTagList: { gameName: string; tagLine: string }[]) {
    return this._http.post<SummonerInfo[]>('/lol-summoner/v1/summoners/aliases', nameTagList)
  }

  /**
   * 获取单个召唤师别名信息
   * @param {string} name - 游戏内显示名称
   * @param {string} tag - 玩家标签
   * @returns {Promise<SummonerInfo|null>} 包含召唤师信息或null的Promise对象
   */
  async getSummonerAlias(name: string, tag: string) {
    const response = await this.getSummonerAliases([{ gameName: name, tagLine: tag }])
    const result = response.data[0]
    return result || null
  }

  /**
   * 获取当前召唤师的完整个人资料
   * @returns {Promise<SummonerProfile>} 包含完整个人资料的Promise对象
   */
  getCurrentSummonerProfile() {
    return this._http.get<SummonerProfile>('/lol-summoner/v1/current-summoner/summoner-profile')
  }

  /**
   * 根据PUUID获取指定召唤师的个人资料
   * @param {string} puuid - 玩家的全局唯一标识符
   * @returns {Promise<SummonerProfile>} 包含召唤师个人资料的Promise对象
   */
  getSummonerProfile(puuid: string) {
    return this._http.get<SummonerProfile>(`/lol-summoner/v1/summoner-profile`, {
      params: { puuid }
    })
  }
}
