<!-- 英雄联盟对战历史面板 -->
<template>
  <div class="match-history-dashboard relative">

    <!-- 头部区域 -->
    <header
      class="dashboard-header relative h-[120px] backdrop-blur-xl bg-[#2D325F]/40 dark:bg-[#1F2245]/40 p-4 shadow-lg"
    >
      <div class="flex items-center gap-4">
        <!-- 用户资料卡片 -->
        <div class="flex-1 flex items-center gap-6">
          <!-- 基本信息 -->
          <div class="flex items-center gap-4">
            <div class="relative">
              <n-progress
                class="!w-30 !h-30 text-0 card-avatar"
                type="circle"
                :color="{
                  stops: ['#3498DB', '#2ECC71', '#F1C40F', '#E67E22', '#E74C3C'],
                }"
                :percentage="summoner?.levelProgress || 0"
              >
                <div class="relative">
                  <LcuImg
                    cus-class="rounded-full w-22 h-22"
                    :src="profileIconUri(summoner?.profileIconId)"
                  />
                  <div
                    class="absolute bottom-1 right-1/2 translate-x-1/2 px-2 rounded-xl w-max w-full text-center text-2.5 font-bold"
                    :style="{
                      backgroundColor: themeVars?.primaryColor ?? '#3498DB',
                      color: '#fff',
                    }"
                  >
                    LV: {{ summoner?.level || 0 }}
                  </div>
                </div>
              </n-progress>
            </div>
            <div>
              <h2 class="text-xl font-bold text-white">
                {{ summoner?.name || "未知召唤师" }}
              </h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[#94a3b8] text-sm">{{
                  summoner?.region || "未知区服"
                }}</span>
              </div>
              <div class="text-sm text-[#94a3b8] mt-1">
                距离
                <span class="font-bold text-[#3498DB]">{{
                  (summoner?.level || 0) + 1
                }}</span>
                级还需
                <span class="font-bold text-[#E74C3C]">{{
                  summoner?.expToNextLevel || 0
                }}</span>
                经验值
              </div>
            </div>
          </div>

          <!-- 段位信息 -->
          <div class="flex items-center gap-6">
            <!-- 单双排位区域 -->
            <div class="flex gap-4 p-2 rounded-lg bg-[#2D325F]/40">
              <div class="rank-card flex flex-col items-center gap-2">
                <div class="text-sm text-[#94a3b8]">单双排</div>
                
                <LcuImg
                  cus-class="w-12 h-12"
                  :src="TIERS_ICON[summoner?.soloRank?.tier || 'UNRANKED']"
                />
                <div class="flex flex-col">
                  <div class="text-white text-center">
                    {{ SHORT_TIERS[summoner?.soloRank?.tier || "UNRANKED"] }}
                    {{ summoner?.soloRank?.division || "" }}
                  </div>
                  <div class="text-xs text-[#94a3b8]" v-if="summoner?.soloRank?.tier">
                    {{ summoner?.soloRank?.leaguePoints || 0 }}LP
                    <span class="ml-1">
                      胜率
                      {{
                        calculateWinRate(
                          summoner?.soloRank?.wins,
                          summoner?.soloRank?.losses
                        )
                      }}%
                    </span>
                  </div>
                </div>
              </div>
              <!-- 单双排最高段位 -->
              <div
                class="rank-card flex flex-col items-center gap-2 border-t border-[#4A5090]/10"
              >
                <div class="text-sm text-[#94a3b8]">最高段</div>
                
                <LcuImg
                  cus-class="w-12 h-12"
                  :src="TIERS_ICON[summoner?.soloHighestRank?.tier || 'UNRANKED']"
                />
                <div class="flex flex-col">
                  <div class="text-white text-sm text-center">
                    {{ SHORT_TIERS[summoner?.soloHighestRank?.tier || "UNRANKED"] }}
                    {{ summoner?.soloHighestRank?.division || "" }}
                  </div>
                  
                </div>
              </div>
            </div>

            <!-- 灵活排位区域 -->
            <div class="flex gap-4 p-2 rounded-lg bg-[#2D325F]/40">
              <div class="rank-card flex flex-col items-center gap-2">
                <div class="text-sm text-[#94a3b8]">灵活排</div>
                
                <LcuImg
                  cus-class="w-12 h-12"
                  :src="TIERS_ICON[summoner?.flexRank?.tier || 'UNRANKED']"
                />
                <div class="flex flex-col">
                  <div class="text-white text-center">
                    {{ SHORT_TIERS[summoner?.flexRank?.tier || "UNRANKED"] }}
                    {{ summoner?.flexRank?.division || "" }}
                  </div>
                  <div class="text-xs text-[#94a3b8]" v-if="summoner?.flexRank?.tier">
                    {{ summoner?.flexRank?.leaguePoints || 0 }}LP
                    <span class="ml-1">
                      胜率
                      {{
                        calculateWinRate(
                          summoner?.flexRank?.wins,
                          summoner?.flexRank?.losses
                        )
                      }}%
                    </span>
                  </div>
                </div>
              </div>
              <!-- 灵活排最高段位 -->
              <div
                class="rank-card flex flex-col items-center gap-2 border-t border-[#4A5090]/10"
              >
                <div class="text-sm text-[#94a3b8]">最高段</div>
                
                <LcuImg
                  cus-class="w-12 h-12"
                  :src="TIERS_ICON[summoner?.flexHighestRank?.tier || 'UNRANKED']"
                />
                <div class="flex flex-col">
                  <div class="text-white text-sm text-center">
                    {{ SHORT_TIERS[summoner?.flexHighestRank?.tier || "UNRANKED"] }}
                    {{ summoner?.flexHighestRank?.division || "" }}
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 比赛类型选择 -->
        <div class="flex items-center gap-4">
          <n-select
            v-model:value="selectedQueue"
            :options="GAME_TYPES"
            placeholder="选择游戏模式"
            class="w-40"
          />
        </div>
      </div>
    </header>

    <!-- 主体内容区域 -->
    <div class="dashboard-content flex gap-4 p-4" :style="{ height: mainContentHeight }">
      <!-- 左侧边栏 - 对局列表 -->
      <div class="sidebar-left w-full lg:w-1/4 min-w-[300px] bg-[#2C2F33]/80 rounded-lg">
        <n-scrollbar class="h-full">
          <div class="p-4">
            <!-- 对局卡片列表 -->
            <div
              v-for="(match, index) in matches"
              :key="match.id"
              @click="handleMatchSelect(index)"
              class="match-card relative mb-4 p-4 rounded-lg cursor-pointer transition-all duration-300"
              :class="[
                selectedMatchIndex === index
                  ? 'bg-[#3498DB]/20 shadow-lg border-2'
                  : 'bg-[#23272A] hover:bg-[#3498DB]/10 border',
                match.win
                  ? 'border-[#2ECC71] hover:border-[#2ECC71]'
                  : 'border-[#E74C3C] hover:border-[#E74C3C]',
              ]"
            >
              <div class="flex items-center gap-4">
                <LcuImg
                  cus-class="w-12 h-12 rounded-full"
                  :src="championIconUri(match.championId)"
                />
                <div class="flex-1">
                  <div class="flex items-center justify-between">
                    <span
                      class="text-sm font-medium"
                      :class="match.win ? 'text-[#2ECC71]' : 'text-[#E74C3C]'"
                    >
                      {{ match.win ? "胜利" : "失败" }}
                    </span>
                    <span class="text-[#94a3b8] text-xs">{{ match.time }}</span>
                  </div>
                  <div class="mt-1">
                    <span class="text-white">{{ match.kda }}</span>
                    <span class="text-[#94a3b8] text-sm ml-2"
                      >KDA: {{ match.kdaRatio }}</span
                    >
                  </div>
                </div>
              </div>
              <!-- 选中状态指示器 -->
              <div
                v-if="selectedMatchIndex === index"
                class="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 rounded-l"
                :class="match.win ? 'bg-[#2ECC71]' : 'bg-[#E74C3C]'"
              ></div>
            </div>
          </div>
        </n-scrollbar>
      </div>

      <!-- 中间主要内容区 -->
      <div class="main-content w-full lg:w-[75%] min-w-[400px]">
        <n-scrollbar class="h-full">
          <div class="space-y-4 p-4">
            <!-- 主要内容卡片 -->
            <div class="bg-[#2C2F33]/80 backdrop-blur-xl rounded-lg p-4">
              <n-tabs type="line" animated>
                <!-- 对局玩家信息标签 -->
                <n-tab-pane name="players" tab="对局玩家">
                  <div class="space-y-4">
                    <!-- 我方玩家 -->
                    <div class="team-section">
                      <h3 class="text-[#3498DB] mb-2 font-medium">我方玩家</h3>
                      <div class="space-y-2">
                        <div
                          v-for="player in currentMatch?.blueTeam"
                          :key="player.summonerId"
                          class="player-card flex items-center gap-3 p-3 rounded-lg backdrop-blur-xl bg-[#2D325F]/40"
                        >
                          <div class="flex items-center gap-2 flex-1">
                            <LcuImg
                              cus-class="w-8 h-8 rounded-full"
                              :src="championIconUri(player.championId)"
                            />
                            <div class="flex flex-col">
                              <span class="text-white text-sm">{{
                                player.summonerName
                              }}</span>
                              <span class="text-xs text-[#94a3b8]">{{
                                player.rank
                              }}</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-4">
                            <div class="text-sm">
                              <span
                                :class="
                                  player.kda.includes('0死亡')
                                    ? 'text-[#2ECC71]'
                                    : 'text-white'
                                "
                              >
                                {{ player.kda }}
                              </span>
                            </div>
                            <div class="text-xs text-[#94a3b8]">
                              伤害: {{ player.damage }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- 敌方玩家 -->
                    <div class="team-section">
                      <h3 class="text-[#E74C3C] mb-2 font-medium">敌方玩家</h3>
                      <div class="space-y-2">
                        <div
                          v-for="player in currentMatch?.redTeam"
                          :key="player.summonerId"
                          class="player-card flex items-center gap-3 p-3 rounded-lg backdrop-blur-xl bg-[#2D325F]/40"
                        >
                          <div class="flex items-center gap-2 flex-1">
                            <LcuImg
                              cus-class="w-8 h-8 rounded-full"
                              :src="championIconUri(player.championId)"
                            />
                            <div class="flex flex-col">
                              <span class="text-white text-sm">{{
                                player.summonerName
                              }}</span>
                              <span class="text-xs text-[#94a3b8]">{{
                                player.rank
                              }}</span>
                            </div>
                          </div>
                          <div class="flex items-center gap-4">
                            <div class="text-sm">
                              <span
                                :class="
                                  player.kda.includes('0死亡')
                                    ? 'text-[#2ECC71]'
                                    : 'text-white'
                                "
                              >
                                {{ player.kda }}
                              </span>
                            </div>
                            <div class="text-xs text-[#94a3b8]">
                              伤害: {{ player.damage }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </n-tab-pane>

                <!-- 概览标签 -->
                <n-tab-pane name="overview" tab="对局总览">
                  <match-overview :match-data="matchData" />
                </n-tab-pane>

                <!-- 伤害标签 -->
                <n-tab-pane name="damage" tab="伤害分析">
                  <match-damage :match-data="matchData" />
                </n-tab-pane>

                <!-- 视野标签 -->
                <n-tab-pane name="vision" tab="视野分析">
                  <match-vision :match-data="matchData" />
                </n-tab-pane>

                <!-- 装备标签 -->
                <n-tab-pane name="items" tab="装备分析">
                  <match-items :match-data="matchData" />
                </n-tab-pane>
              </n-tabs>
            </div>

            <!-- 底部状态卡片区域 -->
            <div class="grid grid-cols-3 gap-4">
              <!-- 能力评估 -->
              <div
                class="stat-card col-span-1 p-4 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg"
              >
                <h3 class="text-white mb-4">能力评估</h3>
                <div class="h-48">
                  <!-- 这里放置雷达图组件 -->
                </div>
              </div>

              <!-- 符文效率 -->
              <div
                class="stat-card col-span-1 p-4 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg"
              >
                <h3 class="text-white mb-4">符文效率</h3>
                <div class="h-48">
                  <!-- 这里放置符文效率图表组件 -->
                </div>
              </div>

              <!-- 分享按钮区域 -->
              <div
                class="social-share col-span-1 p-4 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg flex flex-col justify-between"
              >
                <h3 class="text-white mb-4">分享数据</h3>
                <div class="flex flex-col gap-2">
                  <n-button type="primary" ghost block> 分享战绩 </n-button>
                  <n-button type="primary" ghost block> 导出数据 </n-button>
                </div>
              </div>
            </div>
          </div>
        </n-scrollbar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import {
  NTabs,
  NTabPane,
  NSelect,
  NTag,
  NButton,
  NInputGroup,
  NScrollbar,
  NProgress,
  useThemeVars,
} from "naive-ui";
import { profileIconUri, championIconUri } from "../../../../../manager/utils/utils";
import { TIERS_ICON, SHORT_TIERS, GAME_TYPES } from "../../../utils/common";
import MatchOverview from "./tabs/MatchOverview.vue";
import MatchDamage from "./tabs/MatchDamage.vue";
import MatchVision from "./tabs/MatchVision.vue";
import MatchItems from "./tabs/MatchItems.vue";
import { useSearchStore } from "../../../stores/searchStore";

// 使用 store
const searchStore = useSearchStore();
const themeVars = useThemeVars();

// 移除本地状态，改用 store 中的状态
const summoner = computed(() => searchStore.summoner);
const selectedQueue = computed({
  get: () => searchStore.selectedQueue,
  set: (value) => searchStore.updateFilters(value, searchStore.selectedSeason),
});
const matches = computed(() => searchStore.matches);
const currentMatch = computed(() => searchStore.currentMatch);
const matchData = computed(() => searchStore.matchData);
const selectedMatchIndex = computed(() => searchStore.selectedMatchIndex);
const activeTab = computed({
  get: () => searchStore.activeTab,
  set: (value) => searchStore.updateActiveTab(value),
});

const queueOptions = [
  { label: "单双排位", value: "ranked_solo" },
  { label: "灵活组排", value: "ranked_flex" },
  { label: "匹配模式", value: "normal" },
];

// 计算伤害百分比
const getDamagePercentage = (damage: string, team: any[]) => {
  const maxDamage = Math.max(...team.map((player) => parseInt(player.damage)));
  return (parseInt(damage) / maxDamage) * 100;
};

// 计算经济百分比
const getGoldPercentage = (gold: string, team: any[]) => {
  const maxGold = Math.max(...team.map((player) => parseInt(player.gold)));
  return (parseInt(gold) / maxGold) * 100;
};

// 格式化时间显示
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
};

// 格式化日期显示
const formatDate = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
};

// 计算KDA
const calculateKDA = (data: any) => {
  const kda = ((data.kills + data.assists) / Math.max(1, data.deaths)).toFixed(2);
  return `${kda}:1`;
};

// 标签页切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
};

// 修改选中对局的处理方法
const handleMatchSelect = (index: number) => {
  searchStore.updateCurrentMatch(index);
};

// 初始化时如果没有数据，则加载模拟数据
onMounted(() => {
  if (matches.value.length === 0) {
    // 加载模拟数据
    searchStore.updateSummoner({
      name: "测试召唤师",
      level: 100,
      rank: "钻石 IV",
      region: "艾欧尼亚",
      profileIconId: 1,
    });

    searchStore.updateMatches([
      {
        id: 1,
        championId: 1,
        win: true,
        time: "3小时前",
        kda: "10/2/8",
        kdaRatio: "9.0",
        blueTeam: [
          {
            summonerId: "1",
            summonerName: "蓝色方玩家1",
            championId: 1,
            rank: "钻石 IV",
            kda: "10/0/8 (完美)",
            damage: "25431",
            gold: "15200",
          },
          // ... 其他蓝队队员
        ],
        redTeam: [
          {
            summonerId: "6",
            summonerName: "红色方玩家1",
            championId: 6,
            rank: "钻石 III",
            kda: "2/8/5",
            damage: "15432",
            gold: "10200",
          },
          // ... 其他红队队员
        ],
      },
      // ... 其他对局
    ]);

    // 选中第一个对局
    if (matches.value.length > 0) {
      handleMatchSelect(0);
    }
  }
});

// 计算主体区域高度
const mainContentHeight = computed(() => {
  // 视窗高度 - 头部高度(120px) - 内边距(2 * 16px)
  return "calc(100vh - 120px - 32px)";
});

// 添加计算胜率的方法
const calculateWinRate = (wins: number = 0, losses: number = 0) => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};
</script>

<style scoped>
.match-history-dashboard {
  min-height: 100vh;
  background: linear-gradient(to bottom, #292e5c, #1e2142);
}

.bg-grid {
  background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* 修改卡片背景样式 */
.user-profile-card,
.sidebar-left,
.stat-card,
.social-share {
  backdrop-filter: blur-xl;
  background-color: rgba(45, 50, 95, 0.4) !important;
}

.match-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.match-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to right, rgba(52, 152, 219, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.match-card:hover::before {
  opacity: 1;
}

.match-card:hover {
  transform: translateX(4px);
}

:deep(.n-tabs-nav) {
  background-color: transparent !important;
}

:deep(.n-tabs-tab) {
  color: #94a3b8 !important;
}

:deep(.n-tabs-tab--active) {
  color: #3498db !important;
}

:deep(.n-tabs-bar) {
  background-color: #3498db !important;
}

/* 响应式布局 */
@media (max-width: 1440px) {
  .main-content {
    width: 75%;
  }
}

@media (max-width: 1024px) {
  .main-content {
    width: 100%;
  }
  .grid-cols-3 {
    grid-template-columns: repeat(1, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header {
    height: auto;
  }
}

/* 添加新的样式 */
.chart-section {
  @apply rounded-lg overflow-hidden;
}

/* 修改滚动条样式 */
:deep(.n-scrollbar) {
  --n-scrollbar-width: 6px;
  --n-scrollbar-height: 6px;
  --n-scrollbar-color: rgba(52, 152, 219, 0.2);
  --n-scrollbar-color-hover: rgba(52, 152, 219, 0.3);
}

/* 移除之前的固定高度设置 */
.sidebar-left > div {
  height: auto;
}

/* 确保内容区域占满可用空间 */
.dashboard-content {
  display: flex;
  gap: 1rem;
}

.main-content,
.sidebar-left {
  display: flex;
  flex-direction: column;
}
</style>
