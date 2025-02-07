<template>
  <ConnLOLClient>
    <div>
      <LcuImg src=""/>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { useApi } from '../hooks/useApi'

const api = useApi()
test()

async function test() {
  const res = await api.matchHistory.getCurrentSummonerMatchHistory()
  console.log(res)
}
</script>

<style lang="scss" scoped>

</style>
