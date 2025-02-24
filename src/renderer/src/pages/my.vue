<template>
  <ConnLOLClient>
    <div class="relative w-full min-h-screen bg-gradient-from-[#292E5C]-to-[#1E2142] dark:from-[#1A1D3B]-to-[#141630]">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -inset-[100px] bg-grid op-10"></div>
      </div>

      <!-- 主内容卡片 -->
      <n-card class="relative w-full backdrop-blur-xl bg-[#2D325F]/40 dark:bg-[#1F2245]/40">
        <!-- 顶部玩家信息条 -->
        <div class="relative flex flex-col gap-4 p-4 backdrop-blur-md bg-[#333869]/20 dark:bg-[#242852]/20 rounded-t border-b border-[#4A5090]/10">
          <!-- 基本信息和数据总览行 -->
          <div class="flex gap-4">
            <!-- 左侧基本信息 -->
            <div class="flex items-start gap-4">
              <div class="relative">
                <n-progress
                  class="!w-30 !h-30 text-0"
                  type="circle"
                  :color="{ stops: [
                          '#3498DB',
                          '#2ECC71',
                          '#F1C40F',
                          '#E67E22',
                          '#E74C3C'
                        ] }"
                  :percentage="requestData.summoner?.percentCompleteForNextLevel ?? 0">
                  <div class="relative">
                    <LcuImg
                      cus-class="rounded-full w-22 h-22"
                      :src="profileIconUri(requestData.summoner?.profileIconId)" />
                    <div class="absolute bottom-1 right-1/2 translate-x-1/2 px-1 rounded-sm w-max w-full text-center  text-2.5 font-bold"
                        :style="{
                          backgroundColor: themeVars?.primaryColor ?? '#18A058',
                          color: '#fff'
                        }">
                      LV: {{ requestData.summoner?.summonerLevel }}
                    </div>
                  </div>
                </n-progress>
                
              </div>
              
              <div class="flex flex-col gap-2">
                <div class="flex items-center gap-2" @click="copy(`${requestData.summoner?.displayName}#${requestData.summoner?.tagLine}`)">
                  <h2 class="text-xl font-bold text-[var(--text-color)]">{{ requestData.summoner?.displayName }}</h2>
                  <span class="text-[var(--text-color-3)]">#{{ requestData.summoner?.tagLine }}</span>
                </div>
                <div class="text-4.5 font-bold">大区：<span @click="copy(region)">{{ region }}</span></div>
                <div class="flex flex-col gap-2">
                  <!-- 第一行：距离下一级经验 -->
                  <div class="text-sm text-[var(--text-color-2)]">
                    距离
                    <span class="font-bold text-[#3498DB]">
                      {{ requestData.summoner?.summonerLevel + 1 }}
                    </span>
                    级还需
                    <span class="font-bold text-[#E74C3C]">
                      {{ requestData.summoner?.xpUntilNextLevel }}
                    </span>
                    经验值
                  </div>
                  <!-- 第二行：当前总经验 -->
                  <div class="text-sm text-[var(--text-color-2)]">
                    当前总经验：
                    <span class="font-bold text-[#3498DB]">
                      {{ requestData.summoner?.xpSinceLastLevel + (requestData.summoner?.summonerLevel * 2880) || 0 }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧数据总览 -->
            <div class="flex-1 ml-8">
              <!-- 第一行数据 -->
              <div class="grid grid-cols-4 gap-4 mb-3">
                <!-- 胜率 -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#3498DB' }">
                    {{ selectedRangeWinRate }}%
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    近{{ selectedGameCount }}场胜率
                  </div>
                  <div class="text-xs text-[var(--text-color-3)] whitespace-nowrap">
                    {{ selectedRangeInfo.wins }}胜{{ selectedRangeInfo.losses }}负
                  </div>
                </div>
                <!-- 场均击杀 -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#E74C3C' }">
                    {{ getAverageKills() }}
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    场均击杀
                  </div>
                </div>
                <!-- 场均死亡 -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#95A5A6' }">
                    {{ getAverageDeaths() }}
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    场均死亡
                  </div>
                </div>
                <!-- 场均助攻 -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#2ECC71' }">
                    {{ getAverageAssists() }}
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    场均助攻
                  </div>
                </div>
              </div>

              <!-- 第二行数据 -->
              <div class="grid grid-cols-4 gap-4">
                <!-- 总游戏时长 -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#3E5C8C' }">
                    {{ getTotalGameTime() }}
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    近{{ selectedGameCount }}场总游戏时长
                  </div>
                </div>
                <!-- 常用位置 -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#6B573F' }">
                    {{ getMainPosition() }}
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    近{{ selectedGameCount }}场常用位置
                  </div>
                </div>
                <!-- KDA -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#8C7355' }">
                    {{ getKDA() }}
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    近{{ selectedGameCount }}场KDA
                  </div>
                </div>
                <!-- 场均视野得分 -->
                <div class="text-center flex flex-col items-center">
                  <div class="text-2xl font-bold" :style="{ color: '#8C3E73' }">
                    {{ getAverageVision() }}
                  </div>
                  <div class="text-[var(--text-color-2)] text-sm whitespace-nowrap mt-1">
                    场均视野得分
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 修改场次选择行 -->
          <div class="flex items-center justify-end gap-4 bg-[#333869]/10 dark:bg-[#242852]/10 p-2 rounded-md">
            <!-- 比赛类型选择 -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-[var(--text-color-2)]">比赛类型</span>
              <n-select
                v-model:value="selectedGameType"
                :options="GAME_TYPES"
                size="small"
                class="w-24"
                :disabled="gameTypeSelectDisabled"
              />
            </div>

            <!-- 数据统计范围 -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-[var(--text-color-2)]">数据统计范围</span>
              <n-radio-group v-model:value="selectedGameCount" size="small">
                <n-space>
                  <n-radio-button
                    v-for="count in gameCounts"
                    :key="count"
                    :value="count"
                  >
                    近{{ count }}场
                  </n-radio-button>
                </n-space>
              </n-radio-group>
            </div>
          </div>
        </div>

        <!-- 详细数据区域 -->
        <div class="py-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <template v-for="(mode, index) in gameModes" :key="index">
              <n-card :title="mode.title"
                      :class="[
                        'relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1',
                        mode.bgClass,
                        mode.borderClass,
                        mode.shadowClass
                      ]">
                <template #header>
                  <div class="px-4 py-3 font-bold">{{ mode.title }}</div>
                </template>
                <div class="p-4 flex flex-col gap-2">
                  <div class="flex items-center gap-4">
                    <div class="w-16 h-16 flex items-center justify-center">
                      <img :src="mode.icon" class="w-10 h-10" :alt="mode.title" />
                    </div>
                    <div>
                      <template v-if="mode.isRanked">
                        <div class="font-bold">{{ getRankText(rankedStats[mode.key]) }}</div>
                        <div class="text-[var(--text-color-2)] text-sm">
                          {{ rankedStats[mode.key]?.leaguePoints || 0 }} LP
                        </div>
                      </template>
                      <template v-else>
                        <div class="text-[var(--text-color-2)] text-sm">总场次</div>
                        <div class="font-bold text-lg">
                          {{ (gameStats[mode.key]?.wins || 0) + (gameStats[mode.key]?.losses || 0) }}
                        </div>
                      </template>
                    </div>
                  </div>
                  <div class="text-sm">
                    <div class="flex justify-between text-[var(--text-color-2)]">
                      <span>胜场: {{ mode.isRanked ? rankedStats[mode.key]?.wins : gameStats[mode.key]?.wins || 0 }}</span>
                      <span>负场: {{ mode.isRanked ? rankedStats[mode.key]?.losses : gameStats[mode.key]?.losses || 0 }}</span>
                    </div>
                    <n-progress
                      :percentage="getWinRate(mode.isRanked ? rankedStats[mode.key] : gameStats[mode.key])"
                      type="line"
                      :height="8"
                      :color="mode.progressColor"
                      processing
                    />
                  </div>
                </div>
              </n-card>
            </template>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useConfig } from '../store/config'
import { useLeague } from '../store/league'
import { copy } from "../utils/utils"
import { TimerRound } from '@vicons/material'
import { TAGS, TAGS_ENUM } from '../utils/common'

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
const configStore = useConfig()
const leagueStore = useLeague()
const themeVars = useThemeVars()
const store = useRequestDataStore()
const { requestData } = storeToRefs(store)
const api = useApi()

const rankedStats = ref<Record<string, RankInfo>>({
  RANKED_SOLO_5x5: {
    tier: '',
    division: '',
    leaguePoints: 0,
    wins: 0,
    losses: 0
  },
  RANKED_FLEX_SR: {
    tier: '',
    division: '',
    leaguePoints: 0,
    wins: 0,
    losses: 0
  }
})
const gameStats = ref<Record<string, GameStats>>({})
const region = computed(() => configStore.configInfo?.servers[`${ leagueStore.leagueInfo?.region }_${ leagueStore.leagueInfo?.rsoPlatformId }`]?.name ?? '')
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
  if (!rankInfo || !rankInfo.tier) return '未定级'
  return `${rankInfo.tier} ${rankInfo.division}`
}

// 计算胜率
function getWinRate(stats?: { wins?: number; losses?: number }): number {
  if (!stats || typeof stats.wins !== 'number') return 0
  const total = (stats.wins || 0) + (stats.losses || 0)
  return total > 0 ? Math.round((stats.wins / total) * 100) : 0
}

// 修改 gameCounts 的定义
const gameCounts = [20, 40, 60, 80, 100, 150, 200]
const selectedGameCount = ref(20) // 默认显示近20场

// 定义游戏记录的接口
interface GameRecord {
  kills: number
  deaths: number
  assists: number
  visionScore: number
  gameLength: number
  win: boolean
  position: string
}

// 修改数据存储
const recentGames = ref<GameRecord[]>([])

// 计算KDA
function getKDA(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  if (games.length === 0) return '0.0'
  
  const totalKills = games.reduce((sum, game) => sum + game.kills, 0)
  const totalDeaths = games.reduce((sum, game) => sum + game.deaths, 0)
  const totalAssists = games.reduce((sum, game) => sum + game.assists, 0)
  
  const kda = totalDeaths === 0 ?
    totalKills + totalAssists :
    ((totalKills + totalAssists) / totalDeaths).toFixed(1)
  return kda.toString()
}

// 计算场均击杀
function getAverageKills(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  if (games.length === 0) return '0.0'
  
  const totalKills = games.reduce((sum, game) => sum + game.kills, 0)
  return (totalKills / games.length).toFixed(1)
}

// 计算场均死亡
function getAverageDeaths(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  if (games.length === 0) return '0.0'
  
  const totalDeaths = games.reduce((sum, game) => sum + game.deaths, 0)
  return (totalDeaths / games.length).toFixed(1)
}

// 计算场均助攻
function getAverageAssists(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  if (games.length === 0) return '0.0'
  
  const totalAssists = games.reduce((sum, game) => sum + game.assists, 0)
  return (totalAssists / games.length).toFixed(1)
}

// 计算游戏时长
function getTotalGameTime(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  const totalMinutes = games.reduce((sum, game) => sum + game.gameLength, 0)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return `${hours}h${minutes}m`
}

// 添加位置映射
const positionMap: Record<string, string> = {
  'TOP': '上路',
  'JUNGLE': '打野',
  'MIDDLE': '中路',
  'BOTTOM': '下路',
  'UTILITY': '辅助',
  'NONE': '未知',
  // 添加其他可能的位置映射
  'MID': '中路',
  'ADC': '下路',
  'SUPPORT': '辅助'
}

// 修改获取常用位置的函数
function getMainPosition(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  if (games.length === 0) return '-'
  
  const positions = games.reduce((acc, game) => {
    acc[game.position] = (acc[game.position] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const mostPlayedPosition = Object.entries(positions)
    .sort(([,a], [,b]) => b - a)[0][0]
    
  // 返回中文位置名称，如果没有对应的映射则返回原始值
  return positionMap[mostPlayedPosition.toUpperCase()] || mostPlayedPosition
}

// 计算胜场数
function getTotalGames(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  const wins = games.filter(game => game.win).length
  return `${wins}/${games.length}`
}

// 将 gameModes 改为 computed 属性
console.log('themeVars.value?.successColor',themeVars.value)
const gameModes = computed(() => [
  {
    key: 'RANKED_SOLO_5x5',
    title: '单双排',
    isRanked: true,
    icon: '',
    // 使用暖金色调
    bgClass: 'bg-[#4C4539]/20 dark:bg-[#3A3426]/20',
    borderClass: 'border border-[#8C7355]/30 dark:border-[#6B573F]/30',
    shadowClass: 'shadow-[0_4px_20px_-1px_rgba(140,115,85,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(140,115,85,0.25)]',
    progressColor: '#8C7355'
  },
  {
    key: 'RANKED_FLEX_SR',
    title: '灵活组排',
    isRanked: true,
    icon: '',
    // 使用青绿色调
    bgClass: 'bg-[#2B4C44]/20 dark:bg-[#1F3931]/20',
    borderClass: 'border border-[#3E8C7A]/30 dark:border-[#2D6B5C]/30',
    shadowClass: 'shadow-[0_4px_20px_-1px_rgba(62,140,122,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(62,140,122,0.25)]',
    progressColor: '#3E8C7A'
  },
  {
    key: 'NORMAL',
    title: '匹配模式',
    isRanked: false,
    icon: '',
    // 使用紫红色调
    bgClass: 'bg-[#4C2B44]/20 dark:bg-[#3A1F31]/20',
    borderClass: 'border border-[#8C3E73]/30 dark:border-[#6B2D57]/30',
    shadowClass: 'shadow-[0_4px_20px_-1px_rgba(140,62,115,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(140,62,115,0.25)]',
    progressColor: '#8C3E73'
  },
  {
    key: 'ARAM',
    title: '极地大乱斗',
    isRanked: false,
    icon: '',
    // 使用蓝紫色调
    bgClass: 'bg-[#2B3A4C]/20 dark:bg-[#1F2A3A]/20',
    borderClass: 'border border-[#3E5C8C]/30 dark:border-[#2D466B]/30',
    shadowClass: 'shadow-[0_4px_20px_-1px_rgba(62,92,140,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(62,92,140,0.25)]',
    progressColor: '#3E5C8C'
  }
])

// 添加一个计算属性来显示选中范围内的胜率
const selectedRangeWinRate = computed(() => {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  if (games.length === 0) return 0
  const wins = games.filter(game => game.win).length
  return Math.round((wins / games.length) * 100)
})

// 添加一个计算属性来显示选中范围内的场次信息
const selectedRangeInfo = computed(() => {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  const wins = games.filter(game => game.win).length
  return {
    total: games.length,
    wins,
    losses: games.length - wins,
    winRate: selectedRangeWinRate.value
  }
})

// 计算场均视野得分
function getAverageVision(): string {
  const games = recentGames.value.slice(0, selectedGameCount.value)
  if (games.length === 0) return '0.0'
  
  const totalVision = games.reduce((sum: number, game: GameRecord) => sum + game.visionScore, 0)
  return (totalVision / games.length).toFixed(1)
}

// 修改比赛类型的常量，添加所有类型选项
const GAME_TYPES = [
  { label: TAGS[TAGS_ENUM.all], value: TAGS_ENUM.all },
  { label: TAGS[TAGS_ENUM.q_420], value: TAGS_ENUM.q_420 },
  { label: TAGS[TAGS_ENUM.q_440], value: TAGS_ENUM.q_440 },
  { label: TAGS[TAGS_ENUM.q_430], value: TAGS_ENUM.q_430 },
  { label: TAGS[TAGS_ENUM.q_450], value: TAGS_ENUM.q_450 }
] as const

// 修改选中的比赛类型的默认值，默认显示单双排
const selectedGameType = ref<TAGS_ENUM>(TAGS_ENUM.q_420)

// 修改 fetchGameData 函数
async function fetchGameData(tag: TAGS_ENUM = selectedGameType.value) {
  console.log("获取数据:",tag)
  try {
    // 先尝试使用 sgpApi
    const sgpResponse = await api.sgpApi.getMatchHistory(
      leagueStore.leagueInfo?.rsoPlatformId || '',
      requestData.value?.summoner?.puuid || '',
      0,
      selectedGameCount.value,
      tag === TAGS_ENUM.all ? undefined : tag
    )
    
    console.log("查看SGP接口获取的数据:", sgpResponse)
    if (sgpResponse?.games) {
      leagueStore.setSgpApiAvailable(true) // 标记 SGP API 可用
      // 处理 SGP API 返回的数据
      const games = sgpResponse.games.map((game: SgpGameSummaryLol) => {
        // 找到当前玩家的数据
        const participant = game.json.participants.find((p: SgpParticipantLol) =>
          p.puuid === requestData.value?.summoner?.puuid
        )
        
        return {
          kills: participant?.kills || 0,
          deaths: participant?.deaths || 0,
          assists: participant?.assists || 0,
          visionScore: participant?.visionScore || 0,
          gameLength: Math.floor(game.json.gameDuration / 60),
          win: participant?.win || false,
          position: participant?.teamPosition || participant?.lane || 'NONE'
        } as GameRecord
      })
      console.log("处理的结果:", games)
      recentGames.value = games
    }
  } catch (error) {
    console.warn('SGP API 获取失败，尝试使用 LCU API', error)
    leagueStore.setSgpApiAvailable(false) // 标记 SGP API 不可用
    
    // 如果 SGP API 不可用，强制设置为所有类型
    if (selectedGameType.value !== TAGS_ENUM.all) {
      selectedGameType.value = TAGS_ENUM.all
    }
    
    try {
      // 回退到使用 lcuApi
      const matchHistory = await api.lcuApi.matchHistory.getMatchHistory(
        requestData.value?.summoner?.puuid || '',
        0,
        selectedGameCount.value
      )
      console.log("查看LCU接口获取的数据:", matchHistory)
      
      if (matchHistory?.games?.games) {
        const games = matchHistory.games.games.map((game: Game) => {
          const participant = game.participants[0] // 当前玩家总是第一个参与者
          return {
            kills: participant.stats.kills || 0,
            deaths: participant.stats.deaths || 0,
            assists: participant.stats.assists || 0,
            visionScore: participant.stats.visionScore || 0,
            gameLength: Math.floor(game.gameDuration / 60),
            win: participant.stats.win || false,
            position: participant.timeline.lane || 'NONE'
          } as GameRecord
        })
        recentGames.value = games
      }
    } catch (lcuError) {
      console.error('获取比赛数据失败', lcuError)
    }
  }
}

// 修改初始化逻辑
onMounted(async () => {
  try {
    // 获取排位数据
    const response = await api.lcuApi.ranked.getCurrentRankedStats()
    if (response.data?.queueMap) {
      rankedStats.value = {
        ...rankedStats.value,
        ...response.data.queueMap
      }
    }

    // 先尝试获取单双排数据
    await fetchGameData(TAGS_ENUM.q_420)
    
    // 如果 SGP API 不可用，则切换到所有类型
    if (!leagueStore.isSgpApiAvailable) {
      selectedGameType.value = TAGS_ENUM.all
      await fetchGameData(TAGS_ENUM.all)
    }

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

// 修改比赛类型选择器的禁用状态
const gameTypeSelectDisabled = computed(() => !leagueStore.isSgpApiAvailable)

// 修改监听器的类型
watch(selectedGameType, async (newType: TAGS_ENUM) => {
  console.log("selectedGameType",newType)
  await fetchGameData(newType)
})

watch(selectedGameCount, async (newCount: number) => {
  await fetchGameData()
})
</script>

<style>
:root {
  --border-color: rgba(255, 255, 255, 0.1);
}

.dark {
  --border-color: rgba(255, 255, 255, 0.2);
}

.bg-grid {
  background-image: linear-gradient(to right, rgba(255,255,255,.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(255,255,255,.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

:deep(.n-radio-button) {
  @apply transition-colors duration-200;
}

:deep(.n-radio-button.n-radio-button--checked) {
  @apply bg-[#3498DB] border-[#3498DB] text-white;
}

:deep(.n-radio-button:not(.n-radio-button--checked):hover) {
  @apply border-[#3498DB]/50;
}

:deep(.n-radio-button.n-radio-button--checked .n-radio-button__state-border) {
  @apply text-white;
}
</style>
