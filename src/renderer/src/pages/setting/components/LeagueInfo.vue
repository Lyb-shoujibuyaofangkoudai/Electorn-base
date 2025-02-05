<template>
  <div class="py-2">
    <div
      v-for="item in leagueInfo"
      @click="copy(item.value)"
      class="bg-c_bg-10 px-3 py-2 rounded-1.2 w-1/2 mb-3">
      <n-tooltip
        placement="right-end"
        trigger="hover"
      >
        <template #trigger>
         <div class="w-full flex items-center justify-between gap-6">
           <h2 class="text-c_tc-stress font-bold text-4">{{ item.key }}</h2>
           <p class="cursor-default">{{ item.value }}</p>
         </div>
        </template>
        <span>点击复制</span>
      </n-tooltip>
    </div>
  </div>
</template>

<script
  lang="ts"
  setup>
import { useLeague } from '../../../store/league'
import { useMsg } from '../../../hooks/useMsg'

const keysMap = {
  port: '端口',
  pid: '进程ID',
  authToken: '认证令牌',
  rsoPlatformId: 'RSO平台ID',
  region: '区域',
  riotClientPort: '拳头客户端端口',
  riotClientAuthToken: '拳头客户端认证令牌'
}
const leagueStore = useLeague()
const leagueInfo = computed(() => {
  if ( leagueStore.leagueInfo ) {
    return Object.keys(leagueStore.leagueInfo).map((key) => {
      return {
        key: keysMap[key],
        value: leagueStore.leagueInfo[key]
      }
    })
  }
  return []
})


const { message} = useMsg()
function copy(value: string) {
  const { text, copy, copied, isSupported } = useClipboard({ source: value })
  if(isSupported.value) {
    copy()
    if(copied.value) {
      message.success('复制成功')
    } else {
      message.error('复制失败')
    }
  }
}
</script>

<style
  lang="scss"
  scoped>

</style>
