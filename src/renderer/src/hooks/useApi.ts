import Request from '../../../manager/utils/request'
import { LeagueClientHttpApi } from '../../../manager/api/leagueCilent'
import { useLeague } from '../store/league'

const leagueStore = useLeague()
const request = new Request({
  baseURL: `yyy://lol-client`,
  adapter: 'fetch',
})
export const useApi = () => LeagueClientHttpApi.getInstance(request.http)
