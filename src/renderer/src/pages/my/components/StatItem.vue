<template>
  <n-statistic class="transition-opacity duration-200">
    <template #prefix>
      <div class="w-1 h-1 rounded-full mr-1" :style="{ backgroundColor: color }" />
    </template>

    <template #label>
      <span class="text-[var(--text-color-2)]">{{ label }}</span>
    </template>

    <template #default>
      <n-tooltip trigger="hover" placement="top">
        <template #trigger>
          <span
            class="cursor-help hover:opacity-80 font-bold"
            :style="{ color: color + 'CC' }"
            >{{ value }}</span
          >
        </template>
        <div class="p-1">
          <div class="text-sm">{{ tooltipText }}</div>
        </div>
      </n-tooltip>
    </template>

    <template #suffix v-if="subLabel">
      <span class="text-xs text-[var(--text-color-3)]">{{ subLabel }}</span>
    </template>
  </n-statistic>
</template>

<script setup lang="ts">
import { NStatistic, NTooltip } from "naive-ui";

interface Props {
  /** 标签文本 */
  label: string;
  /** 显示的值 */
  value: string | number;
  /** 颜色 */
  color: string;
  /** 副标签文本 */
  subLabel?: string;
  /** tooltip 提示文本 */
  tooltipText?: string;
}

withDefaults(defineProps<Props>(), {
  tooltipText: "", // 默认为空字符串
});
</script>

<style scoped>
.cursor-help {
  cursor: help;
}
</style>
