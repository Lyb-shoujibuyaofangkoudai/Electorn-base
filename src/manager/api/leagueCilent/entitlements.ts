import { EntitlementsToken } from './types/entitlements'
import { AxiosInstance } from 'axios'

export class EntitlementsHttpApi {
  constructor(private _http: AxiosInstance) {}

  /**
   * 获取授权令牌（Entitlement Token）
   * 用于验证和授权客户端对其他受保护资源或接口的访问
   * 用于SGP 服务器的访问
   */
  getEntitlementsToken() {
    return this._http.get<EntitlementsToken>('/entitlements/v1/token')
  }
}
