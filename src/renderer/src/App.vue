<template>
  <n-config-provider
    :theme="theme"
    :theme-overrides="themeOverrides">
    <n-global-style />
    <!--    <n-theme-editor>-->
    <NScrollbar :class="`bg-c_wc-top ${!windowInfoStore.isMaxWindow ? 'rounded-xl' : ''}`">
      <HomeLayout>
        <RouterView v-slot="{ Component, route  }">
          <transition :name="'fade'">
            <component
              :is="Component"
              v-if="Component"
              key="route.path" />
          </transition>
        </RouterView>
      </HomeLayout>
    </NScrollbar>
    <!--    </n-theme-editor>-->
  </n-config-provider>
</template>
<script
  lang="ts"
  setup>
import { NScrollbar } from 'naive-ui'
import HomeLayout from './layout/HomeLayout.vue'
import { useWindowInfo } from './store/windowInfo'
import { useIpc } from './hooks/useIpc'
import { EVENT_TYPE } from '../../manager/plugins/Bridge/eventType'
import { useConfig } from './store/config'
import { nativeDarkTheme } from './theme/nativeDarkTheme'
import { useLeague } from './store/league'
import { useThemeStore } from './store/theme'

const themeStore = useThemeStore()
const windowInfoStore = useWindowInfo()
const ipc = useIpc()
const configStore = useConfig()
const leagueStore = useLeague()
const { theme, themeOverrides,themeConfig, neutralThemeConfig} = storeToRefs(themeStore)

getConfigInfo()

async function getConfigInfo() {
  const res = await ipc.call(EVENT_TYPE.SET_DETAILS)
  if ( !res.data ) return
  configStore.setConfig(res.data)
  useStorage('config', {}).value = res.data // 保存一份数据在本地
}

getLeagueInfo()

async function getLeagueInfo() {
  ipc.onEvent(
    EVENT_TYPE.SET_LOL_DETAILS,
    (data) => {
      if ( data?.data ) {
        leagueStore.setLeagueInfo(data.data)
      }
    }
  )
}


initTheme()
function initTheme() {
  // todo；存储数据到本地 待选库
  const localThemeConfig = useStorage('themeConfig',{})
  const localNeutralThemeConfig = useStorage('neutralThemeConfig',{})
  console.log("初始化主题，获取本地主题配置",localThemeConfig.value,localNeutralThemeConfig.value)
  if(!Object.keys(localThemeConfig.value).length) {
    themeStore.setThemeConfig(localThemeConfig.value as NTheme.Config)
  }
  if(!Object.keys(localNeutralThemeConfig.value).length) {
    themeStore.setNeutralThemeConfig(localNeutralThemeConfig.value as NTheme.NeutralThemeType)
  }
}


</script>

<style
  lang="scss"
  scoped></style>
