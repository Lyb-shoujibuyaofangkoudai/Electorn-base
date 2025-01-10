<template>
  <n-config-provider :theme="darkTheme">
    <NScrollbar :class="`bg-c_wc-top ${!winInfoStore.isMaxWindow ? 'rounded-xl' : ''}`">
      <HomeLayout>
        <div class="text-red cursor-pointer">一些内容</div>
      </HomeLayout>
    </NScrollbar>
  </n-config-provider>
</template>
<script lang="ts" setup>
import { darkTheme, NScrollbar } from 'naive-ui'
// import { ref } from 'vue'
// const ipcHandle = () => window.electron.ipcRenderer.send('ping')
import HomeLayout from './layout/HomeLayout.vue'
import { useWinInfo } from './store/winInfo'


const winInfoStore = useWinInfo()

console.log("查看：",window.electron)
// changeTheme('light')
changeTheme('dark')
function changeTheme(e: string) {
  document.documentElement.className = e
}
</script>

<style lang="scss" scoped></style>
