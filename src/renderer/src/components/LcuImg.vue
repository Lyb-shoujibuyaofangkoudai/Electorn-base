<template>
  <div>
    <img @dragstart.prevent v-if="url" :src="url" class="lcu-image" @error="handleError" />
    <div v-else class="lcu-image-placeholder"></div>
  </div>
</template>

<script setup lang="ts">
import { useLeague } from '../store/league'
import { addLeadingSlash } from '../utils/uri'

const props = defineProps<{
  src?: string
}>()
const leagueStore = useLeague()

const url = ref<string | null>(null)
watchEffect(() => {
  if (leagueStore.leagueInfo?.port && typeof props.src !== 'undefined') {
    url.value = `${import.meta.env.VITE_CUS_SCHEME_LCU_URL}${addLeadingSlash(props.src)}`
  } else {
    url.value = null
  }
})

const handleError = () => {
  url.value = null
}
</script>

<style lang="scss" scoped>

</style>
