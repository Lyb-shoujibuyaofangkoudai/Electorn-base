import Request from '../../../manager/utils/request'
import { LeagueClientHttpApi } from '../../../manager/api/leagueCilent'

const request = new Request({
  baseURL: import.meta.env.VITE_CUS_SCHEME_LCU_URL,
  adapter: 'fetch',
})
export const useApi = () => LeagueClientHttpApi.getInstance(request.http)
