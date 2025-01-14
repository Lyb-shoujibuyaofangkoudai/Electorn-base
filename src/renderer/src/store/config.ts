import { acceptHMRUpdate, defineStore } from 'pinia'
import { ref } from 'vue'

export const useConfig = defineStore('config', () => {
  const theme = ref('dark')

  function setTheme(themeName: string) {
    theme.value = themeName
  }
  return {
    theme,
    setTheme
  }

})

if ( import.meta.hot )
  import.meta.hot.accept(acceptHMRUpdate(useConfig as any, import.meta.hot))
