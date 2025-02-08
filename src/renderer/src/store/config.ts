import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfig = defineStore('config', () => {
  const configInfo = ref<any>({})
  function setConfig(cfg: any) {
    configInfo.value = cfg
  }

  function addConfig(cfg: any) {
    configInfo.value = { ...configInfo.value, ...cfg }
  }

  return {
    configInfo,
    setConfig,
    addConfig
  }

})

if ( import.meta.hot )
  import.meta.hot.accept(acceptHMRUpdate(useConfig as any, import.meta.hot))
