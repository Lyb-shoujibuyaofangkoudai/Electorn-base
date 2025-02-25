<template>
  <div class="relative flex flex-col gap-4 p-4 backdrop-blur-md bg-[#333869]/20 dark:bg-[#242852]/20 rounded-t border-b border-[#4A5090]/10">
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
            :percentage="summoner.levelProgress">
            <div class="relative">
              <LcuImg
                cus-class="rounded-full w-22 h-22"
                :src="summoner.iconUrl" />
              <div class="absolute bottom-1 right-1/2 translate-x-1/2 px-1 rounded-sm w-max w-full text-center text-2.5 font-bold"
                   :style="{
                    backgroundColor: themeColor,
                    color: '#fff'
                   }">
                LV: {{ summoner.level }}
              </div>
            </div>
          </n-progress>
        </div>
        
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2" @click="handleCopy(`${summoner.name}#${summoner.tag}`)">
            <h2 class="text-xl font-bold text-[var(--text-color)]">{{ summoner.name }}</h2>
            <span class="text-[var(--text-color-3)]">#{{ summoner.tag }}</span>
          </div>
          <div class="text-4.5 font-bold">大区：<span @click="handleCopy(summoner.region)">{{ summoner.region }}</span></div>
          <div class="flex flex-col gap-2">
            <div class="text-sm text-[var(--text-color-2)]">
              距离
              <span class="font-bold text-[#3498DB]">{{ summoner.level + 1 }}</span>
              级还需
              <span class="font-bold text-[#E74C3C]">{{ summoner.expToNextLevel }}</span>
              经验值
            </div>
            <div class="text-sm text-[var(--text-color-2)]">
              当前总经验：
              <span class="font-bold text-[#3498DB]">{{ summoner.totalExp }}</span>
            </div>
          </div>

          <!-- 游戏类型和统计范围选择 -->
          <div class="flex flex-col gap-2 mt-2 bg-[#333869]/10 dark:bg-[#242852]/10 rounded-md">
            <div class="flex items-center gap-2">
              <span class="text-sm text-[var(--text-color-2)] w-26">比赛类型：</span>
              <n-select
                v-model:value="selectedType"
                :options="gameTypeOptions"
                size="small"
                class="w-32"
                :disabled="typeSelectDisabled"
                @update:value="handleGameTypeChange"
              />
            </div>
            
            <div class="flex items-center gap-2">
              <span class="text-sm text-[var(--text-color-2)] w-26">数据统计范围：</span>
              <n-select
                v-model:value="selectedCount"
                :options="gameCountOptions"
                size="small"
                class="w-32"
                @update:value="handleGameCountChange"
              />
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧数据总览 -->
      <div class="flex-1 ml-8">
        <div class="mb-4 pb-2 border-b border-[#4A5090]/10 text-center">
          <h3 class="text-2xl font-bold text-[var(--text-color-2)]">
            近 <span class="text-[#3498DB] font-bold">{{ selectedCount }}</span> 场
            <span class="text-[#E74C3C] font-bold">{{ gameTypeText }}</span>
            数据总览
          </h3>
        </div>

        <!-- 第一行数据 -->
        <div class="grid grid-cols-4 gap-4 mb-3">
          <StatItem color="#3498DB" :value="`${stats.winRate}%`" label="场胜率" :sub-label="`${stats.wins}胜${stats.losses}负`"/>
          <StatItem color="#E74C3C" :value="stats.avgKills" label="场均击杀"/>
          <StatItem color="#95A5A6" :value="stats.avgDeaths" label="场均死亡"/>
          <StatItem color="#2ECC71" :value="stats.avgAssists" label="场均助攻"/>
        </div>
        
        <!-- 第二行数据 -->
        <div class="grid grid-cols-4 gap-4">
          <StatItem color="#3E5C8C" :value="stats.totalGameTime" label="总游戏时长"/>
          <StatItem color="#6B573F" :value="stats.mainPosition" label="常用位置"/>
          <StatItem color="#8C7355" :value="stats.kda" label="KDA"/>
          <StatItem color="#8C3E73" :value="stats.avgVision" label="场均视野得分"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import StatItem from './StatItem.vue'

interface SummonerInfo {
  name: string
  tag: string
  level: number
  iconUrl: string
  region: string
  levelProgress: number
  expToNextLevel: number
  totalExp: number
}

interface GameStats {
  winRate: number
  wins: number
  losses: number
  avgKills: string
  avgDeaths: string
  avgAssists: string
  totalGameTime: string
  mainPosition: string
  kda: string
  avgVision: string
}

interface Props {
  /** 召唤师的基本信息 */
  summoner: SummonerInfo
  
  /** 主题颜色 */
  themeColor: string
  
  /** 游戏统计数据 */
  stats: GameStats
  
  /** 游戏类型文本描述 */
  gameTypeText: string
  
  /** 游戏类型选项列表 */
  gameTypeOptions: Array<{ label: string; value: string | number }>
  
  /** 游戏统计范围选项列表 */
  gameCountOptions: Array<{ label: string; value: number }>
  
  /** 是否禁用游戏类型选择 */
  typeSelectDisabled: boolean
  
  /** 初始游戏类型 */
  initialGameType: string | number
  
  /** 初始游戏统计范围 */
  initialGameCount: number
}


const props = withDefaults(defineProps<Props>(), {
  initialGameType: '',
  initialGameCount: 20
})

const emit = defineEmits<{
  (e: 'copy', text: string): void
  (e: 'updateGameType', type: string | number): void
  (e: 'updateGameCount', count: number): void
}>()

const selectedType = ref(props.initialGameType)
const selectedCount = ref(props.initialGameCount)

const handleCopy = (text: string) => {
  emit('copy', text)
}

const handleGameTypeChange = (value: string | number) => {
  emit('updateGameType', value)
}

const handleGameCountChange = (value: number) => {
  emit('updateGameCount', value)
}
</script>
