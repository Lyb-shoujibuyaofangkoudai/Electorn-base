<template>
  <div class="">
    这是首页
  </div>
</template>

<script setup lang="ts">


import { BRIDGE_EVENT, BridgeDataType, EVENT_TYPE } from '../../../manager/plugins/Bridge/bridgeType'

const ipc = useIpc()


test()
async function test() {
  console.log("监听啦")
  ipc.onEvent(EVENT_TYPE.TEST,(data) => {
    console.log("监听到了：",data)
  })
}
</script>

<style lang="scss" scoped>

</style>
