import { EntitlementsToken } from './types/entitlements'
import { AxiosInstance } from 'axios'

export class EntitlementsHttpApi {
  constructor(private _http: AxiosInstance) {}

  /**
   * 获取 entitlements token
   * 用于sgp api
   */
  getEntitlementsToken() {
    return this._http.get<EntitlementsToken>('/entitlements/v1/token')
  }
}
