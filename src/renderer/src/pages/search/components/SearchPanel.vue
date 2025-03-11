<template>
  <div class="flex flex-col items-center gap-8 py-12">
    <!-- 搜索框 -->
    <div class="w-[90%] relative">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <n-input-group>
            <n-select
              v-model:value="selectedRegion"
              :on-update:value="handleSelectRegion"
              :options="regions"
              :consistent-menu-width="false"
              class="!w-30 region-select"
              size="large"
            />
            <n-input
              v-model:value="summonerName"
              type="text"
              placeholder="id搜索：ppuid、精确搜索：召唤师名称（xxx#123456）、模糊搜索：召唤师名称（xxx），注意：这里不会补全名字，因为官方接口不支持"
              class="search-input flex-1"
              @keydown.enter="handleSearch"
              @focus="handleFocus"
              @blur="handleBlur"
              size="large"
            >
            </n-input>
            <n-button
              type="primary"
              :loading="isLoading"
              :disabled="!summonerName"
              @click="handleSearch"
              size="large"
            >
              查询
            </n-button>
          </n-input-group>

          <!-- 最近搜索下拉框 -->
          <div
            v-show="showRecentSearch && recentSearchHistory.length > 0"
            class="absolute w-full mt-1 bg-[#1A1C3D]/90 dark:bg-[#181A35]/90 rounded-lg shadow-lg backdrop-blur-xl z-50"
          >
            <div class="p-2">
              <div
                class="flex justify-between items-center text-sm text-[var(--text-color-3)] mb-2 px-2"
              >
                <span>最近搜索</span>
                <n-button text type="error" size="tiny" @click.stop="clearAllHistory">
                  清空历史
                </n-button>
              </div>
              <div class="space-y-1 flex items-center flex-wrap">
                <div
                  v-for="searchRecentItem in recentSearchHistory"
                  :key="searchRecentItem.text"
                  class="flex items-center gap-2 p-2 rounded hover:bg-[#3498DB]/20 group"
                >
                  <div
                    class="flex-1 flex items-center gap-2 cursor-pointer"
                    @mousedown="quickSearch(searchRecentItem?.text ?? '')"
                  >
                    <div class="font-medium">
                      {{ searchRecentItem.text }}
                    </div>
                  </div>
                  <n-button
                    text
                    type="error"
                    size="tiny"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @mousedown.stop="deleteHistory(player.name)"
                  >
                    <template #icon>
                      <i class="i-material-symbols:delete-outline text-base"></i>
                    </template>
                  </n-button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果展示 -->
    <div class="w-full max-w-6xl">
      <div class="flex gap-4">
        <!-- 左侧最近搜索列表 -->
        <div class="w-1/2">
          <n-card
            class="backdrop-blur-xl bg-[#2D325F]/60 dark:bg-[#1F2245]/60 transition-all duration-300"
            :bordered="false"
          >
            <template #header>
              <div class="flex items-center justify-between">
                <span class="text-[var(--text-color-2)]">最近搜索玩家</span>
                <n-button text type="error" size="tiny" @click="clearRecentPlayers">
                  清空历史
                </n-button>
              </div>
            </template>
            <n-scrollbar style="max-height: 600px">
              <template v-if="!recentPlayers.length">
                <n-empty description="暂无记录"></n-empty>
              </template>

              <div class="grid grid-cols-2 gap-2" v-else>
                <div
                  v-for="player in recentPlayers"
                  :key="player.puuid"
                  class="relative p-3 rounded-lg hover:bg-[#3498DB]/20 group transition-all duration-300"
                >
                  <div
                    class="flex items-center justify-between cursor-pointer"
                    @click="selectSummoner(player)"
                  >
                    <div class="flex items-center gap-2">
                      <div
                        class="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0"
                      >
                        <LcuImg
                          cus-class="w-10 h-10 object-contain"
                          :src="profileIconUri(Number(player.avatar))"
                        />
                      </div>
                      <div class="min-w-0 flex-1 pr-2">
                        <div
                          class="text-[var(--text-color-2)] truncate text-sm font-medium"
                        >
                          {{ player.summonerName }}
                        </div>
                        <div class="text-xs text-[var(--text-color-3)] truncate">
                          {{ player.region }}
                        </div>
                      </div>
                    </div>
                    <n-button
                      circle
                      text
                      type="error"
                      size="tiny"
                      class="opacity-0 group-hover:opacity-100 transition-opacity"
                      @click.stop="removeRecentPlayer(player.puuid)"
                    >
                      <template #icon>
                        <n-icon>
                          <CloseSharp />
                        </n-icon>
                      </template>
                    </n-button>
                  </div>
                </div>
              </div>
            </n-scrollbar>
          </n-card>
        </div>

        <!-- 右侧搜索结果 -->
        <div class="w-1/2" v-if="searchResults.length">
          <n-card
            class="backdrop-blur-xl bg-[#2D325F]/60 dark:bg-[#1F2245]/60 transition-all duration-300"
            :bordered="false"
          >
            <template #header>
              <div class="text-[var(--text-color-2)]">搜索结果</div>
            </template>
            <n-scrollbar style="max-height: 600px">
              <div class="grid grid-cols-2 gap-2">
                <div
                  v-for="summoner in searchResults"
                  :key="summoner.id"
                  class="relative p-3 rounded-lg hover:bg-[#3498DB]/20 group transition-all duration-300 cursor-pointer"
                  @click="selectSummoner(summoner)"
                >
                  <div class="flex items-center gap-2">
                    <div class="relative w-10 h-10 flex-shrink-0">
                      <LcuImg
                        cus-class="w-10 h-10 object-contain rounded-full"
                        :src="profileIconUri(Number(summoner.avatar))"
                      />
                      <div
                        v-if="summoner.level"
                        class="absolute !left-1/2 -bottom-1 -translate-x-1/2 text-center bg-[#3498DB]/50 rounded-sm text-2 whitespace-nowrap"
                      >
                        {{ summoner.level }}
                      </div>
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="text-sm font-medium truncate">
                        {{ `${summoner.gameName}#${summoner.tagLine}` }}
                      </div>
                      <div class="text-xs text-[var(--text-color-3)] truncate">
                        {{ summoner.region }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </n-scrollbar>
          </n-card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, markRaw } from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { EVENT_TYPE } from "../../../../../manager/plugins/Bridge/eventType";
import { useIpc } from "../../../hooks/useIpc";
import { BRIDGE_EVENT } from "../../../../../manager/plugins/Bridge/bridgeType";
import { useConfig } from "../../../store/config";
import { useLeague } from "../../../store/league";
import { profileIconUri } from "../../../../../manager/utils/utils";
import { CloseSharp } from "@vicons/material";
import { type RegionsType, type TagType, useSearchStore } from '../../../store/searchStore'


// 搜索类型定义
type SearchType = "puuid" | "fuzzy" | "exact" | "invalid";

interface SearchProgress {
  isProcessing: boolean;
  type: SearchType;
  total: number;
  finish: number;
  desc: string;
}

interface SearchResult {
  puuid: string;
  gameName: string;
  tagLine: string;
  profileIconId: number;
  sgpServerId: string;
  privacy: string;
  summonerLevel: number;
  region?: string;
}

interface Summoner {
  id: string;
  puuid: string;
  gameName: string;
  tagLine: string;
  avatar?: string;
  profileIconId: number;
  region: string;
  sgpServerId: string;
  privacy: string;
  level: number;
  name?: string;
}

interface ServerConfig {
  name: string;

  [key: string]: any;
}



interface RecentPlayer {
  puuid: string;
  summonerName: string;
  avatar?: string;
  region?: string;
  regionDetail?: string;
  searchTime: Date;
}

interface SgpSummoner {
  puuid: string;
  profileIconId: number;
  privacy?: string;
  summonerLevel: number;
  regionInfo?: RegionsType;
}


const ipc = useIpc();
const api = useApi();
const configStore = useConfig();
const searchStore = useSearchStore();
const message = useMessage();
const leagueStore = useLeague();

// 58612941-2c0a-5cef-8b9a-e500718ea6e9
// 姑娘丶您还行吗#82723
// e5e50875-46cd-5843-bcdf-361cdbbb0ab3
// 广州泥大王#44449
const summonerName = ref("");
const isLoading = ref(false);
const showRecentSearch = ref(false);


// 最近搜索记录
const recentPlayers = ref<RecentPlayer[]>([]);
const recentSearchHistory = ref<
  {
    text: string;
    searchTime: Date;
  }[]
>([]);

// 搜索相关状态
const searchType = ref<SearchType>("invalid");
const searchProgress = ref<SearchProgress>({
  isProcessing: false,
  type: "invalid",
  total: 0,
  finish: 0,
  desc: "", // 一些描述信息
});
const isEmpty = ref(false);
const searchResults = ref<Summoner[]>([]);

const regions = computed<RegionsType[]>(() => {
  const result = [
    {
      label: "全部",
      value: "all",
      sgpServerId: "all",
    },
  ];
  Object.entries(
    (configStore.configInfo?.servers as Record<string, ServerConfig>) || {}
  )?.forEach(([key, value]) => {
    if (key.startsWith("TENCENT_"))
      result.push({
        label: value.name,
        value: key.split("_")[1],
        sgpServerId: key,
      });
  });
  return result;
});

const selectedRegion = ref(regions.value[0].value);
function handleSelectRegion(region,option) {
  searchStore.updateSelectRegionOption(option)
  selectedRegion.value = region;
}

// 处理输入框失焦
const handleBlur = () => {
  console.log("blur event triggered");
  // 使用 setTimeout 来确保点击事件能够先触发
  setTimeout(() => {
    console.log("setting showRecentSearch to false");
    showRecentSearch.value = false;
  }, 200);
};

const handleFocus = () => {
  showRecentSearch.value = true;
};

const loadRecentPlayers = async () => {
  try {
    const response = await ipc.call(EVENT_TYPE.DB_GET_RECENT_SEARCHES);
    if (response.success) {
      recentPlayers.value = response.data;
    }
  } catch (error) {
    console.error("加载最近玩家记录失败:", error);
    message.error("加载玩家历史失败");
  }
};

// 获取最近搜索记录
const loadRecentSearchPlayers = async () => {
  try {
    const response = await ipc.call(EVENT_TYPE.DB_GET_SEARCH_HISTORY);
    console.log("获取最近历史搜索记录：", response);
    if (response.success) {
      recentSearchHistory.value = response.data;
    }
  } catch (error) {
    console.error("加载最近玩家记录失败:", error);
    message.error("加载玩家历史失败");
  }
};

// 在组件挂载时加载搜索历史
onMounted(() => {
  loadRecentSearchPlayers();
  loadRecentPlayers();
});

// 定义 emit
const emit = defineEmits<{
  (e: "search", summoner: TagType): void;
}>();

// 处理错误的工具函数
const handleError = (error: any, callback?: () => void) => {
  console.error("搜索出错:", error);
  message.error(error.message || "搜索失败，请稍后重试");
  if (callback) callback();
};

// 替换不可见字符
const replaceInvisibleChar = (text: string) => {
  return text.replace(
    /[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF\u2060-\u2069\u202A-\u202E\uFFF9-\uFFFB]/g,
    ""
  );
};

// 判断搜索类型
const determineSearchType = (input: string): SearchType => {
  if (!input) return "invalid";

  if (
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      input
    )
  ) {
    return "puuid";
  }

  // Riot ID 格式 (gameName#tagLine)
  if (/^(?!\s+$)[^#]+(?:#[^#]+)?$/.test(input) && input.includes("#")) {
    return "exact";
  }

  // 其他情况作为模糊搜索
  return "fuzzy";
};

/**
 * 精确搜索跨区查找
 * @param alias 包含游戏名称和标签和puuid的对象
 * @param selectedRegion 选择的大区
 */
async function getAllRegionsSummonersFromGameName(
  alias,
  selectedRegion: string
): Promise<SearchResult[]> {
  if (selectedRegion === "all") {
    // 全部大区搜索
    const summonerArr = await Promise.all(
      regions.value
        .filter((r) => r.value !== "all")
        .map(async (r) => {
          try {
            const res = await api.sgpApi.getSummonerByPuuid(r.value, alias.puuid);
            if (res.data.length) {
              return {
                ...res.data[0],
                regionInfo: r,
              };
            }
          } catch (e) {
            // console.error(`搜索大区 ${r.label} 失败:`, e);
          }
          return null;
        })
    );
    searchProgress.value.desc = `跨区查找共找到用户${summonerArr.length}个用户`;
    return summonerArr
      .filter(
        (summoner): summoner is SgpSummoner & { regionInfo: RegionsType } =>
          summoner !== null && summoner.regionInfo !== undefined
      )
      .map((summoner) => ({
        puuid: summoner.puuid,
        gameName: alias.gameName,
        tagLine: alias.tagLine,
        profileIconId: summoner.profileIconId,
        sgpServerId: summoner.regionInfo.sgpServerId,
        privacy: summoner.privacy || "",
        summonerLevel: summoner.summonerLevel,
        region: summoner.regionInfo.label,
      }));
  } else {
    // 指定大区搜索
    const res = await api.sgpApi.getSummonerByPuuid(selectedRegion, alias.puuid);
    if (res.data.length) {
      const summoner = res.data[0];
      return [
        {
          puuid: summoner.puuid,
          gameName: summoner.name,
          tagLine: alias.tagLine,
          profileIconId: summoner.profileIconId,
          sgpServerId:
            regions.value.find((r) => r.value === selectedRegion)?.sgpServerId || "",
          privacy: summoner.privacy || "",
          summonerLevel: summoner?.summonerLevel,
          region: regions.value.find((r) => r.value === selectedRegion)?.label || "未知",
        },
      ];
    }
  }
  return [];
}

/**
 * 模糊搜索跨区查找
 * @param searchText 搜索文本
 * @param selectedRegion 选择的大区
 */
async function getAllRegionsSummonersFromFuzzyName(
  aliases: any[],
  selectedRegion: string
): Promise<SearchResult[]> {
  if (selectedRegion === "all") {
    const promiseArr = [];
    const regionArr = regions.value.filter((r) => r.value !== "all");
    for (const alias of aliases) {
      const fnArr = regionArr.map(async (r) => {
        try {
          const res = (await api.sgpApi.getSummonerByPuuid(r.value, alias.puuid)) as any;
          if (res.data.length) {
            return res.data.map((summoner) => ({
              ...summoner,
              regionInfo: r,
            }));
          } else return [];
        } catch (e) {
          // console.error(`搜索大区 ${r.label} 失败:`, e);
          return [];
        }
        return null;
      });
      fnArr.length && promiseArr.push(...(fnArr as any));
    }
    const summonerArr = (await Promise.all(promiseArr)).filter((r) => r).flat();
    return summonerArr.map((summoner: any, index) => {
      return {
        puuid: summoner.puuid,
        gameName: aliases[index].alias.game_name,
        tagLine: aliases[index].alias.tag_line,
        profileIconId: summoner.profileIconId,
        sgpServerId: summoner.regionInfo.sgpServerId,
        privacy: summoner.privacy || "",
        summonerLevel: summoner.summonerLevel,
        region: summoner.regionInfo.label,
      };
    });
  } else {
    const promiseArr = aliases.map(async (alias) => {
      try {
        const res = await api.sgpApi.getSummonerByPuuid(
          selectedRegion,
          alias.puuid
        )
        if (res.data.length) {
          return res.data.map((summoner) => ({
            ...summoner,
            regionInfo: regions.value.filter((item) => item.value === selectedRegion)[0],
          }));
        } else return [];
      } catch (e) {
        return [];
      }
    });
    const summonerArr = (await Promise.all(promiseArr))
      .map((summonerArr, index) => {
        if (!summonerArr.length) return null;
        return {
          ...summonerArr[0],
          gameName: aliases[index].alias.game_name,
          tagLine: aliases[index].alias.tag_line,
        };
      })
      .filter((r) => r);
    return summonerArr.map((summoner, index) => {
      return {
        puuid: summoner.puuid,
        gameName: summoner.gameName,
        tagLine: summoner.tagLine,
        profileIconId: summoner.profileIconId,
        sgpServerId: summoner.regionInfo.sgpServerId,
        privacy: summoner.privacy || "",
        summonerLevel: summoner.summonerLevel,
        region: summoner.regionInfo.label,
      };
    });
  }
  return [];
}

const handleSearch = async () => {
  try {
    if (!summonerName.value) {
      message.warning("请输入召唤师名称");
      return;
    }

    // 确定搜索类型
    searchType.value = determineSearchType(summonerName.value);

    if (searchType.value === "invalid") {
      message.warning("无效的搜索内容");
      return;
    }

    if (searchProgress.value.isProcessing) {
      return;
    }

    // 重置搜索状态
    searchProgress.value.total = 0;
    searchProgress.value.finish = 0;
    searchProgress.value.desc = ``;
    isEmpty.value = false;
    searchResults.value = [];
    isLoading.value = true;

    const searchText =
      searchType.value === "puuid"
        ? summonerName.value.trim()
        : replaceInvisibleChar(summonerName.value);

    ipc.call(EVENT_TYPE.DB_ADD_SEARCH_HISTORY, {
      text: searchText,
    });

    // 判断是否同区
    const isSameRegion =
      selectedRegion.value === "all"
        ? false
        : `${leagueStore.leagueInfo?.region}_${leagueStore.leagueInfo?.rsoPlatformId}` ===
          `${leagueStore.leagueInfo?.region}_${selectedRegion.value}`;
    console.log("是否同区：", isSameRegion);
    console.log("搜索类型：", searchType.value);
    let results: SearchResult[] = [];

    try {
      switch (searchType.value) {
        case "puuid": {
          // 处理PUUID搜索
          if (isSameRegion) {
            // 同区使用LCU API
            const res = await api.lcuApi.summoner.getSummonerByPuuid(
              searchText
            );
            const summoner = res.data
            console.log("LCU API 搜索结果：", summoner);
            if (summoner) {
              results = [
                {
                  puuid: summoner?.puuid,
                  gameName: summoner?.gameName,
                  tagLine: summoner?.tagLine,
                  profileIconId: summoner?.profileIconId,
                  sgpServerId: selectedRegion.value,
                  privacy: summoner?.privacy || "",
                  summonerLevel: summoner?.summonerLevel,
                  region:
                    regions.value.find((r) => r.value === selectedRegion.value)?.label ||
                    "未知",
                },
              ];
            }
          } else {
            // 跨区搜索
            if (selectedRegion.value === "all") {
              // 全部大区搜索
              const summonerArr = await getAllRegionsSummonersFromPuuid(searchText);
              results = summonerArr.map((summoner) => ({
                puuid: summoner.puuid,
                gameName: summoner.gameName,
                tagLine: summoner.tagLine,
                profileIconId: summoner.profileIconId,
                sgpServerId: summoner.regionInfo.sgpServerId,
                privacy: summoner.privacy || "",
                summonerLevel: summoner.summonerLevel,
                region: summoner.regionInfo.label,
              }));
            } else {
              // 指定大区搜索
              const sgpRes = await api.sgpApi.getSummonerByPuuid(
                selectedRegion.value,
                searchText
              );
              console.log("指定大区搜索结果：", sgpRes);
              if (sgpRes.data.length) {
                const summoner = sgpRes.data[0];
                const nameSetRes = await api.riotApi.playerAccount.getPlayerAccountNameset(
                  [summoner.puuid]
                );
                console.log("获取召唤师名称结果：", nameSetRes);
                if (nameSetRes.data.namesets?.[0]?.gnt) {
                  const { gameName, tagLine } = nameSetRes.data.namesets[0].gnt;
                  results = [
                    {
                      puuid: summoner.puuid,
                      gameName,
                      tagLine,
                      profileIconId: summoner.profileIconId,
                      sgpServerId:
                        regions.value.find((r) => r.value === selectedRegion.value)
                          ?.sgpServerId || "",
                      privacy: summoner.privacy || "",
                      summonerLevel: summoner.summonerLevel,
                      region:
                        regions.value.find((r) => r.value === selectedRegion.value)
                          ?.label || "未知",
                    },
                  ];
                }
              }
            }
          }
          break;
        }

        case "exact": {
          // 处理精确搜索 (Riot ID格式)
          const [gameName, tagLine] = searchText.split("#");
          const aliases = await api.riotApi.playerAccount.getPlayerAccountAlias(
            gameName,
            tagLine
          );
          console.log("查看aliases", aliases.data);
          if (!aliases.data.length) {
            isEmpty.value = true;
            return;
          }
          const alias = aliases.data[0];
          console.log("查看：", alias);
          if (isSameRegion) {
            // 同区使用LCU API
            const res = await api.lcuApi.summoner.getSummonerByPuuid(alias.puuid);
            const summoner = res.data;
            if (summoner) {
              results = [
                {
                  puuid: summoner.puuid,
                  gameName: summoner.gameName,
                  tagLine: summoner.tagLine,
                  profileIconId: summoner.profileIconId,
                  sgpServerId: selectedRegion.value,
                  privacy: summoner.privacy || "",
                  summonerLevel: summoner.summonerLevel,
                  region:
                    regions.value.find((r) => r.value === selectedRegion.value)?.label ||
                    "未知",
                },
              ];
            }
          } else {
            // 跨区搜索
            results = await getAllRegionsSummonersFromGameName(
              {
                gameName: alias.alias.game_name,
                tagLine: alias.alias.tag_line,
                puuid: alias.puuid,
              },
              selectedRegion.value
            );
          }
          break;
        }

        case "fuzzy":
          {
            // 处理模糊搜索
            const aliases = await api.riotApi.playerAccount.getPlayerAccountAlias(
              searchText
            )
            let findSummonerCount = aliases.data.length;
            let validSummonerCount = 0;
            console.log("查看aliases", aliases.data);
            if (isSameRegion) {
              for (const alias of aliases.data) {
                // 同区使用LCU API
                const res = await api.lcuApi.summoner.getSummonerByPuuid(
                  alias.puuid
                );
                const summoner = res.data
                ++validSummonerCount;
                console.log("LCU API 搜索结果：", summoner);
                if (summoner) {
                  results = [
                    {
                      puuid: summoner.puuid,
                      gameName: summoner.gameName,
                      tagLine: summoner.tagLine,
                      profileIconId: summoner.profileIconId,
                      sgpServerId: selectedRegion.value,
                      privacy: summoner.privacy || "",
                      summonerLevel: summoner.summonerLevel,
                      region:
                        regions.value.find((r) => r.value === selectedRegion.value)
                          ?.label || "未知",
                    },
                  ];
                }
              }
              searchProgress.value.desc = `共找到${findSummonerCount}个用户，其中有效用户共${validSummonerCount}个`;

              if (!validSummonerCount) {
                message.info("未找到符合条件的召唤师");
                return;
              }
            } else {
              results = await getAllRegionsSummonersFromFuzzyName(
                aliases.data,
                selectedRegion.value
              );
            }
          }

          break;
      }

      console.log("搜索显示结果：", results);

      if (results.length === 0) {
        isEmpty.value = true;
        message.info("未找到符合条件的召唤师");
        return;
      }

      // 更新搜索结果
      searchResults.value = results.map((summoner: SearchResult) =>
        markRaw({
          id: summoner.puuid,
          puuid: summoner.puuid,
          gameName: summoner.gameName,
          tagLine: summoner.tagLine,
          // avatar: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.profileIconId}.jpg`,
          avatar: summoner.profileIconId,
          profileIconId: summoner.profileIconId,
          region: summoner.region || "未知",
          sgpServerId: summoner.sgpServerId,
          privacy: summoner.privacy,
          level: summoner.summonerLevel,
          name: summoner.gameName,
        })
      );
    } catch (error) {
      message.info("未找到符合条件的召唤师");
      isEmpty.value = true;
    }
  } finally {
    searchProgress.value.isProcessing = false;
    isLoading.value = false;
  }
};

/**
 * puuid 跨大区查找
 * @param searchText puuid
 */
async function getAllRegionsSummonersFromPuuid(searchText: string) {
  const promiseArr: any[] = [];
  const regionsItems: RegionsType[] = [];
  regions.value.forEach((item) => {
    if (item.value !== "all") {
      regionsItems.push(item as RegionsType);
      promiseArr.push(api.sgpApi.getSummonerByPuuid(item.value, searchText));
    }
  });
  let findSummonerCount = 0;
  const summonerArr = (await Promise.allSettled(promiseArr))
    .map((item, index) => {
      findSummonerCount++;
      if (item.status === "fulfilled" && item.value.data.length) {
        item.value.data[0]["regionInfo"] = regionsItems[index];
        return item.value.data[0];
      }
    })
    .filter((item) => item);
  const promiseSummonerNames = summonerArr.map((item) => {
    return api.riotApi.playerAccount.getPlayerAccountNameset([item!.puuid]);
  });
  const nameSetItemResArr = await Promise.allSettled(promiseSummonerNames);
  nameSetItemResArr.forEach((nameSetItemRes) => {
    if (nameSetItemRes.status === "fulfilled") {
      const { namesets } = nameSetItemRes.value.data;
      namesets.forEach((nameSetItem, index) => {
        if (nameSetItem.error) return;
        const { gnt } = nameSetItem;
        summonerArr[index]["gameName"] = gnt.gameName;
        summonerArr[index]["tagLine"] = gnt.tagLine;
        summonerArr[index]["summonerName"] = `${gnt.gameName}#${gnt.tagLine}`;
      });
    }
  });
  console.log("sgp查看搜索结果：", summonerArr);
  searchProgress.value.desc = `跨区查找共找到用户${findSummonerCount}个，有效用户${summonerArr.length}个`;
  return summonerArr;
}

const quickSearch = (text: string) => {
  summonerName.value = text;
  handleSearch();
};

const selectSummoner = async (summoner: Summoner | RecentPlayer) => {
  try {
    console.log("查看召唤师信息：", summoner);
    // 添加到最近搜索
    await ipc.call(EVENT_TYPE.DB_ADD_RECENT_SEARCH, {
      puuid: summoner.puuid,
      summonerName: summoner?.summonerName ? summoner.summonerName : `${summoner.gameName}#${summoner.tagLine}`,
      avatar: summoner.avatar,
      region: summoner.region,
      regionDetail: summoner?.regionDetail ? summoner.regionDetail : summoner.sgpServerId,
    });

    // 触发搜索事件
    emit("search", {
      puuid: summoner.puuid,
      name: summoner?.summonerName ? summoner.summonerName : `${summoner.gameName}#${summoner.tagLine}`,
      avatar: summoner.avatar,
      region: summoner.region,
      regionValue: summoner.sgpServerId ? summoner.sgpServerId.split('_')[1] : summoner.regionDetail.split('_')[1],
      sgpServerId: summoner.sgpServerId ? summoner.sgpServerId : summoner.regionDetail,
    });
    // 刷新最近搜索列表
    await loadRecentSearchPlayers();
    await loadRecentPlayers();
  } catch (error) {
    console.error("添加最近玩家记录失败:", error);
  }
};

const deleteHistory = async (summonerName: string) => {
  try {
    // 调用后端删除单条历史记录
    await ipc.call(EVENT_TYPE.DB_REMOVE_RECENT_SEARCH, summonerName);
    // 更新本地数据
    recentPlayers.value = recentPlayers.value.filter(
      (item) => item.summonerName !== summonerName
    );
    message.success("删除成功");
  } catch (error) {
    message.error("删除失败");
    console.error("删除搜索历史失败:", error);
  }
};

const clearAllHistory = async () => {
  try {
    // 调用后端清空所有历史记录
    await ipc.call(EVENT_TYPE.DB_CLEAR_RECENT_SEARCHES);
    // 清空本地数据
    recentPlayers.value = [];
    message.success("清空成功");
  } catch (error) {
    message.error("清空失败");
    console.error("清空搜索历史失败:", error);
  }
};

// 删除单条最近搜索记录
const removeRecentPlayer = async (puuid: string) => {
  try {
    const response = await ipc.call(EVENT_TYPE.DB_REMOVE_RECENT_SEARCH, { puuid });
    if (response.success) {
      recentPlayers.value = recentPlayers.value.filter((item) => item.puuid !== puuid);
      message.success("删除成功");
    }
  } catch (error) {
    console.error("删除最近玩家记录失败:", error);
    message.error("删除失败");
  }
};

// 清空所有最近搜索记录
const clearRecentPlayers = async () => {
  try {
    const response = await ipc.call(EVENT_TYPE.DB_CLEAR_RECENT_SEARCHES);
    if (response.success) {
      recentPlayers.value = [];
      message.success("清空成功");
    }
  } catch (error) {
    console.error("清空最近玩家记录失败:", error);
    message.error("清空失败");
  }
};
</script>

<style scoped>
:deep(.n-input) {
  transition: all 0.3s ease;
}

:deep(.n-input:focus) {
  transform: scale(1.01);
}

:deep(.n-input .n-input__prefix) {
  margin-left: -12px !important;
}

:deep(.n-card) {
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:deep(.n-card:hover) {
  box-shadow: 0 12px 20px -2px rgba(0, 0, 0, 0.25);
}

/* 下拉框样式 */
.relative {
  position: relative;
}

.absolute {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 1000;
}

/* 添加下拉框动画 */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.absolute {
  animation: slideDown 0.2s ease-out;
}

/* 大区选择框样式 */
:deep(.region-select) {
  --n-border: none !important;
  --n-border-hover: none !important;
  --n-border-focus: none !important;
  --n-border-active: none !important;
  --n-color: transparent !important;
  --n-color-active: transparent !important;
  --n-box-shadow-focus: none !important;
  --n-padding-single: 0 4px !important;
  --n-option-height: 34px !important;
}

/* 搜索框 placeholder 样式 */
:deep(.search-input .n-input__placeholder) {
  font-size: 12px !important;
}

:deep(.region-select .n-base-selection) {
  background-color: transparent !important;
}

:deep(.region-select .n-base-selection:hover) {
  background-color: transparent !important;
}

:deep(.region-select .n-base-selection-label) {
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.region-select .n-base-selection-placeholder) {
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
}

:deep(.region-select .n-base-selection-tags) {
  padding: 0 !important;
  align-items: center !important;
}

:deep(.region-select .n-base-selection__border) {
  display: none !important;
}

:deep(.region-select .n-base-selection__state-border) {
  display: none !important;
}

:deep(.region-select .n-base-selection-input) {
  display: flex !important;
  align-items: center !important;
}

/* 下拉菜单样式 */
:deep(.region-select .n-base-select-option) {
  background-color: var(--n-option-color) !important;
}

:deep(.region-select .n-base-select-option:hover) {
  background-color: var(--n-option-color-hover) !important;
}

:deep(.region-select .n-base-select-option.n-base-select-option--selected) {
  background-color: var(--n-option-color-active) !important;
  color: var(--n-option-text-color-active) !important;
}

:deep(.region-select .n-base-select-menu) {
  background-color: #1f2245 !important;
  border: 1px solid #2d325f !important;
  backdrop-filter: blur(8px) !important;
}
</style>
