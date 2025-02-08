<template>
  <div class="py-2">
    <div class="bg-c_bg-10 flex items-center justify-between gap-3 px-3 py-2 w-1/2 rounded-1.2 mb-3">
      <h2 class="text-c_tc-stress font-bold text-4">管理员权限</h2>
      <div class="flex items-center gap-2">
        <span>{{ isAdmin ? '✅' : '❌' }}</span>
        <n-button
          v-if="!isAdmin"
          :loading="loading"
          type="primary"
          @cliccck="getAdmin(true)">
          申请管理员权限
        </n-button>
      </div>
    </div>
    <div class="bg-c_bg-10 flex items-center justify-between gap-3 px-3 py-2 w-1/2 rounded-1.2 mb-3">
      <h2 class="text-c_tc-stress font-bold text-4">日志保存路径</h2>
      <div class="flex items-center gap-2">
        <span class="text-3">{{ loggerPath }}</span>
        <n-button
          type="primary"
          @cliccck="getAdmin(true)">
          打开所在文件夹
        </n-button>
      </div>
    </div>
  </div>
</template>

<script
  lang="ts"
  setup>
import { useIpc } from '../../../hooks/useIpc'
import { EVENT_TYPE } from '../../../../../manager/plugins/Bridge/eventType'
import { useConfig } from '../../../store/config'

const ipc = useIpc()
const { message } = useMsg()
const isAdmin = ref(false)
const loading = ref(false)
const configStore = useConfig()
getAdmin()

async function getAdmin(applyAdmin = false) {
  if ( applyAdmin ) {
    loading.value = true
  }
  const res = await ipc.call(EVENT_TYPE.ADMIN_DETAILS, {
    applyAdmin
  })
  if ( res.data ) {
    isAdmin.value = true
    configStore.addConfig({
      isAdmin: res.data
    })
  } else {
    applyAdmin && message.error('申请管理员权限失败')
    loading.value = false
  }
}

const loggerPath = ref('')
getLoggerInfo()

async function getLoggerInfo() {
  const res = await ipc.call(EVENT_TYPE.LOGGER_DETAILS)
  console.log('获取日志信息：', res)
  if ( res.data?.loggerSavePath ) {
    loggerPath.value = res.data.loggerSavePath
    configStore.addConfig({
      loggerSavePath: res.data.loggerSavePath
    })
  }
}

test()
async function test() {
  const res = await ipc.call(EVENT_TYPE.DEBUG_DETAILS)
  console.log('test：', res)
}
</script>

<style
  lang="scss"
  scoped>

</style>
