<template>
  <ConnLOLClient>
    <div>显示的内容</div>
  </ConnLOLClient>
</template>

<script
  lang="ts"
  setup>
import { useLeague } from '../store/league'

const leagueStore = useLeague()
</script>

<style
  lang="scss"
  scoped>

</style>
