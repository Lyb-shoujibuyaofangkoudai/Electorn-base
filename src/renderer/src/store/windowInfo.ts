import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useWindowInfo = defineStore('winInfo', () => {
  // 窗口是否最大化
  const isMaxWindow = ref(false)

  function setIsWindowMaximization(isMax: boolean) {
    isMaxWindow.value = isMax
  }
  return {
    isMaxWindow,
    setIsWindowMaximization
  }

})

if ( import.meta.hot )
  import.meta.hot.accept(acceptHMRUpdate(useWindowInfo as any, import.meta.hot))
