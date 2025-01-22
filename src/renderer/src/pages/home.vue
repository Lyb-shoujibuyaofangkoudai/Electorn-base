<template>
  <div class="" @click="test">
    这是首页
  </div>
</template>

<script setup lang="ts">


import { APP_ELECTRON_EVENT } from '../../../preload/utils/Constant'
import { T } from '../../../manager/plugins/Bridge/test'
import { CALL_FN_NAME } from '../utils/bridgeType'






const logger = useLogger()
// const ipc = useIpc()
console.log("查看枚举：",APP_ELECTRON_EVENT.ACTIVATE)
console.log("查看枚举：",CALL_FN_NAME.TEST)
function test() {
  // logger.info('Hello World',CALL_FN_NAME.TEST)
  // const res = ipc.call({
  //   namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
  //   eventName: CALL_FN_NAME.TEST,
  // })
  // console.log("查看返回值：",res)
}
</script>

<style lang="scss" scoped>

</style>
