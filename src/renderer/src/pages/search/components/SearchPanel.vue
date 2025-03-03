<template>
  <div class="flex flex-col items-center gap-8 py-12">
    <!-- 搜索框 -->
    <div class="w-full max-w-xl relative">
      <div class="flex gap-2">
        <div class="relative flex-1">
          <n-input-group>
            <n-select
              v-model:value="selectedRegion"
              :options="regions"
              :consistent-menu-width="false"
              class="w-30 region-select"
              size="large"
            />
            <n-input
              v-model:value="summonerName"
              type="text"
              placeholder="输入召唤师名称"
              class="search-input"
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
            v-show="showRecentSearch && recentSearches.length > 0"
            class="absolute w-full mt-1 bg-[#2D325F]/90 dark:bg-[#1F2245]/90 rounded-lg shadow-lg backdrop-blur-xl z-50"
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
              <div class="space-y-1">
                <div
                  v-for="search in recentSearches"
                  :key="search.name"
                  class="flex items-center gap-2 p-2 rounded hover:bg-[#3498DB]/20 group"
                >
                  <div
                    class="flex-1 flex items-center gap-2 cursor-pointer"
                    @mousedown="quickSearch(search)"
                  >
                    <div class="w-6 h-6 rounded-full overflow-hidden bg-gray-700">
                      <img
                        :src="search.avatar || 'https://picsum.photos/32'"
                        class="w-full h-full object-cover"
                      />
                    </div>
                    <div class="font-medium">{{ search.name }}</div>
                  </div>
                  <n-button
                    text
                    type="error"
                    size="tiny"
                    class="opacity-0 group-hover:opacity-100 transition-opacity"
                    @mousedown.stop="deleteHistory(search.name)"
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
    <div class="w-full max-w-6xl" v-if="searchResults.length > 0">
      <n-card
        class="backdrop-blur-xl bg-[#2D325F]/60 dark:bg-[#1F2245]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#3498DB]/20"
        :bordered="false"
      >
        <template #header>
          <div class="text-[var(--text-color-2)]">搜索结果</div>
        </template>
        <div class="flex flex-wrap gap-4 justify-start">
          <div
            v-for="summoner in searchResults"
            :key="summoner.id"
            class="w-fit flex-shrink-0 w-72 bg-[#1F2245]/40 rounded-lg p-4 cursor-pointer transition-all hover:bg-[#3498DB]/20 hover:transform hover:scale-105"
            @click="selectSummoner(summoner)"
          >
            <div class="flex items-start gap-4">
              <!-- 左侧：头像和等级 -->
              <div class="flex flex-col items-center gap-2">
                <div class="relative w-10 h-10">
                  <img
                    :src="summoner.avatar || 'https://picsum.photos/80'"
                    class="w-full h-full object-cover rounded-full"
                  />
                  <div
                    class="absolute !left-1/2 -bottom-1.5 -translate-x-1/2 px-1 w-fit bg-[#3498DB]/50 rounded-full text-2 whitespace-nowrap"
                  >
                    LV: {{ summoner.level }}
                  </div>
                </div>
              </div>

              <!-- 右侧：名称和区服 -->
              <div class="flex flex-col justify-center flex-1">
                <div class="font-bold text-lg line-clamp-1">{{ summoner.name }}</div>
                <div class="text-sm text-[var(--text-color-3)]">
                  {{ summoner.region }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </n-card>
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
import { useConfig } from '../../../store/config'
import { proxyToObject } from '../../../utils/utils'

interface SearchRecord {
  name: string;
  gameName?: string;
  tagLine?: string;
  avatar?: string;
  region?: string;
}

// 搜索类型定义
type SearchType = "puuid" | "fuzzy" | "exact" | "invalid";

interface SearchProgress {
  isProcessing: boolean;
  type: SearchType;
  total: number;
  finish: number;
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

const ipc = useIpc();
const api = useApi();
const configStore = useConfig()
const message = useMessage();

const summonerName = ref("");
const isLoading = ref(false);
const showRecentSearch = ref(false);

// 最近搜索记录
const recentSearches = ref<SearchRecord[]>([]);

// 搜索相关状态
const searchType = ref<SearchType>("invalid");
const searchProgress = ref<SearchProgress>({
  isProcessing: false,
  type: "invalid",
  total: 0,
  finish: 0,
});
const isEmpty = ref(false);
const searchResults = ref<Summoner[]>([]);

// todo：大区选项
const regions = computed(() => {
  const result = [{
    label: "全部",
    value: "all",
  }]
  Object.entries(configStore.configInfo?.servers)?.forEach(([key, value]) => {
    if(key.startsWith('TENCENT_'))
      result.push({
        label: value.name,
        value: key,
      })
  })
  return result
})

const selectedRegion = ref(regions.value[0].value);

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
  console.log("focus event triggered");
  console.log("recent searches:", recentSearches.value);
  showRecentSearch.value = true;
};

// 获取最近搜索记录
const loadRecentSearches = async () => {
  try {
    // 从数据库加载最近搜索记录
    const response = await ipc.call(EVENT_TYPE.DB_GET_RECENT_SEARCHES);
    console.log("从数据库加载最近搜索记录:", response);
    const records = response.data || [];
    // recentSearches.value = records.map((record: any) => ({
    //   name: record.summonerName,
    //   avatar: record.avatar,
    //   region: record.region,
    // }));
    recentSearches.value = [
      {
        name: "测试召唤师1",
        avatar: "https://picsum.photos/32",
      },
      {
        name: "测试召唤师2",
        avatar: "https://picsum.photos/32",
      },
      {
        name: "测试召唤师3",
        avatar: "https://picsum.photos/32",
      },
    ]
  } catch (error) {
    console.error("加载最近搜索记录失败:", error);
    message.error("加载搜索历史失败");
  }
};

// 在组件挂载时加载搜索历史
onMounted(() => {
  loadRecentSearches();
});

// 定义 emit
const emit = defineEmits<{
  (e: "search", summoner: { name: string; avatar?: string; region: string }): void;
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
  if (/^(?!\s+$)[^#]+(?:#[^#]+)?$/.test(input)) {
    return "exact";
  }

  // 其他情况作为模糊搜索
  return "fuzzy";
};

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
    isEmpty.value = false;
    searchResults.value = [];
    isLoading.value = true;

    let res;
    const searchText =
      searchType.value === "puuid"
        ? summonerName.value.trim()
        : replaceInvisibleChar(summonerName.value);
    switch (searchType.value) {
      case "puuid":
        // 处理PUUID搜索
        try {
          // res = api.sgpApi.getSummonerByPuuid()
        } catch (e) {}

        break;
      case "exact":
        // 处理精确搜索
        break;
      default:
        // 处理模糊搜索
        break;
    }

    // todo: 搜索
    const response = await ipc.call(EVENT_TYPE.SET_DETAILS, {
      type: "search-summoner",
      searchType: searchType.value,
      searchText:
        searchType.value === "puuid"
          ? summonerName.value.trim()
          : replaceInvisibleChar(summonerName.value),
      isCrossRegion: false, // TODO: 添加跨区选择UI
    });

    if (!response.success) {
      throw new Error(response.msg || "搜索失败");
    }

    // 确保 response.data 是数组
    const results = Array.isArray(response.data) ? (response.data as SearchResult[]) : [];

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
        avatar: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${summoner.profileIconId}.jpg`,
        profileIconId: summoner.profileIconId,
        region: summoner.region || "未知",
        sgpServerId: summoner.sgpServerId,
        privacy: summoner.privacy,
        level: summoner.summonerLevel,
        name: summoner.gameName,
      })
    );

    // 添加到搜索历史
    if (searchResults.value.length > 0) {
      const firstResult = searchResults.value[0];
      await ipc.call(EVENT_TYPE.DB_ADD_SEARCH_HISTORY, {
        summonerName: `${firstResult.gameName}#${firstResult.tagLine}`,
        avatar: firstResult.avatar,
        region: firstResult.region,
      });

      // 刷新搜索历史
      await loadRecentSearches();
    }
  } catch (error: any) {
    handleError(error, () => {
      isEmpty.value = true;
    });
  } finally {
    searchProgress.value.isProcessing = false;
    isLoading.value = false;
  }
};

const quickSearch = (summoner: SearchRecord) => {
  summonerName.value =
    summoner.gameName && summoner.tagLine
      ? `${summoner.gameName}#${summoner.tagLine}`
      : summoner.name;
  handleSearch();
};

const selectSummoner = (summoner: Summoner) => {
  emit("search", {
    name: `${summoner.gameName}#${summoner.tagLine}`,
    avatar: summoner.avatar,
    region: summoner.region,
  });
};

const deleteHistory = async (summonerName: string) => {
  try {
    // 调用后端删除单条历史记录
    await ipc.call(EVENT_TYPE.DB_DELETE_SEARCH_HISTORY, summonerName);
    // 更新本地数据
    recentSearches.value = recentSearches.value.filter(
      (item) => item.name !== summonerName
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
    await ipc.call(EVENT_TYPE.DB_CLEAR_ALL_HISTORY);
    // 清空本地数据
    recentSearches.value = [];
    message.success("清空成功");
  } catch (error) {
    message.error("清空失败");
    console.error("清空搜索历史失败:", error);
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
