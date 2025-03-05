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
          header-style="padding: 10px 24px"
        >
          <template #header>
            <div class="h-16 font-bold flex items-center justify-between">
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

          <div class="flex flex-col gap-4">
            <!-- 说明文字 -->
            <div
              class="text-sm text-[var(--text-color-2)] flex items-center justify-between"
            >
              <div>
                近
                <n-tooltip trigger="hover" placement="top">
                  <template #trigger>
                    <span class="text-[#3498DB] font-bold cursor-help">{{
                      getActualGameCount(mode.key)
                    }}</span>
                  </template>
                  <template #default>
                    {{ getTooltipText(mode.key) }}
                  </template>
                </n-tooltip>
                场{{ mode.title }}
              </div>

              <!-- 添加 KDA 显示 -->
              <n-tooltip trigger="hover" placement="top">
                <template #trigger>
                  <span class="text-[#E67E22] font-bold cursor-help">
                    KDA: {{ mode.kda || "0.0" }}
                  </span>
                </template>
                <template #default>
                  <div class="p-1">
                    <div class="font-bold mb-1">KDA计算方式</div>
                    <div class="text-sm">
                      KDA = (击杀 + 助攻) / 死亡
                      <br />
                      完美KDA（无死亡）显示为"Perfect"
                    </div>
                  </div>
                </template>
              </n-tooltip>
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
                          <LcuImg
                            :src="championIconUri(hero.id)"
                            :alt="hero.name"
                            cusClass="w-8 h-8 object-cover"
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
              <div class="flex flex-col gap-4">
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
                          <LcuImg
                            :src="championIconUri(hero.id)"
                            :alt="hero.name"
                            cusClass="w-8 h-8 object-cover"
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
                <!-- 胜负场和常用位置信息 -->
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
                  <!-- 添加常用位置显示（仅排位模式显示） -->
                  <div v-if="mode.isRanked" class="flex items-center gap-2 mt-1">
                    <div class="w-2 h-2 rounded-full bg-[#2ECC71]"></div>
                    <span class="text-[var(--text-color-2)]">
                      常用位置: {{ mode.mainPosition || "未知" }}
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
import { TIERS_ICON, MODES, SHORT_TIERS, TIERS } from "../../../utils/common";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { TitleComponent, TooltipComponent, LegendComponent } from "echarts/components";
import { LabelLayout } from "echarts/features";
import { CanvasRenderer } from "echarts/renderers";
import { NTooltip } from "naive-ui";
import { championIconUri } from "../../../../../manager/utils/utils";
import { GameRecord } from "../../types";

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
  tier?: string;
  division?: string;
  leaguePoints?: number;
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

interface GameData {
  key: string;
  data: GameRecord[];
  kda?: string;
  tier?: string;
  division?: string;
  leaguePoints?: number;
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
  kda?: string;
  leaguePoints?: string;
  mainPosition?: string;
}

interface Props {
  selectedGameCount: number;
  games: {
    games: GameData[];
  };
}

const props = defineProps<Props>();

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
const modeGameStats = ref<Record<string, GameStats>>({
  TFT: { wins: 0, losses: 0 },
  ARAM: { wins: 0, losses: 0 },
  NORMAL: { wins: 0, losses: 0 },
});
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

const charts = new Map<string, echarts.ECharts>();

function initChartRef(el: Element | ComponentPublicInstance | null, mode: GameMode) {
  if (!el || !(el instanceof HTMLElement)) return;

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

// 修改 watch 函数，处理图表更新
watch(
  () => gameModes.value,
  (newModes) => {
    newModes.forEach((mode) => {
      const chart = charts.get(mode.key);
      console.log("找到图表：", chart);
      if (chart) {
        const wins = mode.isRanked ? mode.rankInfo?.wins || 0 : mode.stats?.wins || 0;
        const losses = mode.isRanked
          ? mode.rankInfo?.losses || 0
          : mode.stats?.losses || 0;
        const total = wins + losses;

        chart.setOption({
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
        });
      }
    });
  },
  { deep: true }
);

function getRankText(rankInfo?: RankInfo): string {
  if (!rankInfo || !rankInfo.tier) return TIERS["UNRANKED"];
  return `${SHORT_TIERS[rankInfo.tier]} ${rankInfo.division}`;
}

function getWinRate(stats?: { wins?: number; losses?: number }): number {
  if (!stats || typeof stats.wins !== "number") return 0;
  const total = (stats.wins || 0) + (stats.losses || 0);
  return total > 0 ? Math.round((stats.wins / total) * 100) : 0;
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

function updateRankedStats(mode: GameMode, games: any[]) {
  const result = {};
  let winCount = 0;
  let loseCount = 0;
  games.forEach((game) => {
    if (game.win) winCount++;
    else loseCount++;
  });
  result["wins"] = winCount;
  result["losses"] = loseCount;
  if (mode.isRanked) mode.rankInfo = result as RankInfo;
  else mode.stats = result as GameStats;
}

// 添加位置映射
const positionMap: Record<string, string> = {
  TOP: "上路",
  JUNGLE: "打野",
  MIDDLE: "中路",
  BOTTOM: "下路",
  UTILITY: "辅助",
  NONE: "未知",
  MID: "中路",
  ADC: "下路",
  SUPPORT: "辅助",
};

// 添加获取常用位置的函数
function getMainPosition(games: GameRecord[]): string {
  if (!games || games.length === 0) return "未知";

  const positions = games.reduce((acc, game) => {
    const pos = game.position || "NONE";
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const [mostPlayedPosition] = Object.entries(positions).sort(
    ([, a], [, b]) => b - a
  )[0] || ["NONE", 0];

  return positionMap[mostPlayedPosition.toUpperCase()] || "未知";
}

watch(
  () => props.games,
  (newGames) => {
    if (!newGames?.games) return;

    gameModes.value.forEach((mode) => {
      const modeData = newGames.games.find((g) => g.key === mode.key);
      if (modeData?.data) {
        // 更新常用英雄
        mode.frequentHeroes = updateHeroStats(mode, modeData.data);
        // 更新胜负场统计
        updateRankedStats(mode, modeData.data);
        // 更新额外信息
        if (mode.isRanked) {
          // 更新段位信息
          if (modeData.tier) {
            mode!.rankInfo = {
              ...mode.rankInfo,
              tier: modeData.tier || '',
              division: modeData.division || "",
              leaguePoints: modeData.leaguePoints || 0,
            } as RankInfo;
          }
          mode.rankIcon = modeData.tier
            ? TIERS_ICON[modeData.tier]
            : TIERS_ICON["UNRANKED"];
          // 更新常用位置
          mode.mainPosition = getMainPosition(modeData.data);
        }
        mode.kda = modeData.kda;
      }
    });
  },
  { deep: true }
);

// 修改获取实际游戏场数的函数
function getActualGameCount(modeKey: string): number {
  if (!props.games?.games) return 0;
  const modeGames = props.games.games.find((g) => g.key === modeKey)?.data || [];
  return Math.min(modeGames.length, props.selectedGameCount);
}

// 修改获取提示文本的函数
function getTooltipText(modeKey: string): string {
  if (!props.games?.games) return "";

  const modeGames = props.games.games.find((g) => g.key === modeKey)?.data || [];
  const totalGames = modeGames.length;
  const requestedGames = props.selectedGameCount;

  if (totalGames >= requestedGames) {
    return `显示最近 ${requestedGames} 场比赛数据（共有 ${totalGames} 场记录）`;
  } else {
    return `该模式下仅有 ${totalGames} 场比赛记录，少于所选的 ${requestedGames} 场`;
  }
}
</script>

<style scoped>
.cursor-help {
  cursor: help;
}

/* 添加 KDA 文字的悬停效果 */
.text-[#E67E22]:hover {
  opacity: 0.8;
  transition: opacity 0.2s ease;
}

/* 添加常用位置图标的颜色 */
.bg-[#2ECC71] {
  background-color: #2ecc71;
}
</style>
