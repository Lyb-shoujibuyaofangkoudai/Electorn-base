import { AxiosInstance } from 'axios'

import { PlayerAccountHttpApi } from './player-account'

export class RiotClientHttpApi {
  public readonly playerAccount: PlayerAccountHttpApi

  static _instance: RiotClientHttpApi
  static getInstance(http: AxiosInstance) {
    if (!RiotClientHttpApi._instance) {
      RiotClientHttpApi._instance = new RiotClientHttpApi(http)
    }
    return RiotClientHttpApi._instance
  }

  constructor(private _http: AxiosInstance) {
    this.playerAccount = new PlayerAccountHttpApi(this._http)
  }
}
