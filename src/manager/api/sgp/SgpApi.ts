import axios, { AxiosInstance } from 'axios'
import { Readable } from 'stream'

import {
  AvailableServersMap,
  SgpGameDetailsLol,
  SgpGameSummaryLol,
  SgpMatchHistoryLol,
  SgpRankedStats,
  SgpSummoner,
  SpectatorData
} from './types'
import axiosRetry from 'axios-retry';
import Request from '../../utils/request'


export class SgpApi {
  static USER_AGENT = 'LeagueOfLegendsClient/14.13.596.7996 (rcp-be-lol-match-history)'

  private _availableSgpServers: AvailableServersMap = {
    servers: {},
    tencentServerMatchHistoryInteroperability: [],
    tencentServerSpectatorInteroperability: [],
    tencentServerSummonerInteroperability: []
  }

  /**
   * SGP API 需要用户登录的 Session
   */
  private _entitlementToken: string | null = null
  private _lolLeagueSessionToken: string | null = null
  // private _http = axios.create({
  //   headers: {
  //     'User-Agent': SgpApi.USER_AGENT
  //   }
  // })
  private _http:AxiosInstance = new Request({
    headers: {
      'User-Agent': SgpApi.USER_AGENT
    }
  }).http

  constructor() {
    axiosRetry(this._http as any, {
      // 最大重试次数
      retries: 3,
      // 重复请求延迟（毫秒）
      retryDelay: () => 0,
      // 重试条件
      retryCondition: (error) => {
        return Boolean(error.response)
      }
    })
  }

  setAvailableSgpServers(servers: AvailableServersMap) {
    this._availableSgpServers = servers
  }

  supportsSgpServer(sgpServerId: string) {
    const server = this._availableSgpServers.servers[sgpServerId.toUpperCase()]

    if (!server) {
      return {
        matchHistory: false,
        common: false
      }
    }

    return {
      matchHistory: Boolean(server.matchHistory),
      common: Boolean(server.common)
    }
  }

  sgpServers() {
    return this._availableSgpServers
  }

  hasEntitlementsToken() {
    return this._entitlementToken !== null
  }

  hasLolLeagueSessionToken() {
    return this._lolLeagueSessionToken !== null
  }

  setEntitlementsToken(token: string | null) {
    this._entitlementToken = token
  }

  setLolLeagueSessionToken(token: string) {
    this._lolLeagueSessionToken = token
  }

  private _getSgpServer(sgpServerId: string) {
    const sgpServer = this._availableSgpServers.servers[sgpServerId.toUpperCase()]
    if (!sgpServer) {
      throw new Error(`unknown sgpServerId: ${sgpServerId}`)
    }

    return sgpServer
  }

  /**
   * 对于腾讯系, 仅保留其 rsoPlatformId
   * @param sgpServerId
   */
  private _getSubId(sgpServerId: string) {
    if (sgpServerId.startsWith('TENCENT')) {
      const [_, rsoPlatformId] = sgpServerId.split('_')
      return rsoPlatformId
    }

    return sgpServerId
  }

  async getMatchHistory(
    sgpServerId: string,
    playerPuuid: string,
    start: number,
    count: number,
    tag?: string
  ) {
    if (!this._entitlementToken) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    return this._http.get<SgpMatchHistoryLol>(
      `/match-history-query/v1/products/lol/player/${playerPuuid}/SUMMARY`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${this._entitlementToken}`
        },
        params: {
          startIndex: start,
          count,
          tag
        }
      }
    )
  }

  getGameSummary(sgpServerId: string, gameId: number) {
    if (!this._entitlementToken) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<SgpGameSummaryLol>(
      `/match-history-query/v1/products/lol/${subId.toUpperCase()}_${gameId}/SUMMARY`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${this._entitlementToken}`
        }
      }
    )
  }

  getGameDetails(sgpServerId: string, gameId: number) {
    if (!this._entitlementToken) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<SgpGameDetailsLol>(
      `/match-history-query/v1/products/lol/${subId.toUpperCase()}_${gameId}/DETAILS`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${this._entitlementToken}`
        }
      }
    )
  }

  getRankedStats(platformId: string, puuid: string) {
    if (!this._lolLeagueSessionToken) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(platformId)

    return this._http.get<SgpRankedStats>(`/leagues-ledge/v2/rankedStats/puuid/${puuid}`, {
      baseURL: sgpServer.common,
      headers: {
        Authorization: `Bearer ${this._lolLeagueSessionToken}`
      }
    })
  }

  getSummonerByPuuid(sgpServerId: string, puuid: string) {
    if (!this._lolLeagueSessionToken) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.post<SgpSummoner[]>(
      `/summoner-ledge/v1/regions/${subId.toLowerCase()}/summoners/puuids`,
      [puuid],
      {
        baseURL: sgpServer.common,
        headers: {
          Authorization: `Bearer ${this._lolLeagueSessionToken}`
        }
      }
    )
  }

  getSpectatorGameflowByPuuid(sgpServerId: string, puuid: string) {
    if (!this._lolLeagueSessionToken) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<SpectatorData>(`/gsm/v1/ledge/spectator/region/${subId}/puuid/${puuid}`, {
      baseURL: sgpServer.common,
      headers: {
        Authorization: `Bearer ${this._lolLeagueSessionToken}`
      }
    })
  }

  getMatchHistoryReplayStream(sgpServerId: string, gameId: number) {
    if (!this._lolLeagueSessionToken) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<Readable>(
      `/match-history-query/v3/product/lol/matchId/${subId.toUpperCase()}_${gameId}/infoType/replay`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${this._lolLeagueSessionToken}`
        },
        responseType: 'stream'
      }
    )
  }
}
