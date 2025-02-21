<template>
  <ConnLOLClient>
    <div class="relative w-full min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -inset-[100px] bg-grid opacity-10"></div>
      </div>

      <!-- 主内容卡片 -->
      <n-card class="relative w-full backdrop-blur-xl bg-white/40 dark:bg-gray-800/40 transition-all duration-300 shadow-lg">
        <!-- 顶部玩家信息条 -->
        <div class="relative flex items-center gap-4 p-4 backdrop-blur-md bg-white/20 dark:bg-gray-800/20 rounded-t border-b border-white/10">
          <div class="relative">
            <LcuImg class="rounded-full border-2 border-primary"
                    cus-class="rounded-full w-14 h-14"
                   :src="profileIconUri(requestData.summoner?.profileIconId)" />
            <div class="absolute -bottom-1 right-1/2 translate-x-1/2 bg-primary rounded-full px-2 py-0.5 text-white text-xs">
              {{ requestData.summoner?.summonerLevel }}
            </div>
          </div>
          
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <h2 class="text-xl font-bold">{{ requestData.summoner?.displayName }}</h2>
              <span class="text-gray-500 text-sm">
                #{{ requestData.summoner?.tagLine }}
              </span>
            </div>
            <div class="text-gray-500 text-sm mt-1">
              {{ requestData.summoner?.region }} 服务器
            </div>
            <div class="flex items-center gap-4 mt-2">
              <div class="flex items-center gap-2">
                <img src="" class="w-8 h-8" alt="单双排段位" />
                <span class="text-sm">{{ getRankText(rankedStats.RANKED_SOLO_5x5) }}</span>
              </div>
              <div class="flex items-center gap-2">
                <img src="" class="w-8 h-8" alt="灵活组排段位" />
                <span class="text-sm">{{ getRankText(rankedStats.RANKED_FLEX_SR) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 数据总览区域 -->
        <div class="relative grid grid-cols-6 gap-4 p-4 backdrop-blur-md bg-white/10 dark:bg-gray-800/10 border-b border-white/10">
          <div class="text-center">
            <div class="text-2xl font-bold text-amber-500">{{ getKDA() }}</div>
            <div class="text-sm text-gray-500">KDA</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-blue-500">{{ getWinRate(gameStats.NORMAL) }}%</div>
            <div class="text-sm text-gray-500">匹配模式</div>
            <div class="text-xs text-gray-400">{{ gameStats.NORMAL?.wins || 0 }}场</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-purple-500">{{ getWinRate(gameStats.ARAM) }}%</div>
            <div class="text-sm text-gray-500">极地大乱斗</div>
            <div class="text-xs text-gray-400">{{ gameStats.ARAM?.wins || 0 }}场</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-green-500">{{ getWinRate(rankedStats.RANKED_SOLO_5x5) }}%</div>
            <div class="text-sm text-gray-500">单双排位</div>
            <div class="text-xs text-gray-400">{{ rankedStats.RANKED_SOLO_5x5?.wins || 0 }}场</div>
          </div>
          <div class="text-center">
            <div class="text-2xl font-bold text-orange-500">{{ getWinRate(rankedStats.RANKED_FLEX_SR) }}%</div>
            <div class="text-sm text-gray-500">灵活组排</div>
            <div class="text-xs text-gray-400">{{ rankedStats.RANKED_FLEX_SR?.wins || 0 }}场</div>
          </div>
        </div>

        <!-- 详细数据区域 -->
        <div class="relative p-4">
          <div class="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- 单双排卡片 -->
            <n-card title="单双排"
                    class="relative overflow-hidden backdrop-blur-xl bg-green-50/20 dark:bg-green-900/10
                           transition-all duration-300 hover:-translate-y-1
                           shadow-[0_4px_20px_-1px_rgba(0,128,0,0.1)] hover:shadow-[0_8px_25px_-1px_rgba(0,128,0,0.2)]
                           border border-green-100/30 dark:border-green-500/20">
              <template #header>
                <div class="px-4 py-3 font-bold">单双排</div>
              </template>
              <div class="p-4 flex flex-col gap-2">
                <div class="flex items-center gap-4">
                  <img src="" class="w-16 h-16" alt="段位图标"/>
                  <div>
                    <div class="font-bold">{{ getRankText(rankedStats.RANKED_SOLO_5x5) }}</div>
                    <div class="text-sm text-gray-500">{{ rankedStats.RANKED_SOLO_5x5?.leaguePoints || 0 }} LP</div>
                  </div>
                </div>
                <div class="text-sm">
                  <div class="flex justify-between text-gray-500">
                    <span>胜场: {{ rankedStats.RANKED_SOLO_5x5?.wins || 0 }}</span>
                    <span>负场: {{ rankedStats.RANKED_SOLO_5x5?.losses || 0 }}</span>
                  </div>
                  <n-progress
                    :percentage="getWinRate(rankedStats.RANKED_SOLO_5x5)"
                    type="line"
                    :height="8"
                    processing
                  />
                </div>
              </div>
            </n-card>

            <!-- 灵活组排卡片 -->
            <n-card title="灵活组排"
                    class="relative overflow-hidden backdrop-blur-xl bg-orange-50/20 dark:bg-orange-900/10
                           transition-all duration-300 hover:-translate-y-1
                           shadow-[0_4px_20px_-1px_rgba(255,128,0,0.1)] hover:shadow-[0_8px_25px_-1px_rgba(255,128,0,0.2)]
                           border border-orange-100/30 dark:border-orange-500/20">
              <template #header>
                <div class="px-4 py-3 font-bold">灵活组排</div>
              </template>
              <div class="p-4 flex flex-col gap-2">
                <div class="flex items-center gap-4">
                  <img src="" class="w-16 h-16" alt="段位图标"/>
                  <div>
                    <div class="font-bold">{{ getRankText(rankedStats.RANKED_FLEX_SR) }}</div>
                    <div class="text-sm text-gray-500">{{ rankedStats.RANKED_FLEX_SR?.leaguePoints || 0 }} LP</div>
                  </div>
                </div>
                <div class="text-sm">
                  <div class="flex justify-between text-gray-500">
                    <span>胜场: {{ rankedStats.RANKED_FLEX_SR?.wins || 0 }}</span>
                    <span>负场: {{ rankedStats.RANKED_FLEX_SR?.losses || 0 }}</span>
                  </div>
                  <n-progress
                    :percentage="getWinRate(rankedStats.RANKED_FLEX_SR)"
                    type="line"
                    :height="8"
                    processing
                  />
                </div>
              </div>
            </n-card>

            <!-- 匹配模式卡片 -->
            <n-card title="匹配模式"
                    class="relative overflow-hidden backdrop-blur-xl bg-blue-50/20 dark:bg-blue-900/10
                           transition-all duration-300 hover:-translate-y-1
                           shadow-[0_4px_20px_-1px_rgba(0,128,255,0.1)] hover:shadow-[0_8px_25px_-1px_rgba(0,128,255,0.2)]
                           border border-blue-100/30 dark:border-blue-500/20">
              <template #header>
                <div class="px-4 py-3 font-bold">匹配模式</div>
              </template>
              <div class="p-4 flex flex-col gap-2">
                <div class="flex items-center gap-4">
                  <div class="w-16 h-16 flex items-center justify-center">
                    <img src="" class="w-10 h-10" alt="匹配模式" />
                  </div>
                  <div>
                    <div class="text-sm text-gray-500">总场次</div>
                    <div class="font-bold text-lg">
                      {{ (gameStats.NORMAL?.wins || 0) + (gameStats.NORMAL?.losses || 0) }}
                    </div>
                  </div>
                </div>
                <div class="text-sm">
                  <div class="flex justify-between text-gray-500">
                    <span>胜场: {{ gameStats.NORMAL?.wins || 0 }}</span>
                    <span>负场: {{ gameStats.NORMAL?.losses || 0 }}</span>
                  </div>
                  <n-progress
                    :percentage="getWinRate(gameStats.NORMAL)"
                    type="line"
                    :height="8"
                    processing
                  />
                </div>
              </div>
            </n-card>

            <!-- 近期使用英雄卡片 -->
            <n-card title="近期使用英雄"
                    class="relative overflow-hidden backdrop-blur-xl bg-purple-50/20 dark:bg-purple-900/10
                           transition-all duration-300 hover:-translate-y-1
                           shadow-[0_4px_20px_-1px_rgba(128,0,255,0.1)] hover:shadow-[0_8px_25px_-1px_rgba(128,0,255,0.2)]
                           border border-purple-100/30 dark:border-purple-500/20">
              <template #header>
                <div class="px-4 py-3 font-bold">近期使用英雄</div>
              </template>
              <div class="p-4 flex flex-col gap-2">
                <div v-for="(hero, index) in recentHeroes" :key="index" class="flex items-center gap-2">
                  <img :src="hero.avatar" class="w-8 h-8 rounded-full" :alt="hero.name" />
                  <div class="flex-1">
                    <div class="text-sm">{{ hero.name }}</div>
                    <n-progress
                      :percentage="hero.winRate"
                      type="line"
                      :height="6"
                      processing
                    />
                  </div>
                  <div class="text-xs text-gray-500">{{ hero.games }}场</div>
                </div>
              </div>
            </n-card>
          </div>
        </div>
      </n-card>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { useApi } from '../hooks/useApi'
import { profileIconUri } from '../../../manager/utils/utils'
import { useRequestDataStore } from '../store/requestDataStore'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted } from 'vue'

interface RankInfo {
  tier: string
  division: string
  leaguePoints: number
  wins: number
  losses: number
}

interface GameStats {
  wins: number
  losses: number
}

interface RankedStats {
  queueMap: {
    RANKED_SOLO_5x5?: RankInfo
    RANKED_FLEX_SR?: RankInfo
  }
}

const store = useRequestDataStore()
const { requestData } = storeToRefs(store)
const api = useApi()

const rankedStats = ref<Record<string, RankInfo>>({})
const gameStats = ref<Record<string, GameStats>>({})

// 计算经验进度
const getExpProgress = computed(() => {
  const currentExp = requestData.value?.summoner?.xpSinceLastLevel || 0
  const expToNextLevel = requestData.value?.summoner?.xpUntilNextLevel || 100
  return Math.round((currentExp / expToNextLevel) * 100)
})

const getExpToNextLevel = computed(() => {
  return requestData.value?.summoner?.xpUntilNextLevel || 0
})

// 获取段位文字
function getRankText(rankInfo?: RankInfo): string {
  if (!rankInfo) return '未定级'
  return `${rankInfo.tier} ${rankInfo.division}`
}

// 计算胜率
function getWinRate(stats?: { wins?: number; losses?: number }): number {
  if (!stats || !stats.wins) return 0
  const total = stats.wins + (stats.losses || 0)
  return total > 0 ? Math.round((stats.wins / total) * 100) : 0
}

// 添加KDA计算函数
function getKDA(): string {
  return '9.0' // 这里需要根据实际数据计算
}

// 添加近期英雄数据
const recentHeroes = ref([
  { name: '英雄1', avatar: '', winRate: 65, games: 10 },
  { name: '英雄2', avatar: '', winRate: 55, games: 8 },
  { name: '英雄3', avatar: '', winRate: 45, games: 6 }
])

onMounted(async () => {
  try {
    // 获取排位数据
    const response = await api.lcuApi.ranked.getCurrentRankedStats()
    // 确保从 response.data 中获取数据
    console.log("response",response)
    rankedStats.value = (response.data as RankedStats)?.queueMap

    // 获取其他模式数据
    gameStats.value = {
      TFT: { wins: 0, losses: 0 },
      ARAM: { wins: 0, losses: 0 },
      NORMAL: { wins: 0, losses: 0 }
    }
  } catch (error) {
    console.error('获取数据失败:', error)
  }
})
</script>

<style>
/* 添加网格背景 */
.bg-grid {
  background-image: linear-gradient(to right, rgba(255,255,255,.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 确保内容区域有正确的堆叠上下文 */
.relative {
  isolation: isolate;
}
</style>
