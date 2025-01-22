// 头todo： src/vitePlugins/vite-plugin-core-typings.ts
import { Plugin } from 'vite';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// 生成 corePlugin.d.ts 文件的函数
function generateCoreTypings(root: string) {
  console.log("传入的root", root);

  // 定义 corePlugin.d.ts 文件的路径
  const corePluginPath = path.resolve(root, 'src/manager/corePlugin.d.ts');
  // 定义 tsconfig.json 文件的路径
  const tsConfigPath = path.resolve(root, 'tsconfig.json');

  // 创建 TypeScript 编译程序
  const program = ts.createProgram([tsConfigPath], {});
  // 获取类型检查器
  const checker = program.getTypeChecker();

  // 定义 manager/index.ts 文件的路径
  const managerIndexPath = path.resolve(root, 'src/manager/index.ts');
  console.log("查看managerIndexPath：", managerIndexPath);

  // 获取 manager/index.ts 文件的源文件对象
  const managerIndexFile = program.getSourceFile(managerIndexPath);
  console.log("查看managerIndexFile：", managerIndexFile);

  // 如果 manager/index.ts 文件不存在，输出错误信息并返回
  if (!managerIndexFile) {
    console.error('[vite-plugin-core-typings] manager/index.ts not found');
    return;
  }

  // 存储导入语句的数组
  const coreImports: string[] = [];
  // 存储 Core 类扩展属性的数组
  const coreExtensions: string[] = [];


  // 生成 corePlugin.d.ts 文件的内容
  const coreTypingsContent = `
${coreImports.join('\n')}
import { Core } from './Core';

declare module './Core' {
  interface Core {
${coreExtensions.join('\n')}
  }
}
`;

  // 将生成的内容写入 corePlugin.d.ts 文件
  fs.writeFileSync(corePluginPath, coreTypingsContent);
}

// 导出 Vite 插件
export default function vitePluginCoreTypings(): Plugin {
  let root: string;

  return {
    name: 'vite-plugin-core-typings',
    // 在配置解析完成后获取 root 路径
    configResolved(config) {
      root = config.root;
    },
    // 在构建开始时生成类型定义
    buildStart() {
      if (root) {
        generateCoreTypings(root);
      } else {
        console.error('[vite-plugin-core-typings] Root path is not defined');
      }
    },
    // 在构建结束时再次生成类型定义
    buildEnd() {
      if (root) {
        generateCoreTypings(root);
      } else {
        console.error('[vite-plugin-core-typings] Root path is not defined');
      }
    },
  };
}
