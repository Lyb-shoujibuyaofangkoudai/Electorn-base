<template>
<!--  window-shadow-slider-->
  <div class="left relative z-10000 window-slider-width py-2 window-bg-slider flex flex-col gap-8 items-center justify-between">
    <ul class="flex flex-col items-center flex-1 gap-4">
      <li class="logo  w-full flex items-center justify-center !cursor-auto hover:!bg-transparent">
        <n-image
          :src="logo"
          object-fit="contain"
          width="45"
        />
      </li>
      <li v-for="item in leftTopTools" :key="item.title">
        <RouterLink :to="item.path" :class="['box-border flex flex-col justify-center items-center gap-0.5 text-c_tc-stress',activePath === item.path ? 'li-active' : '']">
<!--          :name="activePath === item.path ? item.activeIcon : item.icon"-->
          <Icon height="30px" width="30px"  :name="item.icon"/>
<!--          <span :class="`text-3 font-bold ${activePath === item.path ? 'text-c_tc-sd_act' : ''}`">{{ item.title }}</span>-->
        </RouterLink>
      </li>
    </ul>
    <ul class="flex flex-col items-center gap-4">
      <li v-for="item in leftBottomTools" :key="item.title">
        <RouterLink :to="item.path" :class="['flex flex-col justify-center items-center gap-0.5 text-c_tc-stress',activePath === item.path ? 'li-active' : '']">
          <n-avatar
            v-if="item.path === '/my'"
            round
            size="small"
            src=""
          />
          <Icon v-else height="30px" width="30px" :name="item.icon"/>
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
    @apply relative h-13 w-14 flex flex-col justify-center items-center cursor-pointer hover:bg-c_wc-selectBg;
    a {
      @apply w-full h-full;
    }
    .li-active {
      @apply bg-c_wc-selectBg after:(content-empty absolute left-0 top-0 bottom-0 w-1.2 bg-c_wc-selectBgGap);
      //&::after {
      //  content: '';
      //  @apply absolute l-0 t-0 b-0 w-4 bg-red;
      //}
    }
  }
  
  
}
</style>
