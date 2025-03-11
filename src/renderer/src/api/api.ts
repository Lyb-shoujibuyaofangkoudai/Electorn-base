import { RankedStats } from '../../../manager/api/leagueCilent/types/ranked'
import { SummonerInfo } from '../../../manager/api/leagueCilent/types/summoner'

const api = useApi()
const logger = useLogger()
/**
 * 根据puuid获取玩家的信息和排位信息
 * @param puuid
 * @param sgpServerId sgp服务器id 当type为sgp时必填
 * @param type sgp or lcu
 */
export async function getSummonerInfoAndRankedInfoByPuuid(puuid: string, sgpServerId?: string, type = 'sgp'): Promise<{
  rankedInfo: RankedStats | null,
  summonerInfo: SummonerInfo | null,
}> {
  try {
    const promiseArr:any[] = []
    if(type === 'sgp') {
      if(!sgpServerId) {
        logger.error('sgp服务器id不能为空')
        return {
          rankedInfo: null,
          summonerInfo: null,
        }
      }
      promiseArr.push(api.sgpApi.getSummonerByPuuid(sgpServerId,puuid))
      promiseArr.push(api.sgpApi.getRankedStats(sgpServerId,puuid))
    } else {
      promiseArr.push(api.lcuApi.summoner.getSummonerByPuuid(puuid))
      promiseArr.push(api.lcuApi.ranked.getRankedStats(puuid))
    }
    const res = await Promise.allSettled(promiseArr)
    if(!res.length) return {
      rankedInfo: null,
      summonerInfo: null,
    }

    return {
      summonerInfo: res[0].status === "fulfilled" ? type === 'sgp' ? res[0].value.data[0] :res[0].value.data : null,
      rankedInfo: res[1].status === "fulfilled"? res[1].value.data : null,
    }
  } catch ( e ) {
    logger.error(`获取数据失败：${e}`)
    return {
      rankedInfo: null,
      summonerInfo: null,
    }
  }
}
