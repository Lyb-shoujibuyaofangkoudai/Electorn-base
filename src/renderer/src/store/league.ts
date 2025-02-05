import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useLeague = defineStore('league', () => {
  const leagueInfo = ref<any>({})
  function setLeagueInfo(data: any) {
    leagueInfo.value = data
  }
  return {
    leagueInfo,
    setLeagueInfo
  }

})

if ( import.meta.hot )
  import.meta.hot.accept(acceptHMRUpdate(useLeague as any, import.meta.hot))
