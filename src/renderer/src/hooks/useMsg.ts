import { ConfigProviderProps } from 'naive-ui'
import { useConfig } from '../store/config'
import { nativeDarkTheme } from '../theme/nativeDarkTheme'

const configStore = useConfig()
const configProviderPropsRef = computed(() => ({
  theme: configStore.configInfo.theme === 'dark' ? nativeDarkTheme : nativeDarkTheme
}))

export const useMsg = () => {
  return createDiscreteApi(
    [ 'message', 'dialog', 'notification', 'loadingBar', 'modal' ],
    {
      configProviderProps: configProviderPropsRef as ConfigProviderProps
    }
  )
}
