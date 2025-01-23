<template>
  <div class="" @click="test">
    这是首页
  </div>
</template>

<script setup lang="ts">


import { BRIDGE_EVENT, CALL_FN_NAME, EVENT_TYPE } from '../../../manager/plugins/Bridge/bridgeType'

const logger = useLogger()
const ipc = useIpc()


async function test() {
  logger.info('Hello World',CALL_FN_NAME.TEST)
  const res = await ipc.call({
    namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
    eventName: EVENT_TYPE.WINDOW_CLOSED,
  })
  console.log("查看返回值：",res)
}
</script>

<style lang="scss" scoped>

</style>
