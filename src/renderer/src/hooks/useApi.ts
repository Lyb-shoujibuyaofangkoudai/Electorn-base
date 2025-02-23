import Request from '../../../manager/utils/request'
import { LeagueClientHttpApi } from '../../../manager/api/leagueCilent'
import { SgpRendererApi } from '../../../manager/api/sgp/SgpRendererApi'

const lcuRequest = new Request({
  baseURL: import.meta.env.VITE_CUS_SCHEME_LCU_URL,
  adapter: 'fetch',
})
const sgpRequest = new Request({
  baseURL: import.meta.env.VITE_CUS_SCHEME_SGP_URL,
  adapter: 'fetch',
})
export const useApi = (): {
  lcuApi: LeagueClientHttpApi,
  sgpApi: SgpRendererApi
} => ({
  lcuApi: LeagueClientHttpApi.getInstance(lcuRequest.http),
  sgpApi: SgpRendererApi.getInstance(sgpRequest.http),
})
