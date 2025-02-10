<template>
  <div class="py-2">
    <n-row>
      <n-form inline>
        <n-col :span="4" v-for="item in neutralThemeConfig" :key="item.title">
          <n-form-item :label="item.title">
            <n-color-picker
              :on-complete="handleChangeColor"
              v-model:value="item.color"
              :show-alpha="false"
            />
          </n-form-item>
        </n-col>
      </n-form>
    </n-row>
    <n-row>
      <n-form inline>
        <n-col :span="4" v-for="(_,key) in themeConfig">
          <n-form-item :label="key">
            <n-color-picker
              :on-complete="handleChangeColor"
              v-model:value="themeConfig[key]"
              :show-alpha="false"
            />
          </n-form-item>
        </n-col>
      </n-form>
    </n-row>
    <n-row gutter="12">
      <n-col
        v-for="type in colorTypes"
        :key="type"
        class="generate-color"
        :span="4">
        <div
          v-for="(color) in themeColors[type]"
          :key="color"
          class="w-[90%] p-1 text-white first:(rounded-tl-1 rounded-tr-1) last:(rounded-bl-1 rounded-br-1) hover:(w-[100.3%] cursor-pointer) transition-all"
          @click="copy(color,'颜色复制成功')"
          :style="{
            background: color
          }"
        >
          {{ color }}
        </div>
      </n-col>
    </n-row>
  </div>
</template>

<script
  lang="ts"
  setup>
import { useThemeStore } from '../../../store/theme'
import { copy } from '../../../utils/utils'

const themeStore = useThemeStore()
const { themeConfig, themeColors, neutralThemeConfig } =
  storeToRefs(themeStore)

const colorTypes = computed(
  () => Object.keys(themeConfig.value) as NTheme.ColorType[]
)

function handleChangeColor() {

}
</script>

<style
  lang="scss"
  scoped>

</style>
