<template>
  <ConnLOLClient>
    <div class="relative w-full min-h-screen bg-gradient-from-[#292E5C]-to-[#1E2142] dark:from-[#1A1D3B]-to-[#141630]">
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -inset-[100px] bg-grid op-10"></div>
      </div>
      
      <!-- 主内容卡片 -->
      <n-card class="relative w-full backdrop-blur-xl bg-[#2D325F]/40 dark:bg-[#1F2245]/40">
        <PlayerInfoBar
          :summoner="summonerInfo"
          :theme-color="themeVars?.primaryColor ?? '#18A058'"
          :stats="gameStats"
          :game-type-text="TAGS[selectedGameType]"
          :game-type-options="GAME_TYPES"
          :game-count-options="GAME_COUNTS"
          :type-select-disabled="gameTypeSelectDisabled"
          :initial-game-type="selectedGameType"
          :initial-game-count="selectedGameCount"
          @copy="copy"
          @update-game-type="handleGameTypeChange"
          @update-game-count="handleGameCountChange"
        />
        
        <!-- 详细数据区域 -->
        <GameModeCards 
          :selected-game-count="selectedGameCount"
          :games="recentGames"
          :ranked-stats="rankedStats"
          :mode-game-stats="modeGameStats"
        />
      </n-card>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { profileIconUri } from '../../../../manager/utils/utils'
import { useRequestDataStore } from '../../store/requestDataStore'
import { storeToRefs } from 'pinia'
import { ref, computed, onMounted, watch } from 'vue'
import { useThemeVars } from 'naive-ui'
import { useConfig } from '../../store/config'
import { useLeague } from '../../store/league'
import { copy } from "../../utils/utils"
import { TimerRound } from '@vicons/material'
import { TAGS, TAGS_ENUM } from '../../utils/common'
import PlayerInfoBar from './components/PlayerInfoBar.vue'
import GameModeCards from './components/GameModeCards.vue'

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

// 修改数据统计范围的常量定义
const GAME_COUNTS = [
  { label: '近20场', value: 20 },
  { label: '近40场', value: 40 },
  { label: '近60场', value: 60 },
  { label: '近80场', value: 80 },
  { label: '近100场', value: 100 },
  { label: '近150场', value: 150 },
  { label: '近200场', value: 200 }
] as const

// 修改 selectedGameCount 的类型
const selectedGameCount = ref<number>(20)

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
        const games = matchHistory.games.games.games.map((game: Game) => {
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
    
    // 先尝试获取单双排数据
    await fetchGameData(TAGS_ENUM.q_420)
    
    // 如果 SGP API 不可用，则切换到所有类型
    if (!leagueStore.isSgpApiAvailable) {
      selectedGameType.value = TAGS_ENUM.all
      await fetchGameData(TAGS_ENUM.all)
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

// 整合召唤师信息
const summonerInfo = computed(() => ({
  name: requestData.value?.summoner?.displayName ?? '',
  tag: requestData.value?.summoner?.tagLine ?? '',
  level: requestData.value?.summoner?.summonerLevel ?? 0,
  iconUrl: profileIconUri(requestData.value?.summoner?.profileIconId),
  region: region.value,
  levelProgress: requestData.value?.summoner?.percentCompleteForNextLevel ?? 0,
  expToNextLevel: requestData.value?.summoner?.xpUntilNextLevel ?? 0,
  totalExp: (requestData.value?.summoner?.xpSinceLastLevel +
    ((requestData.value?.summoner?.summonerLevel ?? 0) * 2880)) || 0
}))

// 整合游戏统计数据
const gameStats = computed(() => ({
  winRate: selectedRangeWinRate.value,
  wins: selectedRangeInfo.value.wins,
  losses: selectedRangeInfo.value.losses,
  avgKills: getAverageKills(),
  avgDeaths: getAverageDeaths(),
  avgAssists: getAverageAssists(),
  totalGameTime: getTotalGameTime(),
  mainPosition: getMainPosition(),
  kda: getKDA(),
  avgVision: getAverageVision()
}))

const handleGameTypeChange = (type: TAGS_ENUM) => {
  selectedGameType.value = type
  fetchGameData(type as TAGS_ENUM)
}

const handleGameCountChange = (count: number) => {
  selectedGameCount.value = count
  fetchGameData()
}
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
