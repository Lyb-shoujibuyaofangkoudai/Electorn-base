<template>
  <div class="py-4">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <template v-for="(mode, index) in gameModes" :key="index">
        <n-card
          :class="[
            'relative overflow-hidden backdrop-blur-xl transition-all duration-300 hover:-translate-y-1',
            mode.bgClass,
            mode.borderClass,
            mode.shadowClass,
          ]"
        >
          <template #header>
            <div class="px-4 h-16 font-bold flex items-center justify-between">
              {{ mode.title }}
              <div v-if="mode.isRanked" class="flex flex-col items-center">
                <img
                  :src="mode.rankIcon"
                  class="w-8 h-8"
                  :alt="mode.rankInfo?.tier || 'Unranked'"
                />
                <div class="text-xs text-[var(--text-color-2)] mt-1">
                  {{ getRankText(mode.rankInfo) }}
                  {{ mode.rankInfo?.leaguePoints || 0 }} LP
                </div>
              </div>
            </div>
          </template>

          <div class="px-4 flex flex-col gap-4">
            <!-- 说明文字 -->
            <div class="text-sm text-[var(--text-color-2)]">
              近
              <span class="text-[#3498DB] font-bold">{{ selectedGameCount }}</span> 场{{
                mode.title
              }}
            </div>

            <!-- 排位赛特有信息 -->
            <template v-if="mode.isRanked">
              <div class="flex flex-col gap-4">
                <!-- 常用英雄 -->
                <div class="flex flex-col gap-2">
                  <div class="text-sm text-[var(--text-color-2)]">常用英雄</div>
                  <div class="grid grid-cols-4 gap-2">
                    <n-popover
                      v-for="hero in mode.frequentHeroes"
                      :key="hero.id"
                      trigger="hover"
                      placement="top"
                    >
                      <template #trigger>
                        <div class="w-8 h-8 rounded-full overflow-hidden">
                          <img
                            :src="getChampionIcon(hero.id)"
                            :alt="hero.name"
                            class="w-full h-full object-cover"
                          />
                        </div>
                      </template>
                      <div class="p-2">
                        <div class="font-bold mb-1">{{ hero.name }}</div>
                        <div class="text-sm">
                          <div>使用次数: {{ hero.playCount }}</div>
                          <div>胜率: {{ Math.round(hero.winRate * 100) }}%</div>
                        </div>
                      </div>
                    </n-popover>
                  </div>
                </div>
              </div>
            </template>

            <!-- 非排位赛信息 -->
            <template v-else>
              <div class="flex items-center gap-4">
                <div class="flex flex-col gap-2">
                  <div class="text-sm text-[var(--text-color-2)]">常用英雄</div>
                  <div class="grid grid-cols-4 gap-2">
                    <n-popover
                      v-for="hero in mode.frequentHeroes"
                      :key="hero.id"
                      trigger="hover"
                      placement="top"
                    >
                      <template #trigger>
                        <div class="w-8 h-8 rounded-full overflow-hidden">
                          <img
                            :src="getChampionIcon(hero?.id)"
                            :alt="hero?.name || ''"
                            class="w-full h-full object-cover"
                          />
                        </div>
                      </template>
                      <div class="p-2">
                        <div class="font-bold mb-1">{{ hero.name }}</div>
                        <div class="text-sm">
                          <div>使用次数: {{ hero.playCount }}</div>
                          <div>胜率: {{ Math.round(hero.winRate * 100) }}%</div>
                        </div>
                      </div>
                    </n-popover>
                  </div>
                </div>
              </div>
            </template>

            <!-- 胜负场信息 -->
            <div class="text-sm">
              <div class="flex items-center gap-4">
                <!-- 为每个卡片创建独立的图表容器 -->
                <div :ref="(el) => initChartRef(el, mode)" class="w-16 h-16"></div>
                <!-- 胜负场文字信息 -->
                <div class="flex flex-col gap-1">
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-[#3498DB]"></div>
                    <span class="text-[var(--text-color-2)]">
                      胜场:
                      {{
                        mode.isRanked ? mode.rankInfo?.wins || 0 : mode.stats?.wins || 0
                      }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full bg-[#E74C3C]"></div>
                    <span class="text-[var(--text-color-2)]">
                      负场:
                      {{
                        mode.isRanked
                          ? mode.rankInfo?.losses || 0
                          : mode.stats?.losses || 0
                      }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-card>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from "vue";
import { TIERS_ICON, MODES } from "../../../utils/common";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";

// 注册必需的组件
echarts.use([
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  LabelLayout,
  CanvasRenderer,
]);

interface RankInfo {
  tier: string;
  division: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

interface GameStats {
  wins: number;
  losses: number;
}

interface Hero {
  id: number;
  name: string;
  playCount: number;
  wins: number;
  winRate: number;
}

interface GameMode {
  key: string;
  title: string;
  isRanked: boolean;
  rankInfo?: RankInfo;
  rankIcon?: string;
  stats?: GameStats;
  frequentHeroes: Hero[];
  bgClass: string;
  borderClass: string;
  shadowClass: string;
  progressColor: string;
}

const rankedStats = ref<Record<string, RankInfo>>({
  RANKED_SOLO_5x5: {
    tier: "",
    division: "",
    leaguePoints: 0,
    wins: 0,
    losses: 0,
  },
  RANKED_FLEX_SR: {
    tier: "",
    division: "",
    leaguePoints: 0,
    wins: 0,
    losses: 0,
  },
});
const modeGameStats = ref<Record<string, GameStats>>({});
// 修改 gameModes 的定义，添加返回值类型
const gameModes = computed<GameMode[]>(() => [
  {
    key: "RANKED_SOLO_5x5",
    title: MODES.RANKED_SOLO_5x5,
    isRanked: true,
    rankInfo: rankedStats.value.RANKED_SOLO_5x5,
    rankIcon: rankedStats.value.RANKED_SOLO_5x5?.tier
      ? TIERS_ICON[rankedStats.value.RANKED_SOLO_5x5.tier as keyof typeof TIERS_ICON]
      : TIERS_ICON.UNRANKED,
    frequentHeroes: [],
    bgClass: "bg-[#4C4539]/20 dark:bg-[#3A3426]/20",
    borderClass: "border border-[#8C7355]/30 dark:border-[#6B573F]/30",
    shadowClass:
      "shadow-[0_4px_20px_-1px_rgba(140,115,85,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(140,115,85,0.25)]",
    progressColor: "#8C7355",
  },
  {
    key: "RANKED_FLEX_SR",
    title: MODES.RANKED_FLEX_SR,
    isRanked: true,
    rankInfo: rankedStats.value.RANKED_FLEX_SR,
    rankIcon: rankedStats.value.RANKED_FLEX_SR?.tier
      ? TIERS_ICON[rankedStats.value.RANKED_FLEX_SR.tier as keyof typeof TIERS_ICON]
      : TIERS_ICON.UNRANKED,
    frequentHeroes: [],
    bgClass: "bg-[#2B4C44]/20 dark:bg-[#1F3931]/20",
    borderClass: "border border-[#3E8C7A]/30 dark:border-[#2D6B5C]/30",
    shadowClass:
      "shadow-[0_4px_20px_-1px_rgba(62,140,122,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(62,140,122,0.25)]",
    progressColor: "#3E8C7A",
  },
  {
    key: "NORMAL",
    title: MODES.NORMAL,
    isRanked: false,
    stats: modeGameStats.value.NORMAL,
    frequentHeroes: [],
    bgClass: "bg-[#4C2B44]/20 dark:bg-[#3A1F31]/20",
    borderClass: "border border-[#8C3E73]/30 dark:border-[#6B2D57]/30",
    shadowClass:
      "shadow-[0_4px_20px_-1px_rgba(140,62,115,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(140,62,115,0.25)]",
    progressColor: "#8C3E73",
  },
  {
    key: "ARAM",
    title: MODES.ARAM_UNRANKED_5x5,
    isRanked: false,
    stats: modeGameStats.value.ARAM,
    frequentHeroes: [],
    bgClass: "bg-[#2B3A4C]/20 dark:bg-[#1F2A3A]/20",
    borderClass: "border border-[#3E5C8C]/30 dark:border-[#2D466B]/30",
    shadowClass:
      "shadow-[0_4px_20px_-1px_rgba(62,92,140,0.15)] hover:shadow-[0_8px_25px_-1px_rgba(62,92,140,0.25)]",
    progressColor: "#3E5C8C",
  },
]);

interface Props {
  selectedGameCount: number;

  games: any[]; // 游戏数据

  rankedStats: Record<string, RankInfo>; // 排位数据

  modeGameStats: Record<string, GameStats>; // 各模式游戏数据
}

const props = defineProps<Props>();

const charts = new Map<string, echarts.ECharts>();

function initChartRef(el: HTMLElement | null, mode: GameMode) {
  if (!el) return;

  const existingChart = charts.get(mode.key);
  if (existingChart) {
    existingChart.dispose();
  }

  const chart = echarts.init(el);
  charts.set(mode.key, chart);

  const wins = mode.isRanked ? mode.rankInfo?.wins || 0 : mode.stats?.wins || 0;
  const losses = mode.isRanked ? mode.rankInfo?.losses || 0 : mode.stats?.losses || 0;
  const total = wins + losses;

  const option = {
    series: [
      {
        type: "pie",
        radius: ["60%", "80%"],
        avoidLabelOverlap: false,
        label: {
          show: true,
          position: "center",
          formatter: `${Math.round((wins / (total || 1)) * 100)}%`,
          fontSize: 14,
          color: mode.progressColor,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: "bold",
          },
        },
        data: [
          {
            value: wins,
            name: "胜场",
            itemStyle: { color: "#3498DB" },
          },
          {
            value: losses,
            name: "负场",
            itemStyle: { color: "#E74C3C" },
          },
        ],
      },
    ],
  };

  chart.setOption(option);
}

window.addEventListener("resize", () => {
  charts.forEach((chart) => chart.resize());
});

onUnmounted(() => {
  charts.forEach((chart) => chart.dispose());
  charts.clear();
  window.removeEventListener("resize", () => {
    charts.forEach((chart) => chart.resize());
  });
});

watch(
  () => gameModes.value,
  (newModes) => {
    // 图表的更新现在由 ref 回调函数处理
  },
  { deep: true }
);

onMounted(() => {
  modeGameStats.value = {
    TFT: { wins: 0, losses: 0 },
    ARAM: { wins: 0, losses: 0 },
    NORMAL: { wins: 0, losses: 0 },
  };

  gameModes.value.forEach((mode) => {
    initChartRef(null, mode);
  });
});

function getRankText(rankInfo?: RankInfo): string {
  if (!rankInfo || !rankInfo.tier) return "未定级";
  return `${rankInfo.tier} ${rankInfo.division}`;
}

function getWinRate(stats?: { wins?: number; losses?: number }): number {
  if (!stats || typeof stats.wins !== "number") return 0;
  const total = (stats.wins || 0) + (stats.losses || 0);
  return total > 0 ? Math.round((stats.wins / total) * 100) : 0;
}

function getChampionIcon(championId: number): string {
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${championId}.png`;
}

function updateHeroStats(mode: GameMode, games: any[]) {
  const heroStats = new Map<number, { name: string; playCount: number; wins: number }>();

  games.forEach((game) => {
    const championId = game.championId;
    const championName = game.championName;
    const isWin = game.win;

    const stats = heroStats.get(championId) || {
      name: championName,
      playCount: 0,
      wins: 0,
    };

    stats.playCount++;
    if (isWin) stats.wins++;

    heroStats.set(championId, stats);
  });

  // 转换为数组并排序
  const sortedHeroes = Array.from(heroStats.entries())
    .map(([id, stats]) => ({
      id,
      name: stats.name,
      playCount: stats.playCount,
      wins: stats.wins,
      winRate: stats.wins / stats.playCount,
    }))
    .sort((a, b) => b.playCount - a.playCount)
    .slice(0, 8); // 只取前8个

  return sortedHeroes;
}

watch(
  () => props.games,
  (newGames) => {
    if (!newGames) return;

    // 按模式分类游戏
    const gamesByMode = new Map<string, any[]>();
    newGames.forEach((game) => {
      // 根据游戏类型分类
      let modeKey = game.gameMode;

      // 如果是排位赛，需要进一步区分单双排和灵活组排
      if (game.gameMode === "RANKED") {
        modeKey = game.queueId === 420 ? "RANKED_SOLO_5x5" : "RANKED_FLEX_SR";
      }

      const games = gamesByMode.get(modeKey) || [];
      games.push(game);
      gamesByMode.set(modeKey, games);
    });

    // 更新每个模式的英雄统计
    gameModes.value.forEach((mode) => {
      const modeGames = gamesByMode.get(mode.key);
      if (modeGames) {
        mode.frequentHeroes = updateHeroStats(mode, modeGames);
      }
    });
  },
  { deep: true }
);
</script>
