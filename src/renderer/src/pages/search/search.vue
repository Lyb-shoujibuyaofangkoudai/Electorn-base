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
        <!-- 动态标签栏 -->
        <div class="mb-4 flex flex-wrap gap-2 p-2">
          <n-tag
            v-for="tag in tags"
            :key="tag.key"
            :style="{
              cursor: 'pointer',
              backgroundColor: getTagColor(
                tag.key === 'search' ? -1 : tags.indexOf(tag) - 1,
                activeTag === tag.key
              ).bgColor,
              color: getTagColor(
                tag.key === 'search' ? -1 : tags.indexOf(tag) - 1,
                activeTag === tag.key
              ).textColor,
              borderColor: getTagColor(
                tag.key === 'search' ? -1 : tags.indexOf(tag) - 1,
                activeTag === tag.key
              ).borderColor,
            }"
            type="default"
            :bordered="true"
            round
            :closable="tag.key !== 'search'"
            @close="handleTagClose(tag.key)"
            @click="handleTagClick(tag)"
          >
            <div
              class="flex items-center gap-1 justify-center max-w-24 min-w-16 overflow-hidden"
            >
              <n-icon v-if="tag.key === 'search'" class="flex-shrink-0">
                <SearchOutlined />
              </n-icon>
              <img
                v-else
                :src="tag.avatar || 'https://picsum.photos/32'"
                class="w-4 h-4 rounded-full flex-shrink-0"
              />
              <span class="truncate">{{ tag.name }}</span>
            </div>
          </n-tag>
        </div>

        <!-- 内容区域 -->
        <div v-if="activeTag === 'search'">
          <SearchPanel @search="handleSearch" />
        </div>
        <div v-else class="py-12">
          <n-empty description="召唤师战绩页面开发中..." />
        </div>
      </n-card>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { ref, h } from "vue";
import { NEmpty, NTag } from "naive-ui";
import SearchPanel from "./components/SearchPanel.vue";
import { SearchOutlined } from "@vicons/material";

interface SummonerTag {
  key: string;
  name: string;
  avatar?: string;
  region?: string;
}

// 活动标签
const activeTag = ref<string>("search");

// 标签列表
const tags = ref<SummonerTag[]>([
  {
    key: "search",
    name: "搜索",
  },
]);

// 获取标签颜色
const getTagColor = (
  index: number,
  isActive: boolean
): { bgColor: string; textColor: string; borderColor: string } => {
  if (index === -1) {
    // 搜索标签颜色
    return isActive
      ? {
          bgColor: "#0958d9", // 深蓝色
          textColor: "#ffffff",
          borderColor: "#0958d9",
        }
      : {
          bgColor: "#1d1b20", // 深灰色背景
          textColor: "#94a3b8",
          borderColor: "#94a3b8",
        };
  }
  // 其他标签样式
  return isActive
    ? {
        bgColor: "#77181f", // 明亮的中国红
        textColor: "#ffffff",
        borderColor: "#f5222d",
      }
    : {
        bgColor: "#1d1b20", // 深灰色背景
        textColor: "#94a3b8",
        borderColor: "#94a3b8",
      };
};

// 处理标签点击
const handleTagClick = (tag: SummonerTag) => {
  activeTag.value = tag.key;
};

// 处理标签关闭
const handleTagClose = (key: string) => {
  const index = tags.value.findIndex((tag) => tag.key === key);
  if (index !== -1) {
    tags.value.splice(index, 1);
    // 如果关闭的是当前标签，切换到搜索标签
    if (activeTag.value === key) {
      activeTag.value = "search";
    }
  }
};

// 处理搜索
const handleSearch = (summoner: { name: string; avatar?: string; region: string }) => {
  // 检查是否已存在该召唤师的标签
  const existingTag = tags.value.find(
    (tag) =>
      tag.name === summoner.name && tag.region === summoner.region && tag.key !== "search"
  );

  if (!existingTag) {
    // 添加新标签
    const newTag: SummonerTag = {
      key: `summoner-${Date.now()}`,
      name: summoner.name,
      avatar: summoner.avatar,
      region: summoner.region,
    };
    tags.value.push(newTag);
    activeTag.value = newTag.key;
  } else {
    // 切换到已存在的标签
    activeTag.value = existingTag.key;
  }
};
</script>

<style scoped>
.bg-grid {
  background-image: linear-gradient(
      to right,
      rgba(255, 255, 255, 0.1) 1px,
      transparent 1px
    ),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
}

:deep(.n-tag) {
  transition: all 0.3s ease;
  border-radius: 4px !important;
  padding: 4px 8px !important;
  border-width: 1px !important;
  border-style: dashed !important;
}

:deep(.n-tag:hover) {
  transform: translateY(-1px);
  filter: brightness(1.2);
}

/* 移除原有的 primary 样式 */
:deep(.n-tag--primary) {
  font-weight: 500 !important;
}

/* 关闭按钮样式 */
:deep(.n-tag__close) {
  color: inherit !important;
  opacity: 0.6;
}

:deep(.n-tag__close:hover) {
  opacity: 1;
  background-color: transparent !important;
}
</style>
