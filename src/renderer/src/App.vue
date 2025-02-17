<template>
  <n-config-provider
    :date-locale="dateZhCN"
    :locale="zhCN"
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
import { NScrollbar, zhCN, dateZhCN } from 'naive-ui'
import HomeLayout from './layout/HomeLayout.vue'
import { useWindowInfo } from './store/windowInfo'
import { useIpc } from './hooks/useIpc'
import { EVENT_TYPE } from '../../manager/plugins/Bridge/eventType'
import { useConfig } from './store/config'
import { useLeague } from './store/league'
import { useThemeStore } from './store/theme'
import { useRequestDataStore } from './store/requestDataStore'
import { useApi } from './hooks/useApi'

const themeStore = useThemeStore()
const windowInfoStore = useWindowInfo()
const ipc = useIpc()
const configStore = useConfig()
const leagueStore = useLeague()
const requestDataStore = useRequestDataStore()
const api = useApi()
const { theme, themeOverrides, themeConfig, neutralThemeConfig } = storeToRefs(themeStore)

getConfigInfo()

async function getConfigInfo() {
  const res = await ipc.call(EVENT_TYPE.SET_DETAILS)
  if ( !res.data ) return
  configStore.setConfig(res.data)
  initTheme()
}

function initTheme() {
  const { themeConfig, neutralThemeConfig } = configStore.configInfo
  if ( themeConfig ) themeStore.setThemeConfig(themeConfig as NTheme.Config)
  if ( neutralThemeConfig ) themeStore.setNeutralThemeConfig(neutralThemeConfig as NTheme.NeutralThemeType)
}

getLeagueInfo()

async function getLeagueInfo() {
  ipc.onEvent(
    EVENT_TYPE.SET_LOL_DETAILS,
    (data) => {
      if(data?.data && !leagueStore.leagueInfo) {
        leagueStore.setLeagueInfo(data.data)
      }
      getSummonerInfo()
    },
  )
  const res = await ipc.call(
    EVENT_TYPE.SET_LOL_DETAILS
  )
  leagueStore.setLeagueInfo(res.data)
}


async function getSummonerInfo() {
  try {
    if ( requestDataStore.getRequestData('summoner') ) return
    await requestDataStore.fetchData('summoner', async () => await api.lcuApi.summoner.getCurrentSummoner())
  } catch ( e ) {
    //这里打开软件之后再开启Lol客户端时马上去请求会报错，因为LOL客户端并没有立即启动，所以这里需要做一下处理
    console.log(e)
  }
}


</script>

<style
  lang="scss"
  scoped></style>
