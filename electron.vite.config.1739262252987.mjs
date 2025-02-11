// electron.vite.config.ts
import { resolve as resolve2 } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import UnoCSS from "unocss/vite";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { NaiveUiResolver } from "unplugin-vue-components/resolvers";
import vueDevTools from "vite-plugin-vue-devtools";

// src/vitePlugins/vite-plugin-core-typings.ts
import * as fs from "fs";
import * as path from "path";
function pascalToCamelCase(str) {
  return str.charAt(0).toLowerCase() + str.slice(1);
}
function findCoreAndGetUseFnClassNameAndImportPath(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    const coreDeclarationRegex = /(?:const|let)\s+(\w+)\s*=\s*new Core\(\)/;
    const coreDeclarationMatch = data.match(coreDeclarationRegex);
    if (coreDeclarationMatch) {
      const coreVariableName = coreDeclarationMatch[1];
      const loggerUsageRegex = new RegExp(`${coreVariableName}\\.use\\(new (\\w+)\\(\\)\\)`, "g");
      const loggerClassNames = [];
      const r = data.match(loggerUsageRegex);
      if (r?.length) {
        for (const str of r) {
          loggerUsageRegex.lastIndex = 0;
          const matchResult = loggerUsageRegex.exec(str);
          matchResult !== null && loggerClassNames.push(matchResult[1]);
        }
      }
      if (loggerClassNames.length > 0) {
        const importPaths = [];
        const coreInitFileDir = path.dirname(filePath);
        loggerClassNames.forEach((className) => {
          const importRegex = new RegExp(`import { ${className} } from '([^']+)'`);
          const match = data.match(importRegex);
          if (match) {
            const relativePath = match[1];
            const absolutePath = path.resolve(coreInitFileDir, relativePath);
            importPaths.push(absolutePath);
          }
        });
        return { coreVariableName, loggerClassNames, importPaths };
      } else {
        console.log(`\u672A\u627E\u5230\u4F7F\u7528\u4E86Core\u7684use\u65B9\u6CD5`);
      }
    } else {
      console.log('\u672A\u627E\u5230 "new Core()" \u7684\u58F0\u660E');
    }
  } catch (err) {
    console.error("\u8BFB\u53D6\u6587\u4EF6\u65F6\u51FA\u9519:", err);
  }
  return { coreVariableName: null, loggerClassNames: [], importPaths: [] };
}
function generateCoreTypings(root, coreInitFilePath) {
  const {
    loggerClassNames,
    importPaths
  } = findCoreAndGetUseFnClassNameAndImportPath(coreInitFilePath);
  if (!loggerClassNames.length) return;
  const coreInitFileDir = path.dirname(coreInitFilePath);
  const corePluginPath = path.resolve(coreInitFileDir, "corePlugin.d.ts");
  const importExtensions = [];
  const coreExtensions = [];
  importPaths.forEach((importPath, index) => {
    importExtensions.push(`import ${loggerClassNames[index]} from "${"./" + path.relative(coreInitFileDir, importPath).replace(/\\/g, "/")}"`);
    coreExtensions.push(`${pascalToCamelCase(loggerClassNames[index])}: ${loggerClassNames[index]};`);
  });
  const coreTypingsContent = `
${importExtensions.join("\n")}
import { Core } from './Core';

declare module './Core' {
  interface Core {
    ${coreExtensions.join("\n		")}
  }
}
`;
  fs.writeFile(corePluginPath, coreTypingsContent, "utf8", (err) => {
    if (err) {
      console.error("\u5199\u5165\u5185\u5BB9\u5931\u8D25\uFF1A", err);
    }
  });
}
function vitePluginCoreTypings(coreInitFilePath) {
  let root;
  return {
    name: "vite-plugin-core-typings",
    // 在配置解析完成后获取 root 路径
    configResolved(config) {
      root = config.root;
    },
    // 在构建开始时生成类型定义
    buildStart() {
      if (root) {
        generateCoreTypings(root, coreInitFilePath);
      } else {
        console.error("[vite-plugin-core-typings] Root path is not defined");
      }
    },
    // 在构建结束时再次生成类型定义
    buildEnd() {
      if (root) {
        generateCoreTypings(root, coreInitFilePath);
      } else {
        console.error("[vite-plugin-core-typings] Root path is not defined");
      }
    }
  };
}

// electron.vite.config.ts
var __electron_vite_injected_dirname = "F:\\01project\\nodejs\\electorn-learn-01";
var minify = process.env.NODE_ENV !== "development";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      vitePluginCoreTypings(resolve2(__electron_vite_injected_dirname, "src/manager/index.ts"))
    ],
    resolve: {
      alias: {
        "@main": resolve2(__electron_vite_injected_dirname, "src/main"),
        "@": resolve2(__electron_vite_injected_dirname, "./src"),
        "@resources": resolve2(__electron_vite_injected_dirname, "resources"),
        "@manager": resolve2(__electron_vite_injected_dirname, "src/manager"),
        "lol-tools.node": resolve2(__electron_vite_injected_dirname, "resources/addons/lol-tools.node")
      }
    },
    publicDir: resolve2(__electron_vite_injected_dirname, "resources"),
    build: {
      minify
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    build: {
      minify
    }
  },
  renderer: {
    build: {
      minify
    },
    resolve: {
      alias: {
        "@renderer": resolve2(__electron_vite_injected_dirname, "src/renderer/src"),
        "@manager": resolve2("src/manager"),
        "@": resolve2(__electron_vite_injected_dirname, ".src")
      }
    },
    plugins: [
      vue(),
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
          "vue-router",
          "@vueuse/core",
          "pinia"
        ],
        dirs: [
          resolve2(__electron_vite_injected_dirname, "src/renderer/src/hooks")
        ]
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      }),
      UnoCSS()
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
