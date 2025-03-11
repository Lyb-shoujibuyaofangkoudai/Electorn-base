<template>
  <!--  window-shadow-slider-->
  <div class="left relative z-10000 window-slider-width py-2 window-bg-slider flex flex-col gap-8 items-center justify-between">
    <ul class="flex flex-col items-center flex-1 gap-4">
      <li class="logo  w-full flex items-center justify-center !cursor-auto hover:!bg-transparent">
        <n-image
          :src="logo"
          object-fit="contain"
          preview-disabled
          width="45"
        />
      </li>
      <li
        v-for="item in leftTopTools"
        :key="item.title">
        <RouterLink
          :to="item.path"
          :class="['box-border flex flex-col justify-center items-center gap-0.5 text-c_tc-stress',activePath === item.path ? 'li-active' : '']">
          <template
            v-if="item.path === '/my'"
          >
            <n-avatar
              v-if="!summoner"
              round
              size="small"
              src=""
            />
            <n-tooltip
              v-else
              raw
              placement="right"
              trigger="hover">
              <template #trigger>
                <n-progress
                  class="!w-11 !h-11 text-0"
                  type="circle"
                  :color="{ stops: [
                          '#3498DB',
                          '#2ECC71',
                          '#F1C40F',
                          '#E67E22',
                          '#E74C3C'
                        ] }"
                  :percentage="summoner?.percentCompleteForNextLevel ?? 0">
                  <LcuImg
                    cus-class="rounded-full w-8 h-8"
                    :src="profileIconUri(summoner.profileIconId)" />
                </n-progress>
              </template>
              <div class="ground-glass-1 flex flex-col justify-center p-3 px-4 gap-4">
                <div class="flex items-end justify-between gap-6">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <n-progress
                      class="card-avatar !w-15 !h-15 text-0"
                      type="circle"
                      :color="{ stops: [
                          '#3498DB',
                          '#2ECC71',
                          '#F1C40F',
                          '#E67E22',
                          '#E74C3C'
                        ] }"
                      :percentage="summoner?.percentCompleteForNextLevel ?? 0">
                      <LcuImg
                        cus-class="rounded-full w-8 h-8"
                        :src="profileIconUri(summoner.profileIconId)" />
                    </n-progress>
                    <div class="font-bold">Lv：{{ summoner?.summonerLevel }}</div>
                  </div>
                  <div
                    class="flex flex-col items-center justify-center"
                    v-for="(item) in tiers"
                    :key="item.name">
                    <div>{{ MODES[item.name] }}</div>
                    <n-image
                    preview-disabled
                      height="50px"
                      width="50px"
                      :src="item.tier ? TIERS_ICON[item.tier] : TIERS_ICON['UNRANKED']" />
                    <div class="font-bold">{{ item.tier ? `${ SHORT_TIERS[item.tier] } ${ item.division }` : TIERS['UNRANKED'] }}</div>
                  </div>
                </div>
                <div class="font-bold">昵称：<span @click="copy(`${ summoner.gameName }#${ summoner.tagLine }`)">{{ `${ summoner.gameName }#${ summoner.tagLine }` }}</span></div>
                <div class="font-bold">大区：<span @click="copy(region)">{{ region }}</span></div>
              
              </div>
            </n-tooltip>
          
          </template>
          <Icon
            v-else
            height="30px"
            width="30px"
            :name="item.icon" />
          <!--          <span :class="`text-3 font-bold ${activePath === item.path ? 'text-c_tc-sd_act' : ''}`">{{ item.title }}</span>-->
        </RouterLink>
      </li>
    </ul>
    <ul class="flex flex-col items-center gap-4">
      <li
        v-for="item in leftBottomTools"
        :key="item.title">
        <RouterLink
          :to="item.path"
          :class="['flex flex-col justify-center items-center gap-0.5 text-c_tc-stress',activePath === item.path ? 'li-active' : '']">
          <Icon
            height="30px"
            width="30px"
            :name="item.icon" />
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

<script
  setup
  lang="ts">
import logo from '@renderer/assets/image/logo.png'
import { useRequestDataStore } from '../store/requestDataStore'
import { useConfig } from '../store/config'
import { profileIconUri } from '../../../manager/utils/utils'
import { copy } from "../utils/utils"
import { useLeague } from '../store/league'
import { MODES, RegionMap, SHORT_TIERS, TIERS, TIERS_ICON } from '../utils/common'

const requestDataStore = useRequestDataStore()
const configStore = useConfig()
const leagueStore = useLeague()
const route = useRoute()
const leftTopTools = [
  {
    icon: 'icon-zhandou',
    activeIcon: 'icon-zhandou-copy',
    title: '对战',
    path: '/'
    
  },
  {
    icon: 'icon-chaxun',
    title: '查询',
    activeIcon: 'icon-chaxun-copy',
    path: '/search'
    
  },
  {
    icon: 'home',
    activeIcon: '',
    title: '',
    path: '/my'
  },
]
const leftBottomTools = [
  
  {
    icon: 'icon-shezhi',
    activeIcon: 'icon-shezhi-copy',
    title: '',
    path: '/setting'
  }
]
const activePath = computed(() => route.path)

const summoner = computed(() => requestDataStore?.requestData?.summoner ?? null)
const region = computed(() => {
  const region = configStore.configInfo?.servers[`${ leagueStore.leagueInfo?.region }_${ leagueStore.leagueInfo?.rsoPlatformId }`]?.name ?? ''
  const regionDetail = RegionMap[leagueStore.leagueInfo?.rsoOriginalPlatformId] ?? ''
  return `${region}  ${regionDetail}`
})
const RANKED_SOLO_5x5 = computed(() => requestDataStore?.requestData?.ranked?.queueMap?.RANKED_SOLO_5x5 ?? {})
const RANKED_FLEX_SR = computed(() => requestDataStore?.requestData?.ranked?.queueMap?.RANKED_FLEX_SR ?? {})
const tiers = computed(() => [
  {
    name: 'RANKED_SOLO_5x5',
    division: RANKED_SOLO_5x5.value.division !== 'NA' ? RANKED_SOLO_5x5.value.division : '',
    tier: RANKED_SOLO_5x5.value?.tier || ''
  },
  {
    name: 'RANKED_FLEX_SR',
    division: RANKED_FLEX_SR.value.division ?? '',
    tier: RANKED_FLEX_SR.value?.tier || ''
  }
])
</script>


<style
  lang="scss"
  scoped>
ul {
  @apply w-full;
  
  li {
    @apply relative h-13 w-14 flex flex-col justify-center items-center cursor-pointer hover:bg-c_wc-selectBg;
    a {
      @apply w-full h-full;
    }
    
    .li-active {
      @apply bg-c_wc-selectBg after:(content-empty absolute left-0 top-0 bottom-0 w-1.2 bg-c_wc-selectBgGap);
      //&::after {
      //  content: '';
      //  @apply absolute l-0 t-0 b-0 w-4 bg-red;
      //}
    }
    
    .card-avatar {
      -webkit-box-reflect: below 1px linear-gradient(transparent, transparent, transparent, #0004);
    }
 
  }
  
  
}
</style>
