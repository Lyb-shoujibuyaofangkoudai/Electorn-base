<template>
  <div class="layout-container flex h-screen">
    <Slider />
    <div class="right flex-1 flex flex-col window-bg-content">
      <WindowBar />
      <n-scrollbar class="flex-1 p-4 w-auto">
        <slot />
      </n-scrollbar>
    </div>
  </div>
</template>

<script
  lang="ts"
  setup>
import WindowBar from './WindowBar.vue'
import Slider from './Slider.vue'



</script>

<style
  lang="scss"
  scoped>
:deep(.n-scrollbar-content) {
  @apply h-full;
}
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
