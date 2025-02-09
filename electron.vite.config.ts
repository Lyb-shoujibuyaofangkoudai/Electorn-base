import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import vueDevTools from 'vite-plugin-vue-devtools'
import vitePluginCoreTypings from './src/vitePlugins/vite-plugin-core-typings'
const minify = process.env.NODE_ENV !== 'development' // 打包后 process.env.NODE_ENV会是undefined
export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      vitePluginCoreTypings(resolve(__dirname,'src/manager/index.ts'))
    ],
    resolve: {
      alias: {
        '@main': resolve(__dirname,'src/main'),
        '@': resolve(__dirname,'./src'),
        '@resources': resolve(__dirname,'resources'),
        '@manager': resolve(__dirname,'src/manager'),
        "lol-tools.node": resolve(__dirname,'resources/addons/lol-tools.node'),
      }
    },
    publicDir: resolve(__dirname,'resources'),
    build: {
      minify
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      minify
    },
  },
  renderer: {
    build: {
      minify
    },
    resolve: {
      alias: {
        '@renderer': resolve(__dirname,'src/renderer/src'),
        '@manager': resolve('src/manager'),
        '@': resolve(__dirname,'.src')
      }
    },
    plugins: [
      vue(),
      vueDevTools(),
      AutoImport({
        imports: [
          {
            'naive-ui': [
              'useDialog',
              'useMessage',
              'useNotification',
              'useLoadingBar',
              'createDiscreteApi'
            ]
          },
          'vue',
          'vue-router',
          '@vueuse/core'
        ],
        dirs: [
          resolve(__dirname, 'src/renderer/src/hooks')
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      }),
      UnoCSS(),
    ],
    // 设置scss的api类型为modern-compiler
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler'
        }
      }
    }
  },
})
