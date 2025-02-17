import { AxiosInstance } from 'axios'

export class LolLeagueSessionHttpApi {
  constructor(private _http: AxiosInstance) {}

  /**
   * Lol League Session Token
   * 主要用于获取 Lol League Session Token
   */
  getLolLeagueSessionToken() {
    return this._http.get<string>('/lol-league-session/v1/league-session-token')
  }
}
