<template>
  <div class="space-y-6">
    <!-- 装备构建时间线 -->
    <div class="chart-section">
      <h3 class="text-white mb-4 font-medium">装备构建时间线</h3>
      <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
        <div ref="itemTimelineChart" class="w-full h-full"></div>
      </div>
    </div>

    <!-- 装备详情 -->
    <div class="bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-6">
      <div class="grid grid-cols-6 gap-4">
        <!-- 主要装备 -->
        <div v-for="item in mainItems" :key="item.id" class="item-card text-center">
          <div class="relative mb-2">
            <img :src="item.icon" class="w-12 h-12 mx-auto rounded" />
            <div class="absolute bottom-0 right-0 text-xs bg-[#2D325F] px-1 rounded">
              {{ formatGold(item.gold) }}
            </div>
          </div>
          <div class="text-white text-sm truncate">{{ item.name }}</div>
          <div class="text-[#94a3b8] text-xs">{{ formatTime(item.purchaseTime) }}</div>
        </div>
      </div>

      <!-- 饰品和消耗品 -->
      <div class="mt-6 grid grid-cols-2 gap-6">
        <div class="consumables-section">
          <h4 class="text-white text-sm mb-4">消耗品</h4>
          <div class="grid grid-cols-4 gap-3">
            <div v-for="item in consumableItems" :key="item.id" class="item-card text-center">
              <div class="relative mb-2">
                <img :src="item.icon" class="w-10 h-10 mx-auto rounded" />
                <div class="absolute bottom-0 right-0 text-xs bg-[#2D325F] px-1 rounded">
                  {{ item.count }}
                </div>
              </div>
              <div class="text-[#94a3b8] text-xs">{{ formatGold(item.totalGold) }}</div>
            </div>
          </div>
        </div>
        <div class="trinkets-section">
          <h4 class="text-white text-sm mb-4">饰品</h4>
          <div class="grid grid-cols-4 gap-3">
            <div v-for="item in trinketItems" :key="item.id" class="item-card text-center">
              <div class="relative mb-2">
                <img :src="item.icon" class="w-10 h-10 mx-auto rounded" />
                <div class="absolute bottom-0 right-0 text-xs bg-[#2D325F] px-1 rounded">
                  {{ formatTime(item.upgradeTime) }}
                </div>
              </div>
              <div class="text-[#94a3b8] text-xs">{{ item.name }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 装备统计 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">总装备价值</div>
        <div class="text-white text-2xl font-medium">15,420</div>
        <div class="text-[#3498DB] text-xs">领先对位2,150金币</div>
      </div>
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">消耗品投资</div>
        <div class="text-white text-2xl font-medium">1,250</div>
        <div class="text-[#3498DB] text-xs">占总支出8.1%</div>
      </div>
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">装备完成时间</div>
        <div class="text-white text-2xl font-medium">23:45</div>
        <div class="text-[#3498DB] text-xs">快于平均3:20</div>
      </div>
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">装备性价比</div>
        <div class="text-white text-2xl font-medium">94%</div>
        <div class="text-[#3498DB] text-xs">装备利用率极高</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineComponent } from 'vue';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  matchData: {
    blueTeam: any[];
    redTeam: any[];
  };
}>();

const itemTimelineChart = ref<HTMLElement | null>(null);
let timelineChart: echarts.ECharts | null = null;

// 模拟装备数据
const mainItems = ref([
  { id: 1, name: '神圣分离者', icon: 'path/to/icon1.png', gold: 3200, purchaseTime: 1200 },
  { id: 2, name: '死亡之舞', icon: 'path/to/icon2.png', gold: 3100, purchaseTime: 1500 },
  { id: 3, name: '守护天使', icon: 'path/to/icon3.png', gold: 2800, purchaseTime: 1800 },
  { id: 4, name: '兰德里的折磨', icon: 'path/to/icon4.png', gold: 3000, purchaseTime: 2100 },
  { id: 5, name: '死亡之帽', icon: 'path/to/icon5.png', gold: 3600, purchaseTime: 2400 },
  { id: 6, name: '虚空之杖', icon: 'path/to/icon6.png', gold: 2600, purchaseTime: 2700 },
]);

const consumableItems = ref([
  { id: 1, name: '生命药水', icon: 'path/to/potion1.png', count: 5, totalGold: 250 },
  { id: 2, name: '真视守卫', icon: 'path/to/ward1.png', count: 3, totalGold: 225 },
  { id: 3, name: '控制守卫', icon: 'path/to/ward2.png', count: 2, totalGold: 150 },
  { id: 4, name: '复用型药水', icon: 'path/to/potion2.png', count: 1, totalGold: 500 },
]);

const trinketItems = ref([
  { id: 1, name: '监视图腾', icon: 'path/to/trinket1.png', upgradeTime: 900 },
  { id: 2, name: '扫描透镜', icon: 'path/to/trinket2.png', upgradeTime: 1200 },
]);

// 格式化金币显示
const formatGold = (gold: number) => {
  return gold >= 1000 ? `${(gold / 1000).toFixed(1)}k` : gold;
};

// 格式化时间显示
const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 初始化装备时间线图表
const initItemTimelineChart = () => {
  if (!itemTimelineChart.value) return;
  
  timelineChart = echarts.init(itemTimelineChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    legend: {
      data: ['装备价值', '对位差距'],
      textStyle: { color: '#94a3b8' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['0:00', '5:00', '10:00', '15:00', '20:00', '25:00', '30:00'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: {
        color: '#94a3b8',
        formatter: (value: number) => formatGold(value)
      },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    series: [
      {
        name: '装备价值',
        type: 'line',
        data: [500, 2000, 4500, 8000, 11000, 13500, 15420],
        itemStyle: { color: '#3498DB' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(52, 152, 219, 0.3)' },
            { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
          ])
        }
      },
      {
        name: '对位差距',
        type: 'line',
        data: [0, 300, 800, 1200, 1500, 1800, 2150],
        itemStyle: { color: '#2ECC71' }
      }
    ]
  };
  
  timelineChart.setOption(option);
};

// 监听窗口大小变化
const handleResize = () => {
  timelineChart?.resize();
};

onMounted(() => {
  initItemTimelineChart();
  window.addEventListener('resize', handleResize);
});

// 监听数据变化
watch(() => props.matchData, () => {
  initItemTimelineChart();
}, { deep: true });

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  timelineChart?.dispose();
});

</script>

<style scoped>
.chart-section {
  @apply rounded-lg overflow-hidden;
}

.item-card {
  @apply transition-all duration-300;
}

.item-card:hover {
  @apply transform scale-105;
}

.stat-card {
  @apply transition-all duration-300;
}

.stat-card:hover {
  @apply transform scale-105;
}
</style>
