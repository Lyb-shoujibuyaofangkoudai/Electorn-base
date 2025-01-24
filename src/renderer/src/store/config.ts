import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfig = defineStore('config', () => {
  const configInfo = ref<any>({})
  function setConfig(cfg: any) {
    configInfo.value = cfg
  }
  return {
    configInfo,
    setConfig
  }

})

if ( import.meta.hot )
  import.meta.hot.accept(acceptHMRUpdate(useConfig as any, import.meta.hot))
