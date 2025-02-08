<template>
  <div>
    <n-card title="设置" size="large">
      <n-tabs type="card" animated>
        <n-tab-pane name="通用" tab="通用">
          Wonderwall
        </n-tab-pane>
        <n-tab-pane name="自动化" tab="自动化">
          Hey Jude
        </n-tab-pane>
        <n-tab-pane name="客户端参数" tab="客户端参数">
          <LeagueInfo />
        </n-tab-pane>
        <n-tab-pane name="其他" tab="其他">
          <OtherSetting />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">

import LeagueInfo from './components/LeagueInfo.vue'
import OtherSetting from './components/OtherSetting.vue'
</script>

<style lang="scss" scoped>

</style>
