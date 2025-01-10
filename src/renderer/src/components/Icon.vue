<template>
  <div>
    <svg aria-hidden="true" class="icon" :style="{
        color,
        width,
        height
      }">
      <use :xlink:href="`#${name}`"></use>
    </svg>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  name: String,
  color: {
    type: String,
    default: 'inhert'
  },
  width: {
    type: String,
    default: '18px'
  },
  height: {
    type: String,
    default: '18px'
  }
})
</script>

<style lang="scss" scoped>
.icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
