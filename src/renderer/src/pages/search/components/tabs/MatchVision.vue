<template>
  <div class="space-y-6">
    <!-- 视野得分对比 -->
    <div class="chart-section">
      <h3 class="text-white mb-4 font-medium">视野得分对比</h3>
      <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
        <div ref="visionScoreChart" class="w-full h-full"></div>
      </div>
    </div>

    <!-- 视野控制分析 -->
    <div class="grid grid-cols-2 gap-4">
      <div class="chart-section">
        <h3 class="text-white mb-4 font-medium">视野布控</h3>
        <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
          <div ref="wardingChart" class="w-full h-full"></div>
        </div>
      </div>
      <div class="chart-section">
        <h3 class="text-white mb-4 font-medium">视野清除</h3>
        <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
          <div ref="wardClearChart" class="w-full h-full"></div>
        </div>
      </div>
    </div>

    <!-- 视野统计 -->
    <div class="grid grid-cols-4 gap-4">
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">插眼总数</div>
        <div class="text-white text-2xl font-medium">24</div>
        <div class="text-[#3498DB] text-xs">超过80%玩家</div>
      </div>
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">排眼总数</div>
        <div class="text-white text-2xl font-medium">12</div>
        <div class="text-[#3498DB] text-xs">超过75%玩家</div>
      </div>
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">控制守卫</div>
        <div class="text-white text-2xl font-medium">3</div>
        <div class="text-[#3498DB] text-xs">超过65%玩家</div>
      </div>
      <div class="stat-card bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4 text-center">
        <div class="text-[#94a3b8] text-sm mb-2">视野得分</div>
        <div class="text-white text-2xl font-medium">42</div>
        <div class="text-[#3498DB] text-xs">超过70%玩家</div>
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

const visionScoreChart = ref<HTMLElement | null>(null);
const wardingChart = ref<HTMLElement | null>(null);
const wardClearChart = ref<HTMLElement | null>(null);
let scoreChart: echarts.ECharts | null = null;
let wardChart: echarts.ECharts | null = null;
let clearChart: echarts.ECharts | null = null;

// 初始化视野得分对比图表
const initVisionScoreChart = () => {
  if (!visionScoreChart.value) return;
  
  scoreChart = echarts.init(visionScoreChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['我方', '敌方'],
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
      data: ['上单', '打野', '中单', '下路', '辅助'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    series: [
      {
        name: '我方',
        type: 'bar',
        data: [25, 35, 30, 28, 45],
        itemStyle: { color: '#3498DB' }
      },
      {
        name: '敌方',
        type: 'bar',
        data: [22, 38, 28, 25, 42],
        itemStyle: { color: '#E74C3C' }
      }
    ]
  };
  
  scoreChart.setOption(option);
};

// 初始化视野布控图表
const initWardingChart = () => {
  if (!wardingChart.value) return;
  
  wardChart = echarts.init(wardingChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94a3b8' }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 15, name: '饰品眼', itemStyle: { color: '#3498DB' } },
          { value: 6, name: '控制守卫', itemStyle: { color: '#E74C3C' } },
          { value: 3, name: '侦查守卫', itemStyle: { color: '#F1C40F' } }
        ]
      }
    ]
  };
  
  wardChart.setOption(option);
};

// 初始化视野清除图表
const initWardClearChart = () => {
  if (!wardClearChart.value) return;
  
  clearChart = echarts.init(wardClearChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94a3b8' }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: 'center'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: '14',
            fontWeight: 'bold'
          }
        },
        data: [
          { value: 8, name: '排除饰品眼', itemStyle: { color: '#3498DB' } },
          { value: 3, name: '排除控制守卫', itemStyle: { color: '#E74C3C' } },
          { value: 1, name: '排除侦查守卫', itemStyle: { color: '#F1C40F' } }
        ]
      }
    ]
  };
  
  clearChart.setOption(option);
};

// 监听窗口大小变化
const handleResize = () => {
  scoreChart?.resize();
  wardChart?.resize();
  clearChart?.resize();
};

onMounted(() => {
  initVisionScoreChart();
  initWardingChart();
  initWardClearChart();
  window.addEventListener('resize', handleResize);
});

// 监听数据变化
watch(() => props.matchData, () => {
  initVisionScoreChart();
  initWardingChart();
  initWardClearChart();
}, { deep: true });

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  scoreChart?.dispose();
  wardChart?.dispose();
  clearChart?.dispose();
});

</script>

<style scoped>
.chart-section {
  @apply rounded-lg overflow-hidden;
}

.stat-card {
  @apply transition-all duration-300;
}

.stat-card:hover {
  @apply transform scale-105;
}
</style>
