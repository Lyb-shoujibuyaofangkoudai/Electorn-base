<template>
  <ConnLOLClient>
    <div>
      <LcuImg :src="profileIconUri(t.profileIconId)"/>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { useApi } from '../hooks/useApi'
import { profileIconUri } from '../../../manager/utils/utils'

const api = useApi()
test()
const t = ref({})
async function test() {
  const data = await api.summoner.getCurrentSummoner()
  t.value = data
  
  // const res2 = await api.gameData
}
</script>

<style lang="scss" scoped>

</style>
