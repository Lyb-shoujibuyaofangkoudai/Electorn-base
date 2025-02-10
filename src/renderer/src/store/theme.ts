import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import { darkTheme, commonDark, commonLight, GlobalThemeOverrides } from 'naive-ui'
import { useColorMode, useCycleList, type BasicColorSchema } from '@vueuse/core'
import { getGenerateColors, getThemeOverrides } from '../utils/themeHelper'

export const useThemeStore = defineStore('theme', () => {
  /** 默认模式，一般设置为auto跟随系统 */
  const defaultMode = ref<BasicColorSchema>('auto')
  /** 模式列表 */
  const modeList = ref<BasicColorSchema[]>(['dark', 'light', 'auto'])

  const colorMode = useColorMode({
    initialValue: defaultMode.value,
    emitAuto: true
  })
  const { state, next } = useCycleList(modeList, {
    initialValue: colorMode
  })
  watch(
    state,
    () => {
      if (!modeList.value.includes(state.value)) {
        // 如果不在modeList里面，就设置成默认的
        state.value = defaultMode.value
      }
      colorMode.value = state.value as BasicColorSchema
    },
    { immediate: true }
  )

  /** 暗黑模式 */
  const darkMode = computed(() => {
    const { system, store } = colorMode
    if (state.value === 'auto') {
      return system.value === 'dark'
    }
    return store.value === 'dark'
  })

  /** 主题 */
  const theme = computed(() => (darkMode.value ? darkTheme : null))

  /** 主题配置 */
  const themeConfig = ref<NTheme.Config>({
    primary: '#1677ff',
    info: '#722ed1',
    success: '#52c41a',
    warning: '#faad14',
    error: '#f5222d',
  })
  /**
   * 中性色配置，主要用于背景
   */
  const neutralThemeConfig = ref<NTheme.NeutralThemeType>({
    neutralPopover:{
      color:  '#2D3260',
      effects: ['popoverColor'],
      title: "neutralPopover"
    },
    neutralCard:{
      color:  '#2D3260',
      effects: ['tableColor','cardColor'],
      title: "neutralCard"
    },
    neutralModal:{
      color:  '#2D3260',
      effects: ['modalColor'],
      title: "neutralModal"
    },
    neutralBody:{
      color:  '#2D3260',
      effects: ['bodyColor'],
      title: "neutralBody"
    },
  })
  /** 主题theme-overrides */
  const themeOverrides = computed(() => {
    const localThemeConfig = useStorage('themeConfig',{})
    const localNeutralThemeConfig = useStorage('neutralThemeConfig',{})
    if(!Object.keys(localThemeConfig.value).length) {
      localThemeConfig.value = themeConfig.value
    }
    if(!Object.keys(localNeutralThemeConfig.value).length) {
      localNeutralThemeConfig.value = neutralThemeConfig.value
    }
    return getThemeOverrides(themeConfig.value,neutralThemeConfig.value, darkMode.value)
  })

  /** 主题颜色 */
  const themeColors = computed(() => {
    const entries = Object.entries(themeConfig.value) as [
      NTheme.ColorType,
      string
    ][]
    const colors = {} as Record<NTheme.ColorType, string[]>
    entries.forEach(([key, value]) => {
      colors[key] = getGenerateColors(value, darkMode.value)
    })
    return colors
  })

  /** 暗黑模式切换 */
  function toggleDarkMode() {
    next()
  }

  /** 手动设置主题 */
  function setThemeConfig(config: NTheme.Config) {
    themeConfig.value = {
      ...themeConfig.value,
      ...config
    }
  }

  /** 手动设置中性色 */
  function setNeutralThemeConfig(config: NTheme.NeutralThemeType) {
    neutralThemeConfig.value = {
     ...neutralThemeConfig.value,
     ...config
    }
  }

  /**
   * 保存主题配置到本地
   */
  function saveThemeConfigsToLocal() {
    const localThemeConfig = useStorage('themeConfig',{})
    localThemeConfig.value = themeConfig.value
    const localNeutralThemeConfig = useStorage('neutralThemeConfig',{})
    localNeutralThemeConfig.value = neutralThemeConfig.value
  }

  return {
    darkMode,
    themeConfig,
    theme,
    themeOverrides,
    themeColors,
    modeState: state,
    toggleDarkMode,
    setThemeConfig,
    setNeutralThemeConfig,
    neutralThemeConfig,
    saveThemeConfigsToLocal
  }
})
