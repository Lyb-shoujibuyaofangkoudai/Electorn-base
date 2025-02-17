import { EntitlementsToken } from './types/entitlements'
import { AxiosInstance } from 'axios'

export class EntitlementsHttpApi {
  constructor(private _http: AxiosInstance) {}

  /**
   * ��ȡ��Ȩ���ƣ�Entitlement Token��
   * ������֤����Ȩ�ͻ��˶������ܱ�����Դ��ӿڵķ���
   * ����SGP �������ķ���
   */
  getEntitlementsToken() {
    return this._http.get<EntitlementsToken>('/entitlements/v1/token')
  }
}
