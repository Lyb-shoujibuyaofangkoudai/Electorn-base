<template>
  <div class="space-y-6">
    <!-- 个人表现数据卡片 -->
    <div class="grid grid-cols-5 gap-4">
      <div v-for="metric in metrics" :key="metric.label"
        class="stat-card p-4 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg text-center">
        <div class="text-[#94a3b8] text-sm mb-2">{{ metric.label }}</div>
        <div class="text-white text-xl font-bold">{{ metric.value }}</div>
        <div class="text-xs" :class="metric.trend >= 0 ? 'text-[#2ECC71]' : 'text-[#E74C3C]'">
          {{ metric.trend > 0 ? '+' : '' }}{{ metric.trend }}%
        </div>
      </div>
    </div>
    <!-- 个人表现图表 -->
    <div class="">
      <div class="chart-section">
        <h3 class="text-white mb-4 font-medium">能力评估</h3>
        <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
          <div ref="performanceChart" class="w-full h-full"></div>
        </div>
      </div>
    </div>
    <!-- 团队数据对比 -->
    <div class="chart-section">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-white font-medium">团队数据对比</h3>
        <n-select
          v-model:value="selectedMetric"
          :options="metricOptions"
          size="small"
          class="w-32"
        />
      </div>
      <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
        <div ref="teamComparisonChart" class="w-full h-full"></div>
      </div>
    </div>

    <!-- KDA分布图表 -->
    <div class="chart-section">
      <h3 class="text-white mb-4 font-medium">KDA分布</h3>
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
          <div class="text-[#94a3b8] text-sm mb-2 text-center">击杀</div>
          <div class="text-xs text-[#94a3b8] mb-1 flex justify-between">
            <span class="text-[#2ECC71]">最高: {{ maxKillIndices.map(i => 'P' + (i + 1)).join(',') }} ({{ maxKillValue }})</span>
            <span class="text-[#E74C3C]">最低: {{ minKillIndices.map(i => 'P' + (i + 1)).join(',') }} ({{ minKillValue }})</span>
          </div>
          <div ref="killChart" class="w-full h-[240px]"></div>
        </div>
        <div class="bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
          <div class="text-[#94a3b8] text-sm mb-2 text-center">死亡</div>
          <div class="text-xs text-[#94a3b8] mb-1 flex justify-between">
            <span class="text-[#2ECC71]">最高: {{ maxDeathIndices.map(i => 'P' + (i + 1)).join(',') }} ({{ maxDeathValue }})</span>
            <span class="text-[#E74C3C]">最低: {{ minDeathIndices.map(i => 'P' + (i + 1)).join(',') }} ({{ minDeathValue }})</span>
          </div>
          <div ref="deathChart" class="w-full h-[240px]"></div>
        </div>
        <div class="bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
          <div class="text-[#94a3b8] text-sm mb-2 text-center">助攻</div>
          <div class="text-xs text-[#94a3b8] mb-1 flex justify-between">
            <span class="text-[#2ECC71]">最高: {{ maxAssistIndices.map(i => 'P' + (i + 1)).join(',') }} ({{ maxAssistValue }})</span>
            <span class="text-[#E74C3C]">最低: {{ minAssistIndices.map(i => 'P' + (i + 1)).join(',') }} ({{ minAssistValue }})</span>
          </div>
          <div ref="assistChart" class="w-full h-[240px]"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, defineComponent, nextTick } from 'vue';
import { NSelect } from 'naive-ui';
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

const props = defineProps<{
  matchData: {
    blueTeam: any[];
    redTeam: any[];
  };
}>();

const teamComparisonChart = ref<HTMLElement | null>(null);
const performanceChart = ref<HTMLElement | null>(null);
const runeChart = ref<HTMLElement | null>(null);
const killChart = ref<HTMLElement | null>(null);
const deathChart = ref<HTMLElement | null>(null);
const assistChart = ref<HTMLElement | null>(null);
let teamChart: echarts.ECharts | null = null;
let perfChart: echarts.ECharts | null = null;
let runeChartInstance: echarts.ECharts | null = null;
let killChartInstance: echarts.ECharts | null = null;
let deathChartInstance: echarts.ECharts | null = null;
let assistChartInstance: echarts.ECharts | null = null;

// 数据指标选择
const selectedMetric = ref('damage');
const metricOptions = [
  { label: '总伤害', value: 'damage' },
  { label: '经济', value: 'gold' },
  { label: '防御塔伤害', value: 'towerDamage' },
  { label: '承受伤害', value: 'damageTaken' },
  { label: '视野得分', value: 'visionScore' },
];

// 关键指标卡片数据
const metrics = ref([
  { label: '场均伤害', value: '25,431', trend: 12 },
  { label: '场均经济', value: '15,200', trend: 8 },
  { label: '场均补刀', value: '256', trend: -3 },
  { label: '视野得分', value: '35', trend: 15 },
  { label: 'KDA', value: '3.5', trend: 5 },
]);

// 在 script setup 中修改响应式数据的类型
const maxKillIndices = ref<number[]>([]);
const minKillIndices = ref<number[]>([]);
const maxKillValue = ref(0);
const minKillValue = ref(0);

const maxDeathIndices = ref<number[]>([]);
const minDeathIndices = ref<number[]>([]);
const maxDeathValue = ref(0);
const minDeathValue = ref(0);

const maxAssistIndices = ref<number[]>([]);
const minAssistIndices = ref<number[]>([]);
const maxAssistValue = ref(0);
const minAssistValue = ref(0);

// 初始化团队对比图表
const initTeamComparisonChart = () => {
  if (!teamComparisonChart.value) return;
  
  teamChart = echarts.init(teamComparisonChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['我方', '敌方'],
      textStyle: { color: '#94a3b8' },
      top: 10,
      right: '4%',
      padding: [0, 0, 10, 0]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    yAxis: {
      type: 'category',
      data: ['总伤害', '经济', '防御塔伤害', '承受伤害', '视野得分'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        name: '我方',
        type: 'bar',
        data: [320, 302, 301, 334, 390],
        itemStyle: { color: '#3498DB' }
      },
      {
        name: '敌方',
        type: 'bar',
        data: [220, 182, 191, 234, 290],
        itemStyle: { color: '#E74C3C' }
      }
    ]
  };
  
  teamChart.setOption(option);
};

// 初始化个人表现雷达图
const initPerformanceChart = () => {
  if (!performanceChart.value) return;
  
  perfChart = echarts.init(performanceChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['个人表现', '我方平均', '全服平均'],
      textStyle: { color: '#94a3b8' },
      icon: 'circle',
      itemWidth: 8,
      itemHeight: 8,
      itemGap: 20,
      bottom: '5%',
      padding: [10, 0, 0, 0]
    },
    radar: {
      center: ['50%', '45%'],
      radius: '60%',
      indicator: [
        { name: '输出', max: 100 },
        { name: '经济', max: 100 },
        { name: '生存', max: 100 },
        { name: '视野', max: 100 },
        { name: '推塔', max: 100 },
        { name: '参团', max: 100 }
      ],
      splitArea: {
        areaStyle: {
          color: ['rgba(45, 50, 95, 0.4)'],
          shadowColor: 'rgba(0, 0, 0, 0.2)',
          shadowBlur: 10
        }
      },
      axisLine: {
        lineStyle: {
          color: '#4B5563'
        }
      },
      splitLine: {
        lineStyle: {
          color: '#4B5563'
        }
      },
      name: {
        textStyle: {
          color: '#94a3b8'
        }
      }
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [85, 70, 60, 75, 65, 80],
          name: '个人表现',
          itemStyle: { color: '#3498DB' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(52, 152, 219, 0.6)' },
              { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
            ])
          },
          lineStyle: {
            width: 2,
            color: '#3498DB'
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [75, 65, 70, 68, 60, 72],
          name: '我方平均',
          itemStyle: { color: '#2ECC71' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(46, 204, 113, 0.4)' },
              { offset: 1, color: 'rgba(46, 204, 113, 0.1)' }
            ])
          },
          lineStyle: {
            width: 2,
            color: '#2ECC71'
          },
          symbol: 'circle',
          symbolSize: 6
        },
        {
          value: [65, 60, 65, 62, 58, 65],
          name: '全服平均',
          itemStyle: { color: '#95A5A6' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(149, 165, 166, 0.3)' },
              { offset: 1, color: 'rgba(149, 165, 166, 0.1)' }
            ])
          },
          lineStyle: {
            width: 2,
            color: '#95A5A6'
          },
          symbol: 'circle',
          symbolSize: 6
        }
      ]
    }],
  };
  
  perfChart.setOption(option);
};

// 初始化符文效率图表
const initRuneChart = () => {
  if (!runeChart.value) return;
  
  runeChartInstance = echarts.init(runeChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      data: ['符文效率'],
      textStyle: { color: '#94a3b8' },
      top: 10,
      right: '4%',
      padding: [0, 0, 10, 0]
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { lineStyle: { color: '#374151' } }
    },
    yAxis: {
      type: 'category',
      data: ['符文效率'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        name: '符文效率',
        type: 'bar',
        data: [85],
        itemStyle: { color: '#3498DB' }
      }
    ]
  };
  
  runeChartInstance.setOption(option);
};

// 初始化KDA分布图表
const initKdaChart = () => {
  // 基础配置
  const baseOption: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      top: '5%',
      left: '10%',
      right: '12%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' },
      splitLine: { show: false }
    },
    yAxis: {
      type: 'category',
      data: ['蓝方', '蓝方', '蓝方', '蓝方', '蓝方', '红方', '红方', '红方', '红方', '红方'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { 
        color: '#94a3b8',
        formatter: (value: string, index: number) => `P${index + 1}`,
        padding: [0, 0, 0, 0]
      }
    }
  };

  // 修改获取最大最小值索引和值的辅助函数
  const getMinMaxIndices = (data: any[]) => {
    let maxVal = -Infinity;
    let minVal = Infinity;
    let maxIndices: number[] = [];
    let minIndices: number[] = [];
    
    // 首先找到最大和最小值
    data.forEach(item => {
      const value = item.value;
      if (value > maxVal) maxVal = value;
      if (value < minVal) minVal = value;
    });
    
    // 然后收集所有等于最大值和最小值的索引
    data.forEach((item, index) => {
      const value = item.value;
      if (value === maxVal) maxIndices.push(index);
      if (value === minVal) minIndices.push(index);
    });
    
    return { maxIndices, minIndices, maxVal, minVal };
  };

  // 初始化击杀图表
  if (killChart.value) {
    const killData = [
      { value: 5, itemStyle: { color: '#3498DB' } },
      { value: 3, itemStyle: { color: '#3498DB' } },
      { value: 4, itemStyle: { color: '#3498DB' } },
      { value: 2, itemStyle: { color: '#3498DB' } },
      { value: 6, itemStyle: { color: '#3498DB' } },
      { value: 4, itemStyle: { color: '#E74C3C' } },
      { value: 3, itemStyle: { color: '#E74C3C' } },
      { value: 5, itemStyle: { color: '#E74C3C' } },
      { value: 2, itemStyle: { color: '#E74C3C' } },
      { value: 4, itemStyle: { color: '#E74C3C' } }
    ];
    
    const { maxIndices, minIndices, maxVal, minVal } = getMinMaxIndices(killData);
    maxKillIndices.value = maxIndices;
    minKillIndices.value = minIndices;
    maxKillValue.value = maxVal;
    minKillValue.value = minVal;
    
    killChartInstance = echarts.init(killChart.value);
    const killOption = {
      ...baseOption,
      series: [{
        type: 'bar',
        barWidth: 12,
        data: killData,
        label: {
          show: true,
          position: 'right',
          color: '#94a3b8',
          fontSize: 12,
          distance: 5
        }
      }]
    };
    killChartInstance.setOption(killOption);
  }

  // 初始化死亡图表
  if (deathChart.value) {
    const deathData = [
      { value: 2, itemStyle: { color: '#3498DB' } },
      { value: 4, itemStyle: { color: '#3498DB' } },
      { value: 3, itemStyle: { color: '#3498DB' } },
      { value: 5, itemStyle: { color: '#3498DB' } },
      { value: 1, itemStyle: { color: '#3498DB' } },
      { value: 3, itemStyle: { color: '#E74C3C' } },
      { value: 4, itemStyle: { color: '#E74C3C' } },
      { value: 2, itemStyle: { color: '#E74C3C' } },
      { value: 5, itemStyle: { color: '#E74C3C' } },
      { value: 3, itemStyle: { color: '#E74C3C' } }
    ];
    
    const { maxIndices, minIndices, maxVal, minVal } = getMinMaxIndices(deathData);
    maxDeathIndices.value = maxIndices;
    minDeathIndices.value = minIndices;
    maxDeathValue.value = maxVal;
    minDeathValue.value = minVal;
    
    deathChartInstance = echarts.init(deathChart.value);
    const deathOption = {
      ...baseOption,
      series: [{
        type: 'bar',
        barWidth: 12,
        data: deathData,
        label: {
          show: true,
          position: 'right',
          color: '#94a3b8',
          fontSize: 12,
          distance: 5
        }
      }]
    };
    deathChartInstance.setOption(deathOption);
  }

  // 初始化助攻图表
  if (assistChart.value) {
    const assistData = [
      { value: 8, itemStyle: { color: '#3498DB' } },
      { value: 6, itemStyle: { color: '#3498DB' } },
      { value: 7, itemStyle: { color: '#3498DB' } },
      { value: 9, itemStyle: { color: '#3498DB' } },
      { value: 5, itemStyle: { color: '#3498DB' } },
      { value: 7, itemStyle: { color: '#E74C3C' } },
      { value: 6, itemStyle: { color: '#E74C3C' } },
      { value: 8, itemStyle: { color: '#E74C3C' } },
      { value: 5, itemStyle: { color: '#E74C3C' } },
      { value: 7, itemStyle: { color: '#E74C3C' } }
    ];
    
    const { maxIndices, minIndices, maxVal, minVal } = getMinMaxIndices(assistData);
    maxAssistIndices.value = maxIndices;
    minAssistIndices.value = minIndices;
    maxAssistValue.value = maxVal;
    minAssistValue.value = minVal;
    
    assistChartInstance = echarts.init(assistChart.value);
    const assistOption = {
      ...baseOption,
      series: [{
        type: 'bar',
        barWidth: 12,
        data: assistData,
        label: {
          show: true,
          position: 'right',
          color: '#94a3b8',
          fontSize: 12,
          distance: 5
        }
      }]
    };
    assistChartInstance.setOption(assistOption);
  }
};

// 修改初始化函数
const initCharts = async () => {
  await nextTick();
  setTimeout(() => {
    initTeamComparisonChart();
    initPerformanceChart();
    initRuneChart();
    initKdaChart();
  }, 100);
};

// 修改 onMounted 钩子
onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});

// 修改 watch 监听器
watch(() => props.matchData, () => {
  initCharts();
}, { deep: true });

// 修改 handleResize 函数
const handleResize = () => {
  nextTick(() => {
    teamChart?.resize();
    perfChart?.resize();
    runeChartInstance?.resize();
    killChartInstance?.resize();
    deathChartInstance?.resize();
    assistChartInstance?.resize();
  });
};

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  teamChart?.dispose();
  perfChart?.dispose();
  runeChartInstance?.dispose();
  killChartInstance?.dispose();
  deathChartInstance?.dispose();
  assistChartInstance?.dispose();
});


</script>

<style scoped>
.chart-section {
  @apply rounded-lg overflow-hidden;
}
</style>
