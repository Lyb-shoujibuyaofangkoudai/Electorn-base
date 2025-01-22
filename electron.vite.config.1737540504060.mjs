// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import vueDevTools from "vite-plugin-vue-devtools";
var __electron_vite_injected_dirname = "F:\\01project\\nodejs\\electorn-learn-01";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin()
    ],
    resolve: {
      alias: {
        "@main": resolve(__electron_vite_injected_dirname, "src/main/src"),
        "@": resolve(__electron_vite_injected_dirname, "./src"),
        "@resources": resolve(__electron_vite_injected_dirname, "resources"),
        "@manager": resolve(__electron_vite_injected_dirname, "src/manager")
      }
    },
    publicDir: resolve(__electron_vite_injected_dirname, "resources")
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve(__electron_vite_injected_dirname, "src/renderer/src"),
        "@manager": resolve("src/manager"),
        "@": resolve(__electron_vite_injected_dirname, ".src")
      }
    },
    plugins: [
      vue(),
      UnoCSS(),
      vueDevTools(),
      AutoImport({
        imports: [
          {
            "naive-ui": [
              "useDialog",
              "useMessage",
              "useNotification",
              "useLoadingBar",
              "createDiscreteApi"
            ]
          },
          "vue",
          "vue-router"
        ],
        // vue3 组件 js 语句中自动引入组件
        resolvers: [NaiveUiResolver()],
        dirs: [
          resolve(__electron_vite_injected_dirname, "src/renderer/src/hooks")
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      })
    ],
    // 设置scss的api类型为modern-compiler
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler"
        }
      }
    }
  }
});
export {
  electron_vite_config_default as default
};
