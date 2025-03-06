<template>
  <div class="space-y-6">
    <!-- 伤害类型分布 -->
    <div class="chart-section">
      <h3 class="text-white mb-4 font-medium">伤害类型分布</h3>
      <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
        <div ref="damageTypeChart" class="w-full h-full"></div>
      </div>
    </div>

    <!-- 总伤害对比 -->
    <div class="chart-section">
      <h3 class="text-white mb-4 font-medium">总伤害对比</h3>
      <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
        <div ref="totalDamageChart" class="w-full h-full"></div>
      </div>
    </div>

    <!-- 防御塔伤害 -->
    <div class="chart-section">
      <h3 class="text-white mb-4 font-medium">防御塔伤害</h3>
      <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
        <div ref="towerDamageChart" class="w-full h-full"></div>
      </div>
    </div>

    <!-- 承受伤害 -->
    <div class="chart-section">
      <h3 class="text-white mb-4 font-medium">承受伤害</h3>
      <div class="h-80 bg-[#2D325F]/40 backdrop-blur-xl rounded-lg p-4">
        <div ref="damageTakenChart" class="w-full h-full"></div>
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

// 图表引用
const damageTypeChart = ref<HTMLElement | null>(null);
const totalDamageChart = ref<HTMLElement | null>(null);
const towerDamageChart = ref<HTMLElement | null>(null);
const damageTakenChart = ref<HTMLElement | null>(null);

// 图表实例
let typeChart: echarts.ECharts | null = null;
let totalChart: echarts.ECharts | null = null;
let towerChart: echarts.ECharts | null = null;
let takenChart: echarts.ECharts | null = null;

// 初始化伤害类型分布图表（堆叠柱状图）
const initDamageTypeChart = () => {
  if (!damageTypeChart.value) return;
  
  typeChart = echarts.init(damageTypeChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
    },
    legend: {
      data: ['物理伤害', '魔法伤害', '真实伤害'],
      textStyle: { color: '#94a3b8' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
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
      data: ['玩家1', '玩家2', '玩家3', '玩家4', '玩家5', '玩家6', '玩家7', '玩家8', '玩家9', '玩家10'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        name: '物理伤害',
        type: 'bar',
        stack: 'total',
        data: [12000, 8000, 9000, 11000, 7000, 10000, 9500, 8500, 7500, 11500],
        itemStyle: { color: '#E74C3C' },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}'
        }
      },
      {
        name: '魔法伤害',
        type: 'bar',
        stack: 'total',
        data: [8000, 10000, 7500, 9000, 12000, 8500, 11000, 9000, 10500, 8000],
        itemStyle: { color: '#3498DB' },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}'
        }
      },
      {
        name: '真实伤害',
        type: 'bar',
        stack: 'total',
        data: [5000, 4000, 6000, 3500, 4500, 5500, 4000, 5000, 4500, 5000],
        itemStyle: { color: '#F1C40F' },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}'
        }
      }
    ]
  };
  
  typeChart.setOption(option);
};

// 初始化总伤害对比图表（玫瑰图）
const initTotalDamageChart = () => {
  if (!totalDamageChart.value) return;
  
  totalChart = echarts.init(totalDamageChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 'center',
      right: '5%',
      orient: 'vertical',
      textStyle: { color: '#94a3b8' }
    },
    series: [
      {
        name: '总伤害',
        type: 'pie',
        radius: ['30%', '70%'],
        roseType: 'area',
        itemStyle: {
          borderRadius: 8
        },
        label: {
          show: true,
          formatter: '{b}\n{c}'
        },
        data: [
          { value: 25000, name: '玩家1', itemStyle: { color: '#3498DB' } },
          { value: 22000, name: '玩家2', itemStyle: { color: '#2ECC71' } },
          { value: 22500, name: '玩家3', itemStyle: { color: '#E74C3C' } },
          { value: 23500, name: '玩家4', itemStyle: { color: '#F1C40F' } },
          { value: 23500, name: '玩家5', itemStyle: { color: '#9B59B6' } },
          { value: 24000, name: '玩家6', itemStyle: { color: '#1ABC9C' } },
          { value: 24500, name: '玩家7', itemStyle: { color: '#E67E22' } },
          { value: 22500, name: '玩家8', itemStyle: { color: '#34495E' } },
          { value: 22500, name: '玩家9', itemStyle: { color: '#7F8C8D' } },
          { value: 24500, name: '玩家10', itemStyle: { color: '#16A085' } }
        ]
      }
    ]
  };
  
  totalChart.setOption(option);
};

// 初始化防御塔伤害图表（条形图）
const initTowerDamageChart = () => {
  if (!towerDamageChart.value) return;
  
  towerChart = echarts.init(towerDamageChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' }
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
      data: ['玩家1', '玩家2', '玩家3', '玩家4', '玩家5', '玩家6', '玩家7', '玩家8', '玩家9', '玩家10'],
      axisLine: { lineStyle: { color: '#4B5563' } },
      axisLabel: { color: '#94a3b8' }
    },
    series: [
      {
        type: 'bar',
        data: [
          { value: 4500, itemStyle: { color: '#3498DB' } },
          { value: 3800, itemStyle: { color: '#2ECC71' } },
          { value: 4200, itemStyle: { color: '#E74C3C' } },
          { value: 3500, itemStyle: { color: '#F1C40F' } },
          { value: 5000, itemStyle: { color: '#9B59B6' } },
          { value: 3200, itemStyle: { color: '#1ABC9C' } },
          { value: 4100, itemStyle: { color: '#E67E22' } },
          { value: 3900, itemStyle: { color: '#34495E' } },
          { value: 4300, itemStyle: { color: '#7F8C8D' } },
          { value: 3600, itemStyle: { color: '#16A085' } }
        ],
        label: {
          show: true,
          position: 'right',
          formatter: '{c}'
        }
      }
    ],
    visualMap: {
      orient: 'horizontal',
      left: 'center',
      min: 3000,
      max: 5000,
      text: ['高', '低'],
      dimension: 0,
      inRange: {
        color: ['#3498DB', '#E74C3C']
      },
      textStyle: {
        color: '#94a3b8'
      },
      top: 0,
      padding: [0, 0, 20, 0]
    }
  };
  
  towerChart.setOption(option);
};

// 初始化承受伤害图表（雷达图）
const initDamageTakenChart = () => {
  if (!damageTakenChart.value) return;
  
  takenChart = echarts.init(damageTakenChart.value);
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      data: ['我方', '敌方'],
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
        { name: '上单', max: 50000 },
        { name: '打野', max: 50000 },
        { name: '中单', max: 50000 },
        { name: '下路', max: 50000 },
        { name: '辅助', max: 50000 }
      ],
      splitArea: {
        areaStyle: {
          color: ['rgba(45, 50, 95, 0.4)']
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
    series: [
      {
        name: '我方',
        type: 'radar',
        data: [
          {
            value: [42000, 32000, 35000, 30000, 28000],
            name: '我方',
            itemStyle: { color: '#3498DB' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(52, 152, 219, 0.3)' },
                { offset: 1, color: 'rgba(52, 152, 219, 0.1)' }
              ])
            }
          }
        ]
      },
      {
        name: '敌方',
        type: 'radar',
        data: [
          {
            value: [38000, 35000, 32000, 33000, 25000],
            name: '敌方',
            itemStyle: { color: '#E74C3C' },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(231, 76, 60, 0.3)' },
                { offset: 1, color: 'rgba(231, 76, 60, 0.1)' }
              ])
            }
          }
        ]
      }
    ]
  };
  
  takenChart.setOption(option);
};

// 监听窗口大小变化
const handleResize = () => {
  typeChart?.resize();
  totalChart?.resize();
  towerChart?.resize();
  takenChart?.resize();
};

onMounted(() => {
  initDamageTypeChart();
  initTotalDamageChart();
  initTowerDamageChart();
  initDamageTakenChart();
  window.addEventListener('resize', handleResize);
});

// 监听数据变化
watch(() => props.matchData, () => {
  initDamageTypeChart();
  initTotalDamageChart();
  initTowerDamageChart();
  initDamageTakenChart();
}, { deep: true });

// 组件卸载时清理
onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  typeChart?.dispose();
  totalChart?.dispose();
  towerChart?.dispose();
  takenChart?.dispose();
});


</script>

<style scoped>
.chart-section {
  @apply rounded-lg overflow-hidden;
}
</style>
