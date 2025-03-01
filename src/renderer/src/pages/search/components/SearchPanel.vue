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

    <!-- 最近搜索和热门召唤师 -->
    <div class="w-full max-w-4xl grid grid-cols-2 gap-8">
      <!-- 最近搜索 -->
      <n-card
        class="backdrop-blur-xl bg-[#2D325F]/60 dark:bg-[#1F2245]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#3498DB]/20"
        :bordered="false"
      >
        <template #header>
          <div class="text-[var(--text-color-2)]">最近搜索</div>
        </template>
        <div class="flex flex-wrap gap-2">
          <n-tag
            v-for="search in recentSearches"
            :key="search.name"
            class="cursor-pointer transition-colors hover:bg-primary hover:text-white"
            @click="quickSearch(search)"
          >
            {{ search.name }}
          </n-tag>
        </div>
      </n-card>

      <!-- 热门召唤师 -->
      <n-card
        class="backdrop-blur-xl bg-[#2D325F]/60 dark:bg-[#1F2245]/60 transition-all duration-300 hover:shadow-lg hover:shadow-[#3498DB]/20"
        :bordered="false"
      >
        <template #header>
          <div class="text-[var(--text-color-2)]">热门召唤师</div>
        </template>
        <div class="grid grid-cols-2 gap-2">
          <div
            v-for="summoner in hotSummoners"
            :key="summoner.name"
            class="flex items-center gap-2 p-2 rounded cursor-pointer transition-all hover:bg-[#3498DB]/20"
            @click="quickSearch(summoner)"
          >
            <div class="w-8 h-8 rounded-full overflow-hidden">
              <img :src="summoner.avatar" class="w-full h-full object-cover" />
            </div>
            <div class="font-bold">{{ summoner.name }}</div>
          </div>
        </div>
      </n-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useMessage } from "naive-ui";

interface SearchRecord {
  name: string;
}

interface HotSummoner extends SearchRecord {
  avatar: string;
}

const router = useRouter();
const message = useMessage();

const summonerName = ref("");
const isLoading = ref(false);

// 最近搜索记录
const recentSearches = ref<SearchRecord[]>([
  { name: "Faker" },
  { name: "Uzi" },
  { name: "Doinb" },
]);

// 热门召唤师
const hotSummoners = ref<HotSummoner[]>([
  {
    name: "TheShy",
    avatar: "https://picsum.photos/32",
  },
  {
    name: "Rookie",
    avatar: "https://picsum.photos/32",
  },
  {
    name: "JackeyLove",
    avatar: "https://picsum.photos/32",
  },
  {
    name: "Knight",
    avatar: "https://picsum.photos/32",
  },
]);

// 定义 emit
const emit = defineEmits<{
  (e: 'search', summoner: { name: string; avatar?: string }): void
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

    // 添加到最近搜索
    const newSearch = {
      name: summonerName.value,
    };

    if (!recentSearches.value.find((s) => s.name === newSearch.name)) {
      recentSearches.value.unshift(newSearch);
      if (recentSearches.value.length > 5) {
        recentSearches.value.pop();
      }
    }

    // 触发搜索事件
    emit('search', {
      name: summonerName.value,
      // TODO: 这里应该是实际的召唤师头像
      avatar: 'https://picsum.photos/32'
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
