<template>
  <div class="flex flex-col items-center gap-8 py-12">
    <!-- 搜索框 -->
    <div class="w-full max-w-xl">
      <div class="flex gap-2">
        <n-input
          v-model:value="summonerName"
          type="text"
          placeholder="输入召唤师名称"
          class="search-input"
          @keydown.enter="handleSearch"
        >
          <template #prefix>
            <i
              class="i-material-symbols:person-search text-lg text-[var(--text-color-3)]"
            ></i>
          </template>
        </n-input>
        <n-button
          type="primary"
          :loading="isLoading"
          :disabled="!summonerName"
          @click="handleSearch"
        >
          查询
        </n-button>
      </div>
    </div>

    <!-- 最近搜索 -->
    <div class="w-full max-w-4xl">
      <n-card
        class="backdrop-blur-xl bg-[#2D325F]/60 dark:bg-[#1F2245]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#3498DB]/20"
        :bordered="false"
      >
        <template #header>
          <div class="text-[var(--text-color-2)]">最近搜索</div>
        </template>
        <div class="flex flex-wrap gap-4">
          <div
            v-for="search in recentSearches"
            :key="search.name"
            class="flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:bg-[#3498DB]/20"
            @click="quickSearch(search)"
          >
            <div class="w-8 h-8 rounded-full overflow-hidden bg-gray-700">
              <img
                :src="search.avatar || 'https://picsum.photos/32'"
                class="w-full h-full object-cover"
              />
            </div>
            <div class="font-bold">{{ search.name }}</div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";
import { EVENT_TYPE } from "../../../../../manager/plugins/Bridge/eventType";

interface SearchRecord {
  name: string;
  avatar?: string;
}

const router = useRouter();
const message = useMessage();

const summonerName = ref("");
const isLoading = ref(false);

// 最近搜索记录
const recentSearches = ref<SearchRecord[]>([]);

// 获取最近搜索记录
const loadRecentSearches = async () => {};

// 在组件挂载时加载搜索历史
onMounted(() => {
  loadRecentSearches();
});

// 定义 emit
const emit = defineEmits<{
  (e: "search", summoner: { name: string; avatar?: string }): void;
}>();

const handleSearch = async () => {
  if (!summonerName.value) {
    message.warning("请输入召唤师名称");
    return;
  }

  isLoading.value = true;

  try {
    // TODO: 实际的搜索逻辑
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 添加到数据库
    const response = {};

    if (!response.success) {
      console.error("Failed to add search history:", response.msg);
    }

    // 重新加载搜索历史
    await loadRecentSearches();

    // 触发搜索事件
    emit("search", {
      name: summonerName.value,
      avatar: "https://picsum.photos/32", // TODO: 这里应该是实际的召唤师头像
    });
  } catch (error) {
    message.error("搜索失败，请稍后重试");
  } finally {
    isLoading.value = false;
  }
};

const quickSearch = (summoner: SearchRecord) => {
  summonerName.value = summoner.name;
  handleSearch();
};
</script>

<style scoped>
:deep(.n-input) {
  transition: all 0.3s ease;
}

:deep(.n-input:focus) {
  transform: scale(1.01);
}

:deep(.n-card) {
  box-shadow: 0 8px 16px -2px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

:deep(.n-card:hover) {
  box-shadow: 0 12px 20px -2px rgba(0, 0, 0, 0.25);
}
</style>
