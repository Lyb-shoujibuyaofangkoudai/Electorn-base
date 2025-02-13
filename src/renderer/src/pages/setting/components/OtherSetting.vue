<template>
  <div class="py-2 w-3/4">
    <div :class="['flex items-center justify-between gap-3 px-3 py-2 rounded-1.2 mb-3', isAdmin ? 'bg-#8ed460' : 'bg-#f37370']">
      <h2 class="text-c_tc-stress font-bold text-4">管理员权限</h2>
      <div class="flex items-center gap-2">
        <span>{{ isAdmin ? '✅' : '❌' }}</span>
        <n-button
          v-if="!isAdmin"
          :loading="loading"
          type="primary"
          @click="openModal">
          申请管理员权限
        </n-button>
      </div>
    </div>
    <div class="bg-c_bg-10 flex items-center justify-between gap-3 px-3 py-2 rounded-1.2 mb-3"
        v-for="item in pathInfoArr" :key="item.title">
      <h2 class="text-c_tc-stress font-bold text-4">{{item.title}}</h2>
      <div class="flex items-center gap-2">
        <span class="text-3">{{ item.path }}</span>
        <n-button
          strong
          circle
          type="primary"
          @click="openFolder(item.path)">
          <template #icon>
            <n-icon>
              <FolderOpenRound />
            </n-icon>
          </template>
        </n-button>
      </div>
    </div>
    <div class="bg-[var(--)] w-100 h-20"></div>
  </div>
</template>

<script
  lang="ts"
  setup>
import { FolderOpenRound } from '@vicons/material'
import { useIpc } from '../../../hooks/useIpc'
import { EVENT_TYPE } from '../../../../../manager/plugins/Bridge/eventType'
import { useConfig } from '../../../store/config'
import {useThemeVars} from 'naive-ui'

const ipc = useIpc()
const { message, modal } = useMsg()
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

const pathInfoArr = ref([
  {
    title: "日志保存路径",
    path: ""
  },
  {
    title: "数据库文件保存路径",
    path: ""
  },
])
getLoggerInfo()
async function getLoggerInfo() {
  const res = await ipc.call(EVENT_TYPE.LOGGER_DETAILS)
  if ( res.data?.loggerSavePath ) {
    pathInfoArr.value[0].path = res.data.loggerSavePath
    configStore.addConfig({
      loggerSavePath: res.data.loggerSavePath
    })
  }
}
getDbInfo()
async function getDbInfo() {
  const res = await ipc.call(EVENT_TYPE.DB_DETAILS)
  if ( res.data?.dbPath ) {
    pathInfoArr.value[1].path = res.data.dbPath
    configStore.addConfig({
      dbSavePath: res.data.dbPath
    })
  }
}

function openModal() {
  modal.create({
    show: true,
    preset: 'dialog',
    title: '申请管理员权限',
    content: '申请管理员权限需要重新重启程序，是否申请？',
    negativeText: '取消',
    positiveText: '申请',
    type: 'warning',
    onPositiveClick: () => {
      console.log('申请管理员权限')
      // getAdmin(true)
    }
  })
}

function openFolder(filePath: string) {
  console.log('打开文件夹')
  if(!filePath) {
    message.error(`不存在路径：${filePath}`)
    return
  }
  ipc.send(EVENT_TYPE.OPEN_FOLDER, filePath)
}

const themeVars = useThemeVars()
console.log(222,themeVars.value)

</script>

<style
  lang="scss"
  scoped>

</style>
