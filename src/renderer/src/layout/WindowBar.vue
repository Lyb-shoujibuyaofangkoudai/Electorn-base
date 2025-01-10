<template>
  <div class="win-bar relative z-[1000] text-3 text-c_tc-stress w-full h-12 lh-12">
    <div class="flex shrink-0 items-center gap-2 bg-blend-color">
      <div class="flex-1 flex justify-end">
        <div class="region-bar flex-1"></div>
        <ul class="flex items-center justify-between">
          <li v-for="item in tools"
              :key="item.name"
              @click="item.click(item)"
              class="cursor-pointer flex items-center justify-center w-12 hover:bg-c_hover-1">
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
  //@apply h-12 lh-12;
}

.region-bar {
  user-select: none;
  /* 设置该属性表明这是可拖拽区域，用来移动窗口 */
  -webkit-app-region: drag;
}
</style>
