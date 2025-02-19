<template>
  <ConnLOLClient>
    <div>
      <LcuImg :src="profileIconUri(requestData['summoner']?.profileIconId)"/>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { useApi } from '../hooks/useApi'
import { profileIconUri } from '../../../manager/utils/utils'
import { useRequestDataStore } from '../store/requestDataStore'

const {
  requestData
} = useRequestDataStore()
const api = useApi()
const t = ref<any>(null)
test()
async function test() {
  t.value = await api.lcuApi.summoner.getCurrentSummoner()
  console.log(222,t.value)
}
</script>

<style lang="scss" scoped>

</style>
