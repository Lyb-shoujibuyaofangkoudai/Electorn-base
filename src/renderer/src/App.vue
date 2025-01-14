<template>
  <n-config-provider :theme="darkTheme">
    <NScrollbar :class="`bg-c_wc-top ${!windowInfoStore.isMaxWindow ? 'rounded-xl' : ''}`">
      <HomeLayout>
        <RouterView v-slot="{ Component,route  }">
          <transition :name="route.meta.transition || 'fade'">
            <component v-if="Component" :is="Component" key="route.path" />
          </transition>
        </RouterView>
      </HomeLayout>
    </NScrollbar>
  </n-config-provider>
</template>
<script lang="ts" setup>
import { darkTheme, NScrollbar } from 'naive-ui'
// import { ref } from 'vue'
// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
import HomeLayout from './layout/HomeLayout.vue'
import { useWindowInfo } from './store/windowInfo'


const windowInfoStore = useWindowInfo()

console.log("查看：",window?.electron)
// changeTheme('light')
changeTheme('dark')
function changeTheme(e: string) {
  document.documentElement.className = e
}
</script>

<style lang="scss" scoped></style>
