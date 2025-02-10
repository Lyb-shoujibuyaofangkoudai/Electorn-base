// uno.config.ts
import { defineConfig, presetWind } from 'unocss'
import transformerDirectives from '@unocss/transformer-directives'
import transformerVariantGroup from '@unocss/transformer-variant-group'
import presetTheme from 'unocss-preset-theme'
import type { Theme } from 'unocss/preset-uno'
import { customTheme } from './src/theme'

export default defineConfig({
  presets: [
    presetWind(),
    presetTheme<Theme>({
      theme: customTheme
    })
  ],
  transformers: [transformerDirectives(),transformerVariantGroup()],
  shortcuts: [
    {
      'window-bg-top': 'bg-c_wc-top',
      'window-bg-content': 'bg-gradient-to-br from-c_wc-ct via-c_wc-vCt to-c_wc-tCt',
      'window-bg-slider': 'bg-gradient-to-b from-c_wc-sd via-c_wc-vSd to-c_wc-tSd',
      'window-shadow-slider': 'shadow-[4px_0px_10px] shadow-c_sc-5',
      'window-bar-shadow': 'shadow-[2px_0px_6px_0px_rgba(255,255,255,1)] shadow-c_sc-6',
      'window-slider-width': 'w-14',
      'window-bar-height': 'h-10 lh-10',
    }
  ]
})
