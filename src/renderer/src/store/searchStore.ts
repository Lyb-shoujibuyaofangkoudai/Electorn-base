import { defineStore } from "pinia";
import { ref } from "vue";

interface RankInfo {
  tier: string;
  division: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

interface HighestRankInfo {
  tier: string;
  division: string;
  season: string;
}

interface Summoner {
  name: string;
  level: number;
  rank: string;
  region: string;
  profileIconId: number;
  levelProgress: number;
  expToNextLevel: number;
  totalExp: number;
  soloRank?: RankInfo;
  flexRank?: RankInfo;
  soloHighestRank?: HighestRankInfo;
  flexHighestRank?: HighestRankInfo;
}

interface SummonerTag {
  key: string;

}

export type RegionsType = {
  label: string;
  value: string;
  sgpServerId: string;
};

export type TagType = {
  puuid: string;
  name: string;
  avatar?: string;
  region?: string;
  regionValue?: string;
  sgpServerId?: string;
}

export const useSearchStore = defineStore("search", () => {
  // 搜索相关状态
  const summoner = ref<Summoner>({
    name: "",
    level: 0,
    rank: "",
    region: "",
    profileIconId: 1,
    levelProgress: 0,
    expToNextLevel: 0,
    totalExp: 0,
    soloRank: {
      tier: "UNRANKED",
      division: "",
      leaguePoints: 0,
      wins: 0,
      losses: 0,
    },
    flexRank: {
      tier: "UNRANKED",
      division: "",
      leaguePoints: 0,
      wins: 0,
      losses: 0,
    },
    soloHighestRank: {
      tier: "UNRANKED",
      division: "",
      season: "未知",
    },
    flexHighestRank: {
      tier: "UNRANKED",
      division: "",
      season: "未知",
    },
  });

  const selectedQueue = ref(null);
  const selectedSeason = ref(null);
  const selectedMatchIndex = ref(0);
  const activeTab = ref("players");

  // 对局列表
  const matches = ref<any>([]);

  // 当前选中的对局详情
  const currentMatch = ref({
    blueTeam: [],
    redTeam: [],
  });

  // 对局数据
  const matchData = ref<any>({
    champion: {
      name: "",
      icon: "",
    },
    gameMode: "",
    gameDuration: 0,
    gameEndTimestamp: 0,
    isWin: false,
    kills: 0,
    deaths: 0,
    assists: 0,
    blueTeam: [],
    redTeam: [],
  });

  // 标签相关状态
  const tags = ref<Array<SummonerTag & TagType>>([
    {
      key: "search",
      name: "搜索",
      puuid: "",
    },
  ]);
  const activeTag = ref<string>("search");
  const selectRegionOption = ref<RegionsType>({
    label: "全部",
    value: "all",
    sgpServerId: "all",
  },); // 记录选择的区域

  // 标签相关方法
  const addTag = (summoner: TagType) => {
    // 检查是否已存在该召唤师的标签
    const existingTag = tags.value.find(
      (tag) =>
        tag.puuid === summoner.puuid && tag.key !== "search",
    );

    if (!existingTag) {
      // 添加新标签
      const newTag = {
        key: `summoner-${Date.now()}`,
        puuid: summoner.puuid,
        name: summoner.name,
        avatar: summoner.avatar,
        region: summoner.region,
        regionValue: summoner.regionValue,
        sgpServerId: summoner.sgpServerId,
      };
      tags.value.push(newTag);
      activeTag.value = newTag.key;
    } else {
      // 切换到已存在的标签
      activeTag.value = existingTag.key;
    }
  };

  const removeTag = (key: string) => {
    const index = tags.value.findIndex((tag) => tag.key === key);
    if (index !== -1) {
      tags.value.splice(index, 1);
      // 如果关闭的是当前标签，切换到搜索标签
      if (activeTag.value === key) {
        activeTag.value = "search";
      }
    }
  };

  const removeAllTags = () => {
    // 保留搜索标签，移除其他所有标签
    tags.value = tags.value.filter((tag) => tag.key === "search");
    // 切换到搜索标签
    activeTag.value = "search";
  };

  const setActiveTag = (key: string) => {
    activeTag.value = key;
  };

  // 更新召唤师信息
  const updateSummoner = (data: any) => {
    summoner.value = data;
  };

  // 更新对局列表
  const updateMatches = (data: any[]) => {
    matches.value = data;
  };

  // 更新当前选中的对局
  const updateCurrentMatch = (index: number) => {
    selectedMatchIndex.value = index;
    currentMatch.value = matches.value[index];
    matchData.value = {
      blueTeam: currentMatch.value?.blueTeam || [],
      redTeam: currentMatch.value?.redTeam || [],
    };
  };

  // 更新筛选条件
  const updateFilters = (queue: any, season: any) => {
    selectedQueue.value = queue;
    selectedSeason.value = season;
  };

  // 更新活动标签页
  const updateActiveTab = (tab: string) => {
    activeTab.value = tab;
  };

  const updateSelectRegionOption = (option: RegionsType) => {
    selectRegionOption.value = option;
  }

  // 重置状态
  const resetState = () => {
    summoner.value = {
      name: "",
      level: 0,
      rank: "",
      region: "",
      profileIconId: 1,
      levelProgress: 0,
      expToNextLevel: 0,
      totalExp: 0,
      soloRank: {
        tier: "UNRANKED",
        division: "",
        leaguePoints: 0,
        wins: 0,
        losses: 0,
      },
      flexRank: {
        tier: "UNRANKED",
        division: "",
        leaguePoints: 0,
        wins: 0,
        losses: 0,
      },
      soloHighestRank: {
        tier: "UNRANKED",
        division: "",
        season: "未知",
      },
      flexHighestRank: {
        tier: "UNRANKED",
        division: "",
        season: "未知",
      },
    };
    selectedQueue.value = null;
    selectedSeason.value = null;
    selectedMatchIndex.value = 0;
    activeTab.value = "players";
    matches.value = [];
    currentMatch.value = {
      blueTeam: [],
      redTeam: [],
    };
    matchData.value = {
      champion: {
        name: "",
        icon: "",
      },
      gameMode: "",
      gameDuration: 0,
      gameEndTimestamp: 0,
      isWin: false,
      kills: 0,
      deaths: 0,
      assists: 0,
      blueTeam: [],
      redTeam: [],
    };
  };

  const getActiveTag = () => {
    const activeTagArr = tags.value.filter((tag) => tag.key === activeTag.value)
    return activeTagArr.length > 0 ? activeTagArr[0] : null;
  };

  return {
    // 标签相关
    tags,
    activeTag,
    selectRegionOption,
    addTag,
    removeTag,
    removeAllTags,
    setActiveTag,

    // 状态
    summoner,
    selectedQueue,
    selectedSeason,
    selectedMatchIndex,
    activeTab,
    matches,
    currentMatch,
    matchData,

    // 方法
    updateSummoner,
    updateMatches,
    updateCurrentMatch,
    updateSelectRegionOption,
    updateFilters,
    updateActiveTab,
    resetState,
    getActiveTag
  };
});
