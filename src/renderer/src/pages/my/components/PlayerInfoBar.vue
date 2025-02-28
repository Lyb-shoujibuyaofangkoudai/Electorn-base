<template>
  <div
    class="relative flex flex-col gap-4 p-4 backdrop-blur-md bg-[#333869]/20 dark:bg-[#242852]/20 rounded-t border-b border-[#4A5090]/10"
  >
    <div class="flex gap-4">
      <!-- 左侧基本信息 -->
      <div class="flex items-start gap-4">
        <div class="relative">
          <n-progress
            class="!w-30 !h-30 text-0 card-avatar"
            type="circle"
            :color="{ stops: ['#3498DB', '#2ECC71', '#F1C40F', '#E67E22', '#E74C3C'] }"
            :percentage="summoner.levelProgress"
          >
            <div class="relative">
              <LcuImg cus-class="rounded-full w-22 h-22" :src="summoner.iconUrl" />
              <div
                class="absolute bottom-1 right-1/2 translate-x-1/2 px-2 rounded-xl w-max w-full text-center text-2.5 font-bold"
                :style="{
                  backgroundColor: themeColor,
                  color: '#fff',
                }"
              >
                LV: {{ summoner.level }}
              </div>
            </div>
          </n-progress>
        </div>

        <div class="flex flex-col gap-2">
          <div
            class="flex items-center gap-2 cursor-pointer"
            @click="handleCopy(`${summoner.name}#${summoner.tag}`)"
          >
            <h2 class="text-xl font-bold text-[var(--text-color)]">
              {{ summoner.name }}
            </h2>
            <span class="text-[var(--text-color-3)]">#{{ summoner.tag }}</span>
          </div>
          <div class="text-4.5 font-bold">
            大区：<span class="cursor-pointer" @click="handleCopy(summoner.region)">{{
              summoner.region
            }}</span>
          </div>
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
          <div
            class="flex flex-col gap-2 mt-2 bg-[#333869]/10 dark:bg-[#242852]/10 rounded-md"
          >
            <div class="flex items-center gap-2">
              <span class="text-sm text-[var(--text-color-2)] w-26">比赛类型：</span>
              <n-select
                v-model:value="selectedType"
                :options="GAME_TYPES"
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
                :options="GAME_COUNTS"
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
            近
            <n-tooltip trigger="hover" placement="top">
              <template #trigger>
                <span class="text-[#3498DB] font-bold cursor-help">{{
                  actualGameCount
                }}</span>
              </template>
              <template #default>
                {{ getTooltipText() }}
              </template>
            </n-tooltip>
            场
            <span class="text-[#E74C3C] font-bold">{{ TAGS[selectedType] }}</span>
            数据总览
          </h3>
        </div>

        <!-- 第一行数据 -->
        <div class="grid grid-cols-4 gap-4 mb-3">
          <StatItem
            color="#3498DB"
            :value="`${stats.winRate}%`"
            label="场胜率"
            :sub-label="`${stats.wins}胜${stats.losses}负`"
            :tooltip-text="`胜率 = 胜场数 / (胜场数 + 负场数) × 100%\n当前胜率：${
              stats.wins
            }胜${stats.losses}负，共${stats.wins + stats.losses}场`"
          />
          <StatItem
            color="#E74C3C"
            :value="stats.avgKills"
            label="场均击杀"
            tooltip-text="场均击杀 = 总击杀数 / 总场次&#10;反映了玩家在游戏中的击杀能力"
          />
          <StatItem
            color="#95A5A6"
            :value="stats.avgDeaths"
            label="场均死亡"
            tooltip-text="场均死亡 = 总死亡数 / 总场次&#10;反映了玩家在游戏中的生存能力"
          />
          <StatItem
            color="#2ECC71"
            :value="stats.avgAssists"
            label="场均助攻"
            tooltip-text="场均助攻 = 总助攻数 / 总场次&#10;反映了玩家在游戏中的团队贡献"
          />
        </div>

        <!-- 第二行数据 -->
        <div class="grid grid-cols-4 gap-4">
          <StatItem
            color="#3E5C8C"
            :value="stats.totalGameTime"
            label="总游戏时长"
            tooltip-text="所选游戏场次的总游戏时间&#10;包含所有已完成的对局时长"
          />
          <StatItem
            color="#6B573F"
            :value="stats.mainPosition"
            label="常用位置"
            tooltip-text="在所选游戏中出场次数最多的位置&#10;反映了玩家的位置偏好"
          />
          <StatItem
            color="#8C7355"
            :value="stats.kda"
            label="KDA"
            tooltip-text="KDA =
          (击杀 + 助攻) / 死亡&#10;完美KDA（无死亡）显示为“Perfect”&#10;反映了玩家的综合战斗能力"
          />
          <StatItem
            color="#8C3E73"
            :value="stats.avgVision"
            label="场均视野得分"
            tooltip-text="场均视野得分 = 总视野得分 / 总场次&#10;反映了玩家对地图视野的控制能力"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { TAGS_ENUM, TAGS, GAME_TYPES } from "../../../utils/common";
import { ref, computed } from "vue";
import StatItem from "./StatItem.vue";
import { NTooltip } from "naive-ui";
import { NSpin } from "naive-ui";

interface SummonerInfo {
  name: string;
  tag: string;
  level: number;
  iconUrl: string;
  region: string;
  levelProgress: number;
  expToNextLevel: number;
  totalExp: number;
}

interface GameStats {
  winRate: number;
  wins: number;
  losses: number;
  avgKills: string;
  avgDeaths: string;
  avgAssists: string;
  totalGameTime: string;
  mainPosition: string;
  kda: string;
  avgVision: string;
}

interface Props {
  /** 召唤师的基本信息 */
  summoner: SummonerInfo;

  /** 主题颜色 */
  themeColor: string;

  /** 游戏统计数据 */
  stats: GameStats;

  /** 游戏类型文本描述 */
  gameTypeText: string;

  /** 是否禁用游戏类型选择 */
  typeSelectDisabled: boolean;

  /** 初始游戏类型 */
  initialGameType: string | number;

  /** 初始游戏统计范围 */
  initialGameCount: number;

  /** 游戏数据 */
  games?: Array<any>;

  /** 是否加载中 */
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialGameType: "",
  initialGameCount: 20,
});

const emit = defineEmits<{
  (e: "copy", text: string): void;
  (e: "updateGameType", type: TAGS_ENUM): void;
  (e: "updateGameCount", count: number): void;
}>();

const selectedType = ref(props.initialGameType);
const selectedCount = ref(props.initialGameCount);

const handleCopy = (text: string) => {
  emit("copy", text);
};

const handleGameTypeChange = (value: TAGS_ENUM) => {
  emit("updateGameType", value);
};

const handleGameCountChange = (value: number) => {
  emit("updateGameCount", value);
};

// 直接在组件中定义游戏统计范围选项
const GAME_COUNTS = [
  { label: "近20场", value: 20 },
  { label: "近40场", value: 40 },
  { label: "近60场", value: 60 },
  { label: "近80场", value: 80 },
  { label: "近100场", value: 100 },
  { label: "近150场", value: 150 },
  { label: "近200场", value: 200 },
] as const;

// 添加一个计算属性来获取实际游戏场数
const actualGameCount = computed(() => {
  if (!props.games) return 0;
  // 根据当前选中的游戏类型过滤游戏
  const filteredGames = props.games.filter((game) => {
    if (selectedType.value === TAGS_ENUM.all) return true;
    if (selectedType.value === TAGS_ENUM.q_420) return game.queueId === 420;
    if (selectedType.value === TAGS_ENUM.q_440) return game.queueId === 440;
    if (selectedType.value === TAGS_ENUM.q_430) return game.queueId === 430;
    if (selectedType.value === TAGS_ENUM.q_450) return game.queueId === 450;
    return false;
  });
  return Math.min(filteredGames.length, selectedCount.value);
});

// 修改获取提示文本的函数
const getTooltipText = () => {
  if (!props.games) return "";

  const filteredGames = props.games.filter((game) => {
    if (selectedType.value === TAGS_ENUM.all) return true;
    if (selectedType.value === TAGS_ENUM.q_420) return game.queueId === 420;
    if (selectedType.value === TAGS_ENUM.q_440) return game.queueId === 440;
    if (selectedType.value === TAGS_ENUM.q_430) return game.queueId === 430;
    if (selectedType.value === TAGS_ENUM.q_450) return game.queueId === 450;
    return false;
  });

  const totalGames = filteredGames.length;
  const requestedGames = selectedCount.value;

  if (totalGames >= requestedGames) {
    // 当获取到的数据满足或超过所需数量时
    return `显示最近 ${requestedGames} 场比赛数据（共有 ${totalGames} 场记录）`;
  } else {
    // 当获取到的数据少于所需数量时
    return `该模式下仅有 ${totalGames} 场比赛记录，少于所选的 ${requestedGames} 场`;
  }
};
</script>

<style scoped>
.cursor-help {
  cursor: help;
}
.card-avatar {
  -webkit-box-reflect: below 5px
    linear-gradient(transparent, transparent 70%, rgba(255, 255, 255, 0.3));
}
</style>
