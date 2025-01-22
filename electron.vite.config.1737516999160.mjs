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
import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
function generateCoreTypings(root) {
  console.log("\u67E5\u770B\uFF1Aroot", root);
  const corePluginPath = path.resolve(root, "src/manager/corePlugin.d.ts");
  const tsConfigPath = path.resolve(root, "tsconfig.web.json");
  const program = ts.createProgram([tsConfigPath], {});
  const checker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles().filter((sf) => sf.fileName.includes("plugins"));
  const coreImports = [];
  const coreExtensions = [];
  sourceFiles.forEach((sourceFile) => {
    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node)) {
        const extendsClause = node.heritageClauses?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword);
        if (extendsClause) {
          const extendsType = extendsClause.types[0].expression.getText();
          if (extendsType === "IPlugin") {
            const className = node.name?.getText();
            if (className) {
              const pluginName = className.charAt(0).toLowerCase() + className.slice(1);
              const relativePath = path.relative(path.resolve(root, "src/manager"), sourceFile.fileName).replace(/\\/g, "/");
              coreImports.push(`import { ${className} } from '../${relativePath}';`);
              coreExtensions.push(`    ${pluginName}: ${className};`);
            }
          }
        }
      }
    });
  });
  const coreTypingsContent = `
${coreImports.join("\n")}
import { Core } from './Core';

declare module './Core' {
  interface Core {
${coreExtensions.join("\n")}
  }
}
`;
  fs.writeFileSync(corePluginPath, coreTypingsContent);
}
function vitePluginCoreTypings() {
  return {
    name: "vite-plugin-core-typings",
    async buildStart() {
      const root = this.config.root || process.cwd();
      generateCoreTypings(root);
    },
    async buildEnd() {
      const root = this.config.root || process.cwd();
      generateCoreTypings(root);
    }
  };
}

// electron.vite.config.ts
var __electron_vite_injected_dirname = "F:\\01project\\nodejs\\electorn-learn-01";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      vitePluginCoreTypings()
    ],
    resolve: {
      alias: {
        "@main": resolve2(__electron_vite_injected_dirname, "src/main/src"),
        "@": resolve2(__electron_vite_injected_dirname, "./src"),
        "@resources": resolve2(__electron_vite_injected_dirname, "resources")
      }
    },
    publicDir: resolve2(__electron_vite_injected_dirname, "resources")
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve2(__electron_vite_injected_dirname, "src/renderer/src"),
        "@": resolve2(__electron_vite_injected_dirname, ".src")
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
          resolve2(__electron_vite_injected_dirname, "src/renderer/src/hooks")
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
