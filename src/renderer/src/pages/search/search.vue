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
        <div class="mb-4 flex flex-wrap items-center gap-2 p-2">
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
              <LcuImg
                v-else
                cus-class="w-4 h-4 rounded-full flex-shrink-0"
                :src="profileIconUri(tag.avatar)" />
              
              <span class="truncate">{{ tag.name }}</span>
            </div>
          </n-tag>
          <!-- 关闭所有按钮 -->
          <n-button
            v-if="tags.length > 1"
            text
            type="error"
            size="tiny"
            class="ml-2"
            @click="closeAllTags"
          >
            关闭所有
          </n-button>
        </div>

        <!-- 内容区域 -->
        <div v-show="activeTag === 'search'">
          <SearchPanel @search="handleSearch" />
        </div>
        <div v-show="activeTag !== 'search'">
          <LOLMatchHistoryDashboard :summoner="summoner" />
        </div>
      </n-card>
    </div>
  </ConnLOLClient>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NEmpty, NTag, NButton } from "naive-ui";
import SearchPanel from "./components/SearchPanel.vue";
import { SearchOutlined } from "@vicons/material";
import { profileIconUri } from '../../../../manager/utils/utils'
import LOLMatchHistoryDashboard from './components/LOLMatchHistoryDashboard.vue'
import { useSearchStore } from '../../stores/searchStore';

// 使用 store
const searchStore = useSearchStore();

// 使用计算属性获取 store 中的状态
const tags = computed(() => searchStore.tags);
const activeTag = computed({
  get: () => searchStore.activeTag,
  set: (value) => searchStore.setActiveTag(value)
});

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
const handleTagClick = (tag: any) => {
  searchStore.setActiveTag(tag.key);
};

// 处理标签关闭
const handleTagClose = (key: string) => {
  searchStore.removeTag(key);
};

// 处理搜索
const handleSearch = (summoner: { name: string; avatar?: string; region: string }) => {
  searchStore.addTag(summoner);
};

// 关闭所有标签
const closeAllTags = () => {
  searchStore.removeAllTags();
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
