import {
  SgpGameDetailsLol,
  SgpGameSummaryLol,
  SgpMatchHistoryLol,
  SgpRankedStats,
  SgpSummoner,
  SpectatorData
} from './types'
import { AxiosInstance } from 'axios'
import { Readable } from 'stream'

export class SgpRendererApi {
  private _http: AxiosInstance

  constructor(_http: AxiosInstance) {
    this._http = _http
  }
  static _instance: SgpRendererApi
  static getInstance(_http: AxiosInstance) {
    if (!SgpRendererApi._instance) {
      SgpRendererApi._instance = new SgpRendererApi(_http)
    }
    return SgpRendererApi._instance
  }

  getMatchHistory(
    sgpServerId: string,
    playerPuuid: string,
    start: number,
    count: number,
    tag?: string
  ) {
    return this._http.get<SgpMatchHistoryLol>(
      `/match-history-query/v1/products/lol/player/${ playerPuuid }/SUMMARY`,
      {
        params: {
          methodsName: 'getMatchHistory',
          startIndex: start,
          count,
          tag,
          sgpServerId,
          playerPuuid
        }
      }
    )
  }

  getGameSummary(
    sgpServerId: string,
    gameId: number
  ) {
    return this._http.get<SgpGameSummaryLol>(
      `/match-history-query/v1/products/lol/${ sgpServerId }_${ gameId }/SUMMARY`,
      {
        params: {
          methodsName: 'getGameSummary',
          sgpServerId,
          gameId
        }
      }
    )
  }

  getGameDetails(
    sgpServerId: string,
    gameId: number
  ) {
    return this._http.get<SgpGameDetailsLol>(
      `/match-history-query/v1/products/lol/${ sgpServerId }_${ gameId }/DETAILS`,
      {
        params: {
          methodsName: 'getGameDetails',
          sgpServerId,
          gameId
        }
      }
    )
  }

  getRankedStats(
    sgpServerId: string,
    puuid: string
  ) {
    return this._http.get<SgpRankedStats>(
      `/leagues-ledge/v2/rankedStats/puuid/${ puuid }`,
      {
        params: {
          methodsName: 'getRankedStats',
          sgpServerId,
          playerPuuid: puuid
        }
      })
  }

  getSummonerByPuuid(
    sgpServerId: string,
    puuid: string
  ) {
    return this._http.post<SgpSummoner[]>(
      `/summoner-ledge/v1/regions/${ sgpServerId }/summoners/puuids`,
      [ puuid ],
      {
        params: {
          methodsName: 'getSummonerByPuuid',
          sgpServerId,
          playerPuuid: puuid
        }
      }
    )
  }

  getSpectatorGameflowByPuuid(
    sgpServerId: string,
    puuid: string
  ) {
    return this._http.get<SpectatorData>(
      `/gsm/v1/ledge/spectator/region/${ sgpServerId }/puuid/${ puuid }`,
      {
        params: {
          methodsName: 'getSpectatorGameflowByPuuid',
          sgpServerId,
          playerPuuid: puuid
        }
      })
  }

  getMatchHistoryReplayStream(
    sgpServerId: string,
    gameId: number
  ) {
    return this._http.get<Readable>(
      `/match-history-query/v3/product/lol/matchId/${sgpServerId}_${gameId}/infoType/replay`,
      {
        responseType: 'stream',
        params: {
          methodsName: 'getMatchHistoryReplayStream',
          sgpServerId,
          gameId
        }
      }
    )
  }
}
