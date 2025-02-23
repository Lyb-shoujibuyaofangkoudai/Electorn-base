import { LoginQueueState } from './types/login'
import { AxiosInstance } from 'axios'

export class LoginHttpApi {
  constructor(private _http: AxiosInstance) {}

  dodge() {
    return this._http.post(
      '/lol-login/v1/session/invoke',
      {
        data: ['', 'teambuilder-draft', 'quitV2', '']
      },
      {
        params: {
          destination: 'lcdsServiceProxy',
          method: 'call',
          args: '["", "teambuilder-draft", "quitV2", ""]'
        }
      }
    )
  }

  getLoginQueueState() {
    return this._http.get<LoginQueueState>('/lol-login/v1/login-queue-state')
  }

  getLoginSession() {
    return this._http.get('/lol-login/v1/session')
  }

}
