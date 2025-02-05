<template>
  <n-config-provider :theme="theme"
                     :theme-overrides="theme ? nativeDarkTheme : nativeDarkTheme">
<!--    <n-theme-editor>-->
      <NScrollbar :class="`bg-c_wc-top ${!windowInfoStore.isMaxWindow ? 'rounded-xl' : ''}`">
        <HomeLayout>
          <RouterView v-slot="{ Component,route  }">
            <transition :name="route.meta.transition || 'fade'">
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
import {  NScrollbar } from 'naive-ui'
import HomeLayout from './layout/HomeLayout.vue'
import { useWindowInfo } from './store/windowInfo'
import { useIpc } from './hooks/useIpc'
import { EVENT_TYPE } from '../../manager/plugins/Bridge/eventType'
import { useConfig } from './store/config'
import { nativeDarkTheme } from './theme/nativeDarkTheme'

// todo: 主题切换
const theme = null
const windowInfoStore = useWindowInfo()
const ipc = useIpc()
const configStore = useConfig()


function changeTheme(e: string) {
  document.documentElement.className = e
}

getConfigInfo()

async function getConfigInfo() {
  const res = await ipc.call(EVENT_TYPE.SET_LOL_DETAILS)
  if ( !res.data ) return
  configStore.setConfig(res.data)
  changeTheme(res.data?.theme?.name ?? 'dark') // 默认暗色主题
  useStorage('config', {}).value = res.data // 保存一份数据在本地
}





</script>

<style
  lang="scss"
  scoped></style>
