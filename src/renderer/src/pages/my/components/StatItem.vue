<template>
  <div class="text-center flex flex-col items-center">
    <div class="text-2xl font-bold" :style="{ color }">
      {{ value }}
    </div>
    <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
      {{ label }}
    </div>
    <div v-if="subLabel" class="text-xs text-[var(--text-color-3)] whitespace-nowrap">
      {{ subLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  color: string
  value: string | number
  label: string
  subLabel?: string
}>()
</script> 