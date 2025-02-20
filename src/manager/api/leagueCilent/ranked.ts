import { RankedStats } from './types/ranked'
import { AxiosInstance } from 'axios'

export class RankedHttpApi {
  constructor(private _http: AxiosInstance) {}

  /**
   * 获取当前用户的排位统计数据
   * @returns 返回当前用户的排位统计数据
   */
  getCurrentRankedStats() {
    return this._http.get<RankedStats>('/lol-ranked/v1/current-ranked-stats')
  }

  /**
   * 获取指定用户的排位统计数据
   * @param puuid 用户的PUUID
   * @returns 返回指定用户的排位统计数据
   */
  getRankedStats(puuid: string) {
    return this._http.get<RankedStats>(`/lol-ranked/v1/ranked-stats/${puuid}`)
  }

  /**
   * 确认指定的EoS通知
   * @param id 通知ID
   */
  acknowledgeEosNotification(id: string) {
    return this._http.post(`/lol-ranked/v1/eos-notifications/${id}/acknowledge`)
  }

  /**
   * 确认指定的通知
   * @param id 通知ID
   */
  acknowledgeNotification(id: string) {
    return this._http.post(`/lol-ranked/v1/notifications/${id}/acknowledge`)
  }
}
