// 头todo： src/vitePlugins/vite-plugin-core-typings.ts
import { Plugin } from 'vite'
import * as fs from 'fs'
import * as path from 'path'

function pascalToCamelCase(str: string): string {
  // 将字符串的第一个字符转换为小写，并与剩余部分拼接
  return str.charAt(0).toLowerCase() + str.slice(1);
}


/**
 * 获取 Core 函数初始化文件路径，并返回使用了如 core.use(new Logger()) 的Logger类名和对应的导入路径(绝对路径)
 *
 * @param filePath
 */
function findCoreAndGetUseFnClassNameAndImportPath(filePath: string): {
  coreVariableName: string | null,
  loggerClassNames: string[]
  importPaths: string[]
} {
  try {
    // 读取文件内容
    const data = fs.readFileSync(filePath, 'utf8')
    // 匹配包含 'new Core()' 的行，并提取变量名
    const coreDeclarationRegex = /(?:const|let)\s+(\w+)\s*=\s*new Core\(\)/
    const coreDeclarationMatch = data.match(coreDeclarationRegex)
    if ( coreDeclarationMatch ) {
      const coreVariableName = coreDeclarationMatch[1]
      // 构建匹配 core.use(new Logger()) 的正则表达式
      // const loggerUsageRegex = new RegExp(`${coreVariableName}\\.use\\(new (\\w+)\\(\\)\\)`, 'g')
      const loggerUsageRegex = new RegExp(`${coreVariableName}\\.use\\(new\\s+(\\w+)`, 'g')
      const loggerClassNames: string[] = []
      const r = data.match(loggerUsageRegex)
      if ( r?.length ) {
        for ( const str of r ) {
          loggerUsageRegex.lastIndex = 0 // 重置正则表达式的 lastIndex 属性 不然每次调用 exec 方法后，lastIndex 属性会更新为上一次匹配结束的位置导致结果不正确
          const matchResult = loggerUsageRegex.exec(str)
          matchResult !== null && loggerClassNames.push(matchResult[1])
        }
      }
      if ( loggerClassNames.length > 0 ) {
        // 存储类名和对应绝对路径的对象
        const importPaths:string[] = []
        const coreInitFileDir = path.dirname(filePath)
        // 遍历类名数组
        loggerClassNames.forEach((className) => {
          // 构建匹配导入语句的正则表达式
          const importRegex = new RegExp(`import { ${className} } from '([^']+)'`)
          const match = data.match(importRegex)
          if ( match ) {
            const relativePath = match[1]
            // 将相对路径转换为绝对路径
            const absolutePath = path.resolve(coreInitFileDir, relativePath)
            importPaths.push(absolutePath)
          }
        })

        return { coreVariableName, loggerClassNames,importPaths }
      } else {
        console.log(`未找到使用了Core的use方法`)
      }
    } else {
      console.log('未找到 "new Core()" 的声明')
    }
  } catch ( err ) {
    console.error('读取文件时出错:', err)
  }

  return { coreVariableName: null, loggerClassNames: [],importPaths:[] }
}


// 生成 corePlugin.d.ts 文件的函数
function generateCoreTypings(root: string, coreInitFilePath: string) {
  const {
    loggerClassNames,
    importPaths
  } = findCoreAndGetUseFnClassNameAndImportPath(coreInitFilePath)
  if ( !loggerClassNames.length ) return
  // 提取coreInitFilePath文件路径的父级文件夹路径
  const coreInitFileDir = path.dirname(coreInitFilePath)
  // 定义 corePlugin.d.ts 文件的路径
  const corePluginPath = path.resolve(coreInitFileDir, 'corePlugin.d.ts')

  const importExtensions: string[] = []
  const coreExtensions: string[] = []
  importPaths.forEach((importPath, index) => {
    // 绝对路径转相对路径
    importExtensions.push(`import ${loggerClassNames[index]} from "${'./'+path.relative(coreInitFileDir,importPath).replace(/\\/g, '/')}"`)
    coreExtensions.push(`${ pascalToCamelCase(loggerClassNames[index]) }?: ${ loggerClassNames[index] };`)
  })

  // 生成 corePlugin.d.ts 文件的内容
  const coreTypingsContent = `
${ importExtensions.join('\n') }
import { Core } from './Core';

declare module './Core' {
  interface Core {
    ${ coreExtensions.join('\n\t\t') }
  }
}
`
  // 将生成的内容写入 corePlugin.d.ts 文件
  fs.writeFile(corePluginPath, coreTypingsContent,'utf8', (err) => {
    if (err) {
      console.error("写入内容失败：", err);
    }
  });
}

/**
 * 导出 vite-plugin-core-typings 插件
 * 注意：
 * 1.在初始化Core类后，如果有多个插件添加到Core类中，需要依次使用use方法添加，不让正则无法匹配，如：core.use(new Logger())则可以匹配，如果是core.use(new Logger(),new Config())则无法匹配
 * 2.在实现插件时需要将类名小写挂在到Core类中，对应Core的接口init方法
 *
 * @param coreInitFilePath Core函数初始化文件路径
 */
export default function vitePluginCoreTypings(coreInitFilePath: string): Plugin {
  let root: string

  return {
    name: 'vite-plugin-core-typings',
    // 在配置解析完成后获取 root 路径
    configResolved(config) {
      root = config.root
    },
    // 在构建开始时生成类型定义
    buildStart() {
      if ( root ) {
        generateCoreTypings(root, coreInitFilePath)
      } else {
        console.error('[vite-plugin-core-typings] Root path is not defined')
      }
    },
    // 在构建结束时再次生成类型定义
    buildEnd() {
      if ( root ) {
        generateCoreTypings(root, coreInitFilePath)
      } else {
        console.error('[vite-plugin-core-typings] Root path is not defined')
      }
    }
  }
}
