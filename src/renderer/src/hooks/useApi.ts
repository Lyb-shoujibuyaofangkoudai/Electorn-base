import Request from '../../../manager/utils/request'
import { LeagueClientHttpApi } from '../../../manager/api/leagueCilent'

const lcuRequest = new Request({
  baseURL: import.meta.env.VITE_CUS_SCHEME_LCU_URL,
  adapter: 'fetch',
})
const sgpRequest = new Request({
  baseURL: import.meta.env.VITE_CUS_SCHEME_RIOT_URL,
  adapter: 'fetch',
})
export const useApi = (): {
  lcuApi: LeagueClientHttpApi,
  sgpApi: any
} => ({
  lcuApi: LeagueClientHttpApi.getInstance(lcuRequest.http),
  sgpApi: {}
})
