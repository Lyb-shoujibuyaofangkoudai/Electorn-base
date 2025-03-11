<!-- 对局列表组件 -->
<template>
  <div class="w-full lg:w-1/4 min-w-[300px] bg-[#2C2F33]/80 rounded-lg">
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import { NScrollbar } from "naive-ui";
import { championIconUri } from "../../../../../manager/utils/utils";
import { useSearchStore } from "../../../store/searchStore";

const searchStore = useSearchStore();

// 从 store 获取数据
const matches = computed(() => searchStore.matches);
const selectedMatchIndex = computed(() => searchStore.selectedMatchIndex);

// 处理对局选择
const handleMatchSelect = (index: number) => {
  searchStore.updateCurrentMatch(index);
};
</script>

<style scoped>
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
</style> 