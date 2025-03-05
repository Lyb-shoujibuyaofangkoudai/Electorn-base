<template>
  <ConnLOLClient>
    <div
      class="relative w-full min-h-screen bg-gradient-from-[#292E5C]-to-[#1E2142] dark:from-[#1A1D3B]-to-[#141630]"
    >
      <!-- 背景装饰 -->
      <div class="absolute inset-0 overflow-hidden">
        <div class="absolute -inset-[100px] bg-grid op-10"></div>
      </div>

      <!-- 主内容卡片 -->
      <n-card
        class="relative w-full backdrop-blur-xl bg-[#2D325F]/40 dark:bg-[#1F2245]/40"
      >
        <PlayerInfoBar
          :loading="isLoading"
          :summoner="summonerInfo"
          :theme-color="themeVars?.primaryColor ?? '#18A058'"
          :stats="gameStats"
          :game-type-text="TAGS[selectedGameType]"
          :type-select-disabled="gameTypeSelectDisabled"
          :initial-game-type="selectedGameType"
          :initial-game-count="selectedGameCount"
          :games="recentGames"
          @copy="copy"
          @update-game-type="handleGameTypeChange"
          @update-game-count="handleGameCountChange"
        />

        <!-- 详细数据区域 -->
        <GameModeCards
          :loading="isLoading"
          :selected-game-count="selectedGameCount"
          :games="filteredGamesByMode"
        />
      </n-card>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { profileIconUri } from "../../../../manager/utils/utils";
import { useRequestDataStore } from "../../store/requestDataStore";
import { storeToRefs } from "pinia";
import { ref, computed, onMounted, watch } from "vue";
import { useThemeVars } from "naive-ui";
import { useConfig } from "../../store/config";
import { useLeague } from "../../store/league";
import { copy } from "../../utils/utils";
import { TimerRound } from "@vicons/material";
import { TAGS, TAGS_ENUM, GAME_TYPES, RegionMap } from '../../utils/common'
import PlayerInfoBar from "./components/PlayerInfoBar.vue";
import GameModeCards from "./components/GameModeCards.vue";

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

interface RankedStats {
  queueMap: {
    RANKED_SOLO_5x5?: RankInfo;
    RANKED_FLEX_SR?: RankInfo;
  };
}

interface SgpMatchHistory {
  games: Array<{
    json: {
      queueId: number;
      gameMode: string;
      gameDuration: number;
      participants: Array<{
        puuid: string;
        championId: number;
        championName: string;
        win: boolean;
        kills: number;
        deaths: number;
        assists: number;
        visionScore: number;
        teamPosition?: string;
        lane?: string;
      }>;
    };
  }>;
}

interface GameRecord {
  gameMode: string;
  queueId: number;
  championId: number;
  championName: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  visionScore: number;
  gameLength: number;
  position?: string;
}

const configStore = useConfig();
const leagueStore = useLeague();
const themeVars = useThemeVars();
const store = useRequestDataStore();
const { requestData } = storeToRefs(store);
const api = useApi();

const region = computed(
  () =>
    configStore.configInfo?.servers[
      `${leagueStore.leagueInfo?.region}_${leagueStore.leagueInfo?.rsoPlatformId}`
    ]?.name ?? ""
);
// 计算经验进度
const getExpProgress = computed(() => {
  const currentExp = requestData.value?.summoner?.xpSinceLastLevel || 0;
  const expToNextLevel = requestData.value?.summoner?.xpUntilNextLevel || 100;
  return Math.round((currentExp / expToNextLevel) * 100);
});

const getExpToNextLevel = computed(() => {
  return requestData.value?.summoner?.xpUntilNextLevel || 0;
});

// 获取段位文字
function getRankText(rankInfo?: RankInfo): string {
  if (!rankInfo || !rankInfo.tier) return "未定级";
  return `${rankInfo.tier} ${rankInfo.division}`;
}

// 计算胜率
function getWinRate(stats?: { wins?: number; losses?: number }): number {
  if (!stats || typeof stats.wins !== "number") return 0;
  const total = (stats.wins || 0) + (stats.losses || 0);
  return total > 0 ? Math.round((stats.wins / total) * 100) : 0;
}

const selectedGameCount = ref<number>(20);

// 修改数据存储
const recentGames = ref<GameRecord[]>([]);

// 计算KDA
function getKDA(games: GameRecord[]): string {
  if (games.length === 0) return "0.0";

  const totalKills = games.reduce((sum, game) => sum + game.kills, 0);
  const totalDeaths = games.reduce((sum, game) => sum + game.deaths, 0);
  const totalAssists = games.reduce((sum, game) => sum + game.assists, 0);

  const kda =
    totalDeaths === 0
      ? totalKills + totalAssists
      : ((totalKills + totalAssists) / totalDeaths).toFixed(1);
  return kda.toString();
}

// 计算场均击杀
function getAverageKills(games: GameRecord[]): string {
  if (games.length === 0) return "0.0";

  const totalKills = games.reduce((sum, game) => sum + game.kills, 0);
  return (totalKills / games.length).toFixed(1);
}

// 计算场均死亡
function getAverageDeaths(games: GameRecord[]): string {
  if (games.length === 0) return "0.0";

  const totalDeaths = games.reduce((sum, game) => sum + game.deaths, 0);
  return (totalDeaths / games.length).toFixed(1);
}

// 计算场均助攻
function getAverageAssists(games: GameRecord[]): string {
  if (games.length === 0) return "0.0";

  const totalAssists = games.reduce((sum, game) => sum + game.assists, 0);
  return (totalAssists / games.length).toFixed(1);
}

// 计算游戏时长
function getTotalGameTime(games: GameRecord[]): string {
  const totalMinutes = games.reduce((sum, game) => sum + game.gameLength, 0);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes}m`;
}

// 添加位置映射
const positionMap: Record<string, string> = {
  TOP: "上路",
  JUNGLE: "打野",
  MIDDLE: "中路",
  BOTTOM: "下路",
  UTILITY: "辅助",
  NONE: "未知",
  // 添加其他可能的位置映射
  MID: "中路",
  ADC: "下路",
  SUPPORT: "辅助",
};

// 修改获取常用位置的函数
function getMainPosition(games: GameRecord[]): string {
  if (games.length === 0) return "-";

  const positions = games.reduce((acc:any, game:any) => {
    acc[game.position] = (acc[game.position] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostPlayedPosition = Object.entries(positions).sort(
    ([, a], [, b]) => (b as any) - (a as any)
  )[0][0];

  // 返回中文位置名称，如果没有对应的映射则返回原始值
  return positionMap[mostPlayedPosition.toUpperCase()] || mostPlayedPosition;
}

// 计算胜场数
function getTotalGames(games: GameRecord[]): string {
  const wins = games.filter((game) => game.win).length;
  return `${wins}/${games.length}`;
}

// 添加一个计算属性来显示选中范围内的胜率
const selectedRangeWinRate = computed(() => {
  const games = recentGames.value.slice(0, selectedGameCount.value);
  if (games.length === 0) return 0;
  const wins = games.filter((game) => game.win).length;
  return Math.round((wins / games.length) * 100);
});

// 添加一个计算属性来显示选中范围内的场次信息
const selectedRangeInfo = computed(() => {
  const games = recentGames.value.slice(0, selectedGameCount.value);
  const wins = games.filter((game) => game.win).length;
  return {
    total: games.length,
    wins,
    losses: games.length - wins,
    winRate: selectedRangeWinRate.value,
  };
});

// 计算场均视野得分
function getAverageVision(games: GameRecord[]): string {
  if (games.length === 0) return "0.0";

  const totalVision = games.reduce(
    (sum: number, game: GameRecord) => sum + game.visionScore,
    0
  );
  return (totalVision / games.length).toFixed(1);
}

// 修改选中的比赛类型的默认值，默认显示单双排
const selectedGameType = ref<TAGS_ENUM>(TAGS_ENUM.q_420);

// 添加 loading 状态
const isLoading = ref(false);

async function fetchGameData(tag: TAGS_ENUM = selectedGameType.value) {
  isLoading.value = true;
  try {
    const sgpResponse = await api.sgpApi.getMatchHistory(
      leagueStore.leagueInfo?.rsoPlatformId || "",
      requestData.value?.summoner?.puuid || "",
      0,
      selectedGameCount.value,
      tag === TAGS_ENUM.all ? undefined : tag
    );

    console.log("查看SGP接口获取的数据:", tag, sgpResponse);
    const sgpData = (sgpResponse as unknown) as SgpMatchHistory;

    if (sgpData?.games) {
      leagueStore.setSgpApiAvailable(true);

      const processedGames: GameRecord[] = [];

      for (const game of sgpData.games) {
        const participant = game.json.participants.find(
          (p) => p.puuid === requestData.value?.summoner?.puuid
        );

        if (!participant) continue;

        processedGames.push({
          gameMode: game.json.queueId === 420 ? "RANKED" : game.json.gameMode,
          queueId: game.json.queueId,
          championId: participant.championId,
          championName: participant.championName || "",
          win: participant.win,
          kills: participant.kills || 0,
          deaths: participant.deaths || 0,
          assists: participant.assists || 0,
          visionScore: participant.visionScore || 0,
          gameLength: Math.floor(game.json.gameDuration / 60),
          position: participant.teamPosition || participant.lane || "NONE",
        });
      }

      return processedGames;
    }
    return [];
  } catch (error) {
    console.warn("SGP API 获取失败，尝试使用 LCU API", error);
    leagueStore.setSgpApiAvailable(false);

    if (selectedGameType.value !== TAGS_ENUM.all) {
      selectedGameType.value = TAGS_ENUM.all;
    }

    try {
      const matchHistory = await api.lcuApi.matchHistory.getMatchHistory(
        requestData.value?.summoner?.puuid || "",
        0,
        selectedGameCount.value
      );

      console.log("查看LCU接口获取的数据:", matchHistory);
      const lcuData = (matchHistory as unknown) as {
        games: {
          games: Array<{
            queueId: number;
            gameMode: string;
            gameDuration: number;
            participants: Array<{
              championId: number;
              stats: {
                win: boolean;
                kills: number;
                deaths: number;
                assists: number;
                visionScore: number;
              };
              timeline?: {
                lane?: string;
              };
            }>;
          }>;
        };
      };

      if (lcuData?.games?.games) {
        const processedGames: GameRecord[] = [];

        for (const game of lcuData.games.games) {
          const participant = game.participants[0];
          if (!participant) continue;

          processedGames.push({
            gameMode: game.queueId === 420 ? "RANKED" : game.gameMode,
            queueId: game.queueId,
            championId: participant.championId,
            championName: String(participant.championId), // 暂时使用championId作为名称
            win: participant.stats.win,
            kills: participant.stats.kills || 0,
            deaths: participant.stats.deaths || 0,
            assists: participant.stats.assists || 0,
            visionScore: participant.stats.visionScore || 0,
            gameLength: Math.floor(game.gameDuration / 60),
            position: participant.timeline?.lane || "NONE",
          });
        }

        return processedGames;
      }
      return [];
    } catch (lcuError) {
      console.error("获取比赛数据失败", lcuError);
      return [];
    }
  } finally {
    isLoading.value = false;
  }
}

// 修改初始化逻辑
onMounted(async () => {
  try {
    // 先尝试获取单双排数据 这里主要用于顶部信息栏
    const games = await fetchGameData(TAGS_ENUM.q_420);
    recentGames.value = games;

    // 如果 SGP API 不可用，则切换到所有类型
    if (!leagueStore.isSgpApiAvailable) {
      selectedGameType.value = TAGS_ENUM.all;
      const allGames = await fetchGameData(TAGS_ENUM.all);
      recentGames.value = allGames;
    }
  } catch (error) {
    console.error("获取数据失败:", error);
  }
});

// 修改比赛类型选择器的禁用状态
const gameTypeSelectDisabled = computed(() => !leagueStore.isSgpApiAvailable);

// 整合召唤师信息
const summonerInfo = computed(() => ({
  name: requestData.value?.summoner?.gameName ?? "",
  tag: requestData.value?.summoner?.tagLine ?? "",
  level: requestData.value?.summoner?.summonerLevel ?? 0,
  iconUrl: profileIconUri(requestData.value?.summoner?.profileIconId),
  region: region.value,
  regionDetail: RegionMap[leagueStore.leagueInfo?.rsoOriginalPlatformId] ?? '',
  levelProgress: requestData.value?.summoner?.percentCompleteForNextLevel ?? 0,
  expToNextLevel: requestData.value?.summoner?.xpUntilNextLevel ?? 0,
  totalExp:
    requestData.value?.summoner?.xpSinceLastLevel +
      (requestData.value?.summoner?.summonerLevel ?? 0) * 2880 || 0,
}));

// 整合游戏统计数据
const gameStats = computed(() => ({
  winRate: selectedRangeWinRate.value,
  wins: selectedRangeInfo.value.wins,
  losses: selectedRangeInfo.value.losses,
  avgKills: getAverageKills(recentGames.value),
  avgDeaths: getAverageDeaths(recentGames.value),
  avgAssists: getAverageAssists(recentGames.value),
  totalGameTime: getTotalGameTime(recentGames.value),
  mainPosition: getMainPosition(recentGames.value),
  kda: getKDA(recentGames.value),
  avgVision: getAverageVision(recentGames.value),
}));

const handleGameTypeChange = async (type: TAGS_ENUM) => {
  selectedGameType.value = type;
  recentGames.value = await fetchGameData(type as TAGS_ENUM);
};

const handleGameCountChange = async (count: number) => {
  selectedGameCount.value = count;
  recentGames.value = await fetchGameData();
  getGameModeData();
};

const gameModeData = ref<
  {
    key: TAGS_ENUM;
    data: GameRecord[];
    kda?: string;
    leaguePoints?: string;
  }[]
>([]);
getGameModeData();

async function getGameModeData() {
  isLoading.value = true;
  try {
    if (gameModeData.value.length > 0) {
      gameModeData.value = [];
    }
    const needDataParams = [
      TAGS_ENUM.q_420, // 单双排
      TAGS_ENUM.q_430, // 匹配模式
      TAGS_ENUM.q_440, // 灵活排位
      TAGS_ENUM.q_450, // 极地大乱斗
    ];
    const fetchGameModeDataPromiseArr = needDataParams.map((tag) => fetchGameData(tag));
    const resArr = await Promise.allSettled(fetchGameModeDataPromiseArr);
    resArr.map((item: any, index: number) => {
      if (item.status === "fulfilled") {
        if (
          needDataParams[index] === TAGS_ENUM.q_420 ||
          needDataParams[index] === TAGS_ENUM.q_440
        ) {
          gameModeData.value.push({
            key: needDataParams[index],
            data: item.value,
            leaguePoints: getMainPosition(item.value),
            kda: getKDA(item.value),
          });
        } else {
          gameModeData.value.push({
            key: needDataParams[index],
            data: item.value,
            kda: getKDA(item.value),
          });
        }
      } else {
        gameModeData.value.push({
          key: needDataParams[index],
          data: [],
        });
      }
    });
    console.log("获取多个比赛模式数据：", gameModeData.value);
  } finally {
    isLoading.value = false;
  }
}

// 添加段位数据的计算属性
const tiers = computed(() => ({
  RANKED_SOLO_5x5: {
    division:
      requestData.value?.ranked?.queueMap?.RANKED_SOLO_5x5?.division !== "NA"
        ? requestData.value?.ranked?.queueMap?.RANKED_SOLO_5x5?.division
        : "",
    tier: requestData.value?.ranked?.queueMap?.RANKED_SOLO_5x5?.tier || "",
    leaguePoints: requestData.value?.ranked?.queueMap?.RANKED_SOLO_5x5?.leaguePoints || 0,
  },
  RANKED_FLEX_SR: {
    division: requestData.value?.ranked?.queueMap?.RANKED_FLEX_SR?.division || "",
    tier: requestData.value?.ranked?.queueMap?.RANKED_FLEX_SR?.tier || "",
    leaguePoints: requestData.value?.ranked?.queueMap?.RANKED_FLEX_SR?.leaguePoints || 0,
  },
}));

// 修改 filteredGamesByMode 的实现
const filteredGamesByMode = computed(() => {
  // 转换数据格式
  const games = [
    {
      key: "RANKED_SOLO_5x5",
      data: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_420)?.data || [],
      kda: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_420)?.kda,
      tier: tiers.value.RANKED_SOLO_5x5.tier,
      division: tiers.value.RANKED_SOLO_5x5.division,
      leaguePoints: tiers.value.RANKED_SOLO_5x5.leaguePoints,
    },
    {
      key: "RANKED_FLEX_SR",
      data: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_440)?.data || [],
      kda: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_440)?.kda,
      tier: tiers.value.RANKED_FLEX_SR.tier,
      division: tiers.value.RANKED_FLEX_SR.division,
      leaguePoints: tiers.value.RANKED_FLEX_SR.leaguePoints,
    },
    {
      key: "NORMAL",
      data: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_430)?.data || [],
      kda: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_430)?.kda,
    },
    {
      key: "ARAM",
      data: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_450)?.data || [],
      kda: gameModeData.value.find((g) => g.key === TAGS_ENUM.q_450)?.kda,
    },
  ];

  return { games };
});
</script>

<style>
:root {
  --border-color: rgba(255, 255, 255, 0.1);
}

.dark {
  --border-color: rgba(255, 255, 255, 0.2);
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
