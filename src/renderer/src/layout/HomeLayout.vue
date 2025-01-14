<template>
  <div class="layout-container flex h-screen">
    <div class="left relative z-10000  window-shadow-slider window-slider-width p-2 window-bg-slider flex flex-col gap-8 items-center justify-between">
      <ul class="flex flex-col items-center gap-4 flex-1">
        <li class="logo rounded-[50%] shadow-2xl shadow-red w-full flex items-center justify-center">
          <n-image
            :src="logo"
            object-fit="contain"
            width="45"
          />
        </li>
        <li v-for="item in leftTopTools" :key="item.title">
          <RouterLink :to="item.path" class="flex flex-col justify-center items-center gap-0.5 text-c_tc-stress">
            <Icon height="30px" width="30px" :name="activePath === item.path ? item.activeIcon : item.icon" />
            <span class="text-3 font-bold">{{ item.title }}</span>
          </RouterLink>
        </li>
      </ul>
      <ul class="flex flex-col items-center gap-4">
        <li v-for="item in leftBottomTools" :key="item.title">
          <RouterLink :to="item.path" class="flex flex-col justify-center items-center gap-0.5 text-c_tc-stress">
            <n-avatar
              v-if="item.path === '/my'"
              round
              size="small"
              src=""
            />
            <Icon v-else height="30px" width="30px" :name="activePath === item.path ? item.activeIcon : item.icon"/>
            <span v-if="item.title" class="text-3 font-bold">{{ item.title }}</span>
          </RouterLink>
        </li>
      </ul>
    </div>
    <div class="right flex-1 flex flex-col window-bg-content">
      <WindowBar />
      <div class="flex-1 px-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script
  lang="ts"
  setup>
import WindowBar from './WindowBar.vue'
import logo from '@renderer/assets/image/logo.png'


const route = useRoute()

const leftTopTools = [
  {
    icon: 'icon-zhandou',
    activeIcon: "icon-zhandou-copy",
    title: '对战',
    path: '/',
    
  },
  {
    icon: 'icon-chaxun',
    title: '查询',
    activeIcon: "icon-chaxun-copy",
    path: '/search',
   
  }
]
const leftBottomTools = [
  {
    icon: 'home',
    activeIcon: "",
    title: '',
    path: '/my'
  },
  {
    icon: 'icon-shezhi',
    activeIcon: "icon-shezhi-copy",
    title: '',
    path: '/setting'
  }
]
const activePath = computed(() => route.path)

</script>

<style
  lang="scss"
  scoped>
.layout-container {
  // 布局默认字体颜色
  @apply text-c_tc-stress;
}

.logo {
  user-select: none;
  /* 设置该属性表明这是可拖拽区域，用来移动窗口 */
  -webkit-app-region: drag;
}

.layout-content {
  background: linear-gradient(to bottom, #3a457a, #343c6d 50%, #242855);
}
</style>
