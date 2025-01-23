<template>
  <div class="" @click="test">
    这是首页
  </div>
</template>

<script setup lang="ts">

import { EVENT_TYPE } from '../../../manager/plugins/Bridge/eventType'
import { BRIDGE_EVENT } from '../../../manager/plugins/Bridge/bridgeType'

const ipc = useIpc()
const logger = useLogger()

test()


async function test() {
  const res = await ipc.call(EVENT_TYPE.SET_LOL_DETAILS)
  logger.info(res,EVENT_TYPE.SET_LOL_DETAILS)
  const res2 = await ipc.call(EVENT_TYPE.SET_LOL_DETAILS,123)
  logger.info(res2,EVENT_TYPE.SET_LOL_DETAILS)
}
</script>

<style lang="scss" scoped>

</style>
