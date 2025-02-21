<template>
  <div>
    <n-image
      @dragstart.prevent
      :preview-disabled="previewDisabled"
      :src="url"
      :style="cusStyle"
      :class="cusClass"
      :width="width"
      :height="height"
      @error="handleError" />
  </div>
</template>

<script
  setup
  lang="ts">
import { useLeague } from '../store/league'
import { addLeadingSlash } from '../utils/uri'

const props = withDefaults(
  defineProps<{
    src: string
    cusStyle?: string
    cusClass?: string
    previewDisabled?: boolean
    width?: number
    height?: number
  }>(),
  {
    previewDisabled: true
  }
)
const leagueStore = useLeague()

const url = ref<string | undefined>(void 0)
watchEffect(() => {
  if ( leagueStore.leagueInfo?.port && typeof props.src !== 'undefined' ) {
    url.value = `${ import.meta.env.VITE_CUS_SCHEME_LCU_URL }${ addLeadingSlash(props.src) }`
  } else {
    url.value = void 0
  }
})

const handleError = () => {
  url.value = ""
}
</script>

<style
  lang="scss"
  scoped>

</style>
