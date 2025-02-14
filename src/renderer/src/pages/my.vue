<template>
  <ConnLOLClient>
    <div>
      <LcuImg :src="profileIconUri(t?.profileIconId)"/>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { useApi } from '../hooks/useApi'
import { profileIconUri } from '../../../manager/utils/utils'

const api = useApi()
test()
const t = ref<any>({})
async function test() {
  t.value = await api.summoner.getCurrentSummoner()
  
  // const res2 = await api.gameData
}
</script>

<style lang="scss" scoped>

</style>
