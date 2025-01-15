<template>
<!--  window-shadow-slider-->
  <div class="left relative z-10000 window-slider-width p-2 window-bg-slider flex flex-col gap-8 items-center justify-between">
    <ul class="flex flex-col items-center flex-1 gap-4">
      <li class="logo  w-full flex items-center justify-center !cursor-auto hover:!bg-transparent">
        <n-image
          :src="logo"
          object-fit="contain"
          width="45"
        />
      </li>
      <li v-for="item in leftTopTools" :key="item.title">
        <RouterLink :to="item.path" class="flex flex-col justify-center items-center gap-0.5 text-c_tc-stress">
          <Icon height="30px" width="30px" :name="activePath === item.path ? item.activeIcon : item.icon" />
          <span :class="`text-3 font-bold ${activePath === item.path ? 'text-c_tc-sd_act' : ''}`">{{ item.title }}</span>
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
          <span v-if="item.title" :class="`text-3 font-bold ${activePath === item.path ? 'text-c_tc-sd_act' : ''}`">{{ item.title }}</span>
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
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

<style lang="scss" scoped>
ul {
  @apply w-full;
  
  li {
    @apply h-13 w-14 rounded-1 flex flex-col justify-center items-center cursor-pointer hover:bg-c_hover-2;
    a {
      @apply w-full h-full;
    }
  }
}
</style>
