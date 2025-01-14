<template>
  <div class="win-bar relative z-[1000] box-border text-3 text-c_tc-stress w-full window-bar-height flex items-center justify-end">
    <div class="flex items-center bg-blend-color h-full">
      <div class="flex-1 flex justify-end h-full">
        <div class="region-bar flex-1"></div>
        <ul class="flex items-center h-full">
          <li v-for="item in tools"
              :key="item.name"
              @click="item.click(item)"
              class="cursor-pointer px-1 h-full flex items-center justify-center w-8 hover:bg-c_hover-1">
            <Icon :height="item.height" :name="item.name" :width="item.width" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import Icon from '../components/Icon.vue'
import { Constant } from '../../../preload/utils/Constant'
import { useWindowInfo } from '../store/windowInfo'

const winInfoStore = useWindowInfo()
const iconSize = '21px'
const tools = [
  {
    name: 'icon-minus',
    color: 'red',
    width: iconSize,
    height: iconSize,
    click: () => {
      window.electron?.ipcRenderer.invoke(Constant.WINDOW_EVENT.WINDOW_MINIMIZED)
    }
  },
  {
    name: 'icon-expand-alt',
    color: 'red',
    width: iconSize,
    height: iconSize,
    isMaxWindow: false,
    click: (item) => {
      console.log("查看：",item.isMaxWindow)
      if(!item.isMaxWindow)
        window.electron?.ipcRenderer.invoke(Constant.WINDOW_EVENT.WINDOW_MAXIMIZED)
      else
        window.electron?.ipcRenderer.invoke(Constant.WINDOW_EVENT.WINDOW_RESTORED)
      item.isMaxWindow = !item.isMaxWindow
      winInfoStore.setIsWindowMaximization(item.isMaxWindow)
    }
  },
  {
    name: 'icon-times',
    color: 'red',
    width: iconSize,
    height: iconSize,
    click: () => {
        window.electron?.ipcRenderer.invoke(Constant.WINDOW_EVENT.WINDOW_CLOSED)
    }
  }
]
</script>

<style lang="scss" scoped>
.win-bar {
}

.region-bar {
  user-select: none;
  /* 设置该属性表明这是可拖拽区域，用来移动窗口 */
  -webkit-app-region: drag;
}
</style>
