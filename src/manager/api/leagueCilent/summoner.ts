import { SummonerInfo, SummonerProfile } from './types/summoner'
import { AxiosInstance } from 'axios'

/**
 * ��װӢ�������ٻ�ʦ��ؽӿڵ�HTTP������
 * @class
 */
export class SummonerHttpApi {
  /**
   * @constructor
   * @param {AxiosInstance} _http - Ԥ���õ�axiosʵ�������ڷ���HTTP����
   */
  constructor(private _http: AxiosInstance) {}

  /**
   * ��ȡ��ǰ��¼���ٻ�ʦ��Ϣ
   * @returns {Promise<SummonerInfo>} �����ٻ�ʦ��ϸ��Ϣ��Promise����
   */
  getCurrentSummoner() {
    return this._http.get<SummonerInfo>('/lol-summoner/v1/current-summoner')
  }

  /**
   * �����ٻ�ʦID��ȡ�ٻ�ʦ��Ϣ
   * @param {number} id - �ٻ�ʦ��Ψһ���ֱ�ʶ��
   * @returns {Promise<SummonerInfo>} �����ٻ�ʦ��ϸ��Ϣ��Promise����
   */
  getSummoner(id: number) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v1/summoners/${id}`)
  }

  /**
   * ����PUUID�����ͨ��Ψһ��ʶ������ȡ�ٻ�ʦ��Ϣ
   * @param {string} puuid - ��ҵ�ȫ��Ψһ��ʶ��
   * @returns {Promise<SummonerInfo>} �����ٻ�ʦ��ϸ��Ϣ��Promise����
   */
  getSummonerByPuuid(puuid: string) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v2/summoners/puuid/${puuid}`)
  }

  /**
   * �����ٻ�ʦ���ƻ�ȡ�ٻ�ʦ��Ϣ
   * @param {string} name - �ٻ�ʦ����ʾ���ƣ����ִ�Сд��
   * @returns {Promise<SummonerInfo>} �����ٻ�ʦ��ϸ��Ϣ��Promise����
   */
  getSummonerByName(name: string) {
    return this._http.get<SummonerInfo>(`/lol-summoner/v1/summoners?name=${name}`)
  }

  /**
   * ����ٻ�ʦ�����Ƿ���ã����������ٻ�ʦ��
   * @param {string} name - ��Ҫ�����ٻ�ʦ����
   * @returns {Promise<boolean>} ��ʾ�����Ƿ���õĲ���ֵPromise
   */
  checkAvailability(name: string) {
    return this._http.get<boolean>(`/lol-summoner/v1/check-name-availability-new-summoners/${name}`)
  }

  /**
   * ���µ�ǰ�ٻ�ʦ����������Ϣ
   * @param {Object} data - ��Ҫ���µ���������
   * @param {string} [data.inventory] - ����ʶ������ѡ��
   * @param {string} data.key - ��Ҫ���µ����������
   * @param {any} data.value - ��Ҫ���õ�������ֵ
   * @returns {Promise} ��ʾ���²��������Promise����
   */
  updateSummonerProfile(data: { inventory?: string; key: string; value: any }) {
    return this._http.post('/lol-summoner/v1/current-summoner/summoner-profile', data)
  }

  /**
   * ���µ�ǰ�ٻ�ʦ����ʾ����
   * @param {string} name - �µ��ٻ�ʦ����
   * @returns {Promise} ��ʾ���²��������Promise����
   */
  updateSummonerName(name: string) {
    return this._http.post('/lol-summoner/v1/current-summoner/name', name)
  }

  /**
   * �������ٻ�ʦ������ע�ᣩ
   * @param {string} name - ��Ҫ���������ٻ�ʦ����
   * @returns {Promise} �������ٻ�ʦ���������Promise����
   */
  newSummonerName(name: string) {
    return this._http.post('/lol-summoner/v1/summoners', { name })
  }

  /**
   * �����ٻ�ʦ�������ϱ���Ƥ��
   * @param {number} skinId - ����Ƥ����ID��ʶ��
   * @returns {Promise} ��ʾ���ø��½����Promise����
   */
  setSummonerBackgroundSkin(skinId: number) {
    return this.updateSummonerProfile({
      key: 'backgroundSkinId',
      value: skinId
    })
  }

  /**
   * �����ٻ�ʦ�������ϱ�����ǿЧ��
   * @param {string} augmentId - ������ǿЧ����ID��ʶ��
   * @returns {Promise} ��ʾ���ø��½����Promise����
   */
  setSummonerBackgroundAugments(augmentId: string) {
    return this.updateSummonerProfile({
      key: 'backgroundSkinAugments',
      value: augmentId
    })
  }

  /**
   * ������ȡ�ٻ�ʦ������Ϣ
   * @param {Array<Object>} nameTagList - ���������Ϸ���ƺͱ�ǩ�Ķ�������
   * @param {string} nameTagList[].gameName - ��Ϸ����ʾ����
   * @param {string} nameTagList[].tagLine - ��ұ�ǩ
   * @returns {Promise<SummonerInfo[]>} ��������ٻ�ʦ��Ϣ��Promise����
   */
  getSummonerAliases(nameTagList: { gameName: string; tagLine: string }[]) {
    return this._http.post<SummonerInfo[]>('/lol-summoner/v1/summoners/aliases', nameTagList)
  }

  /**
   * ��ȡ�����ٻ�ʦ������Ϣ
   * @param {string} name - ��Ϸ����ʾ����
   * @param {string} tag - ��ұ�ǩ
   * @returns {Promise<SummonerInfo|null>} �����ٻ�ʦ��Ϣ��null��Promise����
   */
  async getSummonerAlias(name: string, tag: string) {
    const response = await this.getSummonerAliases([{ gameName: name, tagLine: tag }])
    const result = response.data[0]
    return result || null
  }

  /**
   * ��ȡ��ǰ�ٻ�ʦ��������������
   * @returns {Promise<SummonerProfile>} ���������������ϵ�Promise����
   */
  getCurrentSummonerProfile() {
    return this._http.get<SummonerProfile>('/lol-summoner/v1/current-summoner/summoner-profile')
  }

  /**
   * ����PUUID��ȡָ���ٻ�ʦ�ĸ�������
   * @param {string} puuid - ��ҵ�ȫ��Ψһ��ʶ��
   * @returns {Promise<SummonerProfile>} �����ٻ�ʦ�������ϵ�Promise����
   */
  getSummonerProfile(puuid: string) {
    return this._http.get<SummonerProfile>(`/lol-summoner/v1/summoner-profile`, {
      params: { puuid }
    })
  }
}
