
import {
  Augment,
  ChampDetails,
  ChampionSimple,
  GameMap,
  GameMapAsset,
  Item,
  Perk,
  Perkstyles,
  Queue,
  StrawberryHub,
  SummonerSpell
} from './types/game-data'
import { AxiosInstance } from 'axios'

/**
 * GameDataHttpApi 类用于通过 HTTP 请求获取游戏数据。
 */
export class GameDataHttpApi {
  /**
   * 构造函数，初始化 GameDataHttpApi 实例。
   * @param {AxiosInstance} _http - Axios 实例，用于发送 HTTP 请求。
   */
  constructor(private _http: AxiosInstance) {}

  /**
   * 获取召唤师技能数据。
   * @returns {Promise<SummonerSpell[]>} 返回一个 Promise，解析为 SummonerSpell 数组。
   */
  getSummonerSpells() {
    return this._http.get<SummonerSpell[]>('/lol-game-data/assets/v1/summoner-spells.json')
  }

  /**
   * 获取符文风格数据。
   * @returns {Promise<Perkstyles>} 返回一个 Promise，解析为 Perkstyles 对象。
   */
  getPerkstyles() {
    return this._http.get<Perkstyles>('/lol-game-data/assets/v1/perkstyles.json')
  }

  /**
   * 获取物品数据。
   * @returns {Promise<Item[]>} 返回一个 Promise，解析为 Item 数组。
   */
  getItems() {
    return this._http.get<Item[]>('/lol-game-data/assets/v1/items.json')
  }

  /**
   * 获取英雄摘要数据。
   * @returns {Promise<ChampionSimple[]>} 返回一个 Promise，解析为 ChampionSimple 数组。
   */
  getChampionSummary() {
    return this._http.get<ChampionSimple[]>('/lol-game-data/assets/v1/champion-summary.json')
  }

  /**
   * 获取地图数据。
   * @returns {Promise<GameMap[]>} 返回一个 Promise，解析为 GameMap 数组。
   */
  getMaps() {
    return this._http.get<GameMap[]>('/lol-game-data/assets/v1/maps.json')
  }

  /**
   * 获取符文数据。
   * @returns {Promise<Perk[]>} 返回一个 Promise，解析为 Perk 数组。
   */
  getPerks() {
    return this._http.get<Perk[]>('/lol-game-data/assets/v1/perks.json')
  }

  /**
   * 获取游戏队列数据。
   * @returns {Promise<Queue[]>} 返回一个 Promise，解析为 Queue 数组。
   */
  getQueues() {
    return this._http.get<Queue[]>('/lol-game-data/assets/v1/queues.json')
  }

  /**
   * 获取地图资源数据。
   * @returns {Promise<GameMapAsset>} 返回一个 Promise，解析为 GameMapAsset 对象。
   */
  getMapAssets() {
    return this._http.get<GameMapAsset>('/lol-game-data/assets/v1/map-assets/map-assets.json')
  }

  /**
   * 获取英雄详细数据。
   * @param {number} champId - 英雄 ID。
   * @returns {Promise<ChampDetails>} 返回一个 Promise，解析为 ChampDetails 对象。
   */
  getChampDetails(champId: number) {
    return this._http.get<ChampDetails>(`/lol-game-data/assets/v1/champions/${champId}.json`)
  }

  /**
   * 获取符文增强数据。
   * @returns {Promise<Augment[]>} 返回一个 Promise，解析为 Augment 数组。
   */
  getAugments() {
    return this._http.get<Augment[]>('/lol-game-data/assets/v1/cherry-augments.json')
  }

  /**
   * 获取草莓中心数据。
   * @returns {Promise<StrawberryHub[]>} 返回一个 Promise，解析为 StrawberryHub 数组。
   */
  getStrawberryHub() {
    return this._http.get<StrawberryHub[]>('/lol-game-data/assets/v1/strawberry-hub.json')
  }
}
