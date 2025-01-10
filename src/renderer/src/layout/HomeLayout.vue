<template>
  <div class="layout-container flex h-screen">
    <ul class="left relative z-10000 w-20 window-bg-slider flex flex-col items-center">
      <li class="logo h-12 lh-12 w-full flex items-center justify-center">logo</li>
      <li>123</li>
    </ul>
    <div class="right flex-1 flex flex-col window-bg-content">
      <WindowBar />
      <div class="flex-1 py-4 px-6">
        <slot />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import WindowBar from './WindowBar.vue'

</script>

<style lang="scss" scoped>
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
