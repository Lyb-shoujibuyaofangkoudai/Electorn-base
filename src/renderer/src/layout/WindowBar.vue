<template>
  <div class="win-bar relative z-[1000] box-border text-3 text-c_tc-stress w-full window-bar-height flex items-center justify-end">
    <div class="flex items-center bg-blend-color h-full">
      <div class="flex-1 flex justify-end h-full">
        <div class="region-bar flex-1"></div>
        <ul class="flex items-center h-full">
          <li class="rounded-1.3 !p-0.5 !h-fit cursor-pointer mr-4">
            <a href="https://github.com/Lyb-shoujibuyaofangkoudai/Electorn-base" target="_blank">
              <Icon height="26px" width="26px" name="icon-github"/>
            </a>
          </li>
          <li class="hover:!bg-transparent">
            <n-divider class="!bg-c_bg-9" vertical />
          </li>
          <li
            v-for="(item,index) in tools"
            :key="item.name"
            class="px-3 h-full flex items-center justify-center w-8"
            @click="item.click(item)">
            <component class="w-6 h-6" :is="index !== 1 ? item.name : !item?.isMaxWindow ? item.name : item.name2" style="transform: translateY(-25rem); filter: drop-shadow(0 25rem 0 #ffffff);"/>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script
  lang="ts"
  setup>
import Icon from '../components/Icon.vue'
import { useWindowInfo } from '../store/windowInfo'
import { BRIDGE_EVENT } from '../../../manager/plugins/Bridge/bridgeType'
import { EVENT_TYPE } from '../../../manager/plugins/Bridge/eventType'
import {
  IconClose,
  IconFullscreen,
  IconFullscreenExit,
  IconDown
} from '@arco-iconbox/vue-yyy-icon'


const winInfoStore = useWindowInfo()
const ipc = useIpc()

const iconSize = '21px'
const tools = ref([
  {
    name: IconDown,
    color: 'red',
    width: iconSize,
    height: iconSize,
    click: () => {
      ipc.call(EVENT_TYPE.WINDOW_MINIMIZED)
    }
  },
  {
    name: IconFullscreen,
    name2: IconFullscreenExit,
    color: 'red',
    width: iconSize,
    height: iconSize,
    isMaxWindow: false,
    click: (item) => {
      if ( !item.isMaxWindow )
        ipc.call(EVENT_TYPE.WINDOW_MAXIMIZED)
      else
        ipc.call(EVENT_TYPE.WINDOW_RESTORED)
      item.isMaxWindow = !item.isMaxWindow
      winInfoStore.setIsWindowMaximization(item.isMaxWindow)
    }
  },
  {
    name: IconClose,
    color: 'red',
    width: iconSize,
    height: iconSize,
    click: () => {
      // window.electron?.ipcRenderer.invoke(Constant.WINDOW_EVENT.WINDOW_CLOSED)
      ipc.call(EVENT_TYPE.WINDOW_CLOSED)
    }
  }
])
</script>

<style
  lang="scss"
  scoped>
.win-bar {
}

.region-bar {
  user-select: none;
  /* 设置该属性表明这是可拖拽区域，用来移动窗口 */
  -webkit-app-region: drag;
}

li {
  @apply hover:bg-c_hover-1;
}
</style>
