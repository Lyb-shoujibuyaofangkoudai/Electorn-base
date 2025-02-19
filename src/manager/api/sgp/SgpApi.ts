import axios, { AxiosInstance } from 'axios'
import { Readable } from 'stream'
import { Core } from '../../Core'
import {
  AvailableServersMap,
  SgpGameDetailsLol,
  SgpGameSummaryLol,
  SgpMatchHistoryLol,
  SgpRankedStats,
  SgpSummoner,
  SpectatorData
} from './types'

import { AxiosRetry } from 'axios-retry'
import Request from '../../utils/request'
import { AsyncQueue } from '../../utils/AsyncQueue'

const axiosRetry = require('axios-retry').default as AxiosRetry

export class SgpApi {

  static USER_AGENT = 'LeagueOfLegendsClient/14.13.596.7996 (rcp-be-lol-match-history)'

  private _availableSgpServers: AvailableServersMap = {
    servers: {},
    tencentServerMatchHistoryInteroperability: [],
    tencentServerSpectatorInteroperability: [],
    tencentServerSummonerInteroperability: []
  }

  private _asyncEntTokenQueue = new AsyncQueue({
    concurrency: 10, // 最大并发数
    autoStart: false // 自动启动
  })
  private _asyncLeagueSessionQueue = new AsyncQueue({
    concurrency: 10, // 最大并发数
    autoStart: false // 自动启动
  })



  /**
   * SGP API 需要用户登录的 Session
   */
  private _entitlementToken: string | null = null
  private _lolLeagueSessionToken: string | null = null

  get entitlementToken(): string | null {
    return this._entitlementToken
  }

  get lolLeagueSessionToken(): string | null {
    return this._lolLeagueSessionToken
  }

  private _http: AxiosInstance = new Request({
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

    if ( !server ) {
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


  setEntitlementsToken(token: string | null) {
    this._entitlementToken = token
    if(token) {
      this._asyncEntTokenQueue.start()
    }
  }

  setLolLeagueSessionToken(token: string) {
    this._lolLeagueSessionToken = token
    this._asyncLeagueSessionQueue.start()
  }

  private _getSgpServer(sgpServerId: string) {
    const sgpServer = this._availableSgpServers.servers[sgpServerId.toUpperCase()]
    if ( !sgpServer ) {
      throw new Error(`unknown sgpServerId: ${ sgpServerId }`)
    }

    return sgpServer
  }

  /**
   * 对于腾讯系, 仅保留其 rsoPlatformId
   * @param sgpServerId
   */
  private _getSubId(sgpServerId: string) {
    if ( sgpServerId.startsWith('TENCENT') ) {
      const [ _, rsoPlatformId ] = sgpServerId.split('_')
      return rsoPlatformId
    }

    return sgpServerId
  }

  /**
   * todo: 待优化，这个写法不好
   * 渲染进程发起的请求 被yyy://sgp拦截代理后使用的总方法
   * 用于请求SGP API的总方法
   * @param params
   */
  async requestSgp(params:any) {
    try {
      let res
      switch ( params['methodsName'] ) {
        case 'getMatchHistory' : {
          if ( !this._entitlementToken )
            res = await this._asyncEntTokenQueue.add(() => this.getMatchHistory(params['sgpServerId'], params['playerPuuid'], params['start'], params['count'], params['tag']))
          else
            res = await this.getMatchHistory(params['sgpServerId'], params['playerPuuid'], params['start'], params['count'], params['tag'])
          break
        }

        case 'getSpectatorGameflowByPuuid' : {
          if ( !this._lolLeagueSessionToken )
            res = await this._asyncLeagueSessionQueue.add(() => this.getSpectatorGameflowByPuuid(params['sgpServerId'], params['playerPuuid']))
          else
            res = await this.getSpectatorGameflowByPuuid(params['sgpServerId'], params['playerPuuid'])
          break
        }
        case 'getRankedStats' : {
          if ( !this._lolLeagueSessionToken )
            res = await this._asyncLeagueSessionQueue.add(() => this.getRankedStats(params['platformId'], params['playerPuuid']))
          else
            res = await this.getRankedStats(params['platformId'], params['playerPuuid'])
          break
        }
        case 'getSummonerByPuuid' : {
          if ( !this._lolLeagueSessionToken )
            res = await this._asyncLeagueSessionQueue.add(() => this.getSummonerByPuuid(params['sgpServerId'], params['playerPuuid']))
          else
            res = await this.getSummonerByPuuid(params['sgpServerId'], params['playerPuuid'])
          break
        }
        case 'getGameSummary' : {
          if ( !this._entitlementToken )
            res = await this._asyncEntTokenQueue.add(() => this.getGameSummary(params['sgpServerId'], params['gameId']))
          else
            res = await this.getGameSummary(params['sgpServerId'], params['gameId'])
          break
        }
        case 'getGameDetails' : {
          if ( !this._entitlementToken )
            res = await this._asyncEntTokenQueue.add(() => this.getGameDetails(params['sgpServerId'], params['gameId']))
          else
            res = await this.getGameDetails(params['sgpServerId'], params['gameId'])
          break
        }
        case 'getMatchHistoryReplayStream' : {
          if ( !this._lolLeagueSessionToken )
            res = await this._asyncLeagueSessionQueue.add(() => this.getMatchHistoryReplayStream(params['sgpServerId'], params['gameId']))
          else
            res = await this.getMatchHistoryReplayStream(params['sgpServerId'], params['gameId'])
          break
        }
        default:
          throw new Error('Unsupported method');
      }
      const resHeaders: any = Object.fromEntries(
        Object.entries(res.headers).filter(([ _, value ]) => typeof value === 'string')
      )
      return new Response(res.status === 204 || res.status === 304 ? null : JSON.stringify(res.data), {
        statusText: res.statusText,
        headers: resHeaders,
        status: res.status
      })
    } catch ( e ) {
      Core.getInstance()?.logger.error(`请求SGP API接口失败：${ e }`)
      throw e
    }
  }

  async getMatchHistory(
    sgpServerId: string,
    playerPuuid: string,
    start: number,
    count: number,
    tag?: string
  ) {
    if ( !this._entitlementToken ) {
      throw new Error('jwt token is not set')
    }
    const sgpServer = this._getSgpServer(sgpServerId)
    return this._http.get<SgpMatchHistoryLol>(
      `/match-history-query/v1/products/lol/player/${ playerPuuid }/SUMMARY`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${ this._entitlementToken }`
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
    if ( !this._entitlementToken ) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<SgpGameSummaryLol>(
      `/match-history-query/v1/products/lol/${ subId.toUpperCase() }_${ gameId }/SUMMARY`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${ this._entitlementToken }`
        }
      }
    )
  }

  getGameDetails(sgpServerId: string, gameId: number) {
    if ( !this._entitlementToken ) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<SgpGameDetailsLol>(
      `/match-history-query/v1/products/lol/${ subId.toUpperCase() }_${ gameId }/DETAILS`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${ this._entitlementToken }`
        }
      }
    )
  }

  getRankedStats(platformId: string, puuid: string) {
    if ( !this._lolLeagueSessionToken ) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(platformId)

    return this._http.get<SgpRankedStats>(`/leagues-ledge/v2/rankedStats/puuid/${ puuid }`, {
      baseURL: sgpServer.common,
      headers: {
        Authorization: `Bearer ${ this._lolLeagueSessionToken }`
      }
    })
  }

  getSummonerByPuuid(sgpServerId: string, puuid: string) {
    if ( !this._lolLeagueSessionToken ) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.post<SgpSummoner[]>(
      `/summoner-ledge/v1/regions/${ subId.toLowerCase() }/summoners/puuids`,
      [ puuid ],
      {
        baseURL: sgpServer.common,
        headers: {
          Authorization: `Bearer ${ this._lolLeagueSessionToken }`
        }
      }
    )
  }

  getSpectatorGameflowByPuuid(sgpServerId: string, puuid: string) {
    if ( !this._lolLeagueSessionToken ) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<SpectatorData>(`/gsm/v1/ledge/spectator/region/${ subId }/puuid/${ puuid }`, {
      baseURL: sgpServer.common,
      headers: {
        Authorization: `Bearer ${ this._lolLeagueSessionToken }`
      }
    })
  }

  getMatchHistoryReplayStream(sgpServerId: string, gameId: number) {
    if ( !this._lolLeagueSessionToken ) {
      throw new Error('jwt token is not set')
    }

    const sgpServer = this._getSgpServer(sgpServerId)

    const subId = this._getSubId(sgpServerId)

    return this._http.get<Readable>(
      `/match-history-query/v3/product/lol/matchId/${ subId.toUpperCase() }_${ gameId }/infoType/replay`,
      {
        baseURL: sgpServer.matchHistory,
        headers: {
          Authorization: `Bearer ${ this._lolLeagueSessionToken }`
        },
        responseType: 'stream'
      }
    )
  }
}
