import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useLeague = defineStore('league', () => {
  const leagueInfo = ref<any>({})
  const isSgpApiAvailable = ref(true)

  function setLeagueInfo(data: any) {
    leagueInfo.value = data
  }

  function setSgpApiAvailable(available: boolean) {
    isSgpApiAvailable.value = available
  }

  return {
    leagueInfo,
    isSgpApiAvailable,
    setLeagueInfo,
    setSgpApiAvailable
  }
})

if (import.meta.hot)
  import.meta.hot.accept(acceptHMRUpdate(useLeague as any, import.meta.hot))
