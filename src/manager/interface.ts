import { Core } from './Core'

type PluginHooks = {
  [key: string]: Function; // 插件钩子函数映射
};

type PluginCommunicate = {
  [key: string]: Function; // 插件通信函数映射
};

/**
 * 插件接口
 * @interface
 * @property {string} name - 插件名称
 * @property {Function} [init] - 初始化函数
 * @property {Function} [destroy] - 销毁函数
 * @property {PluginHooks} [hooks] - 自定义插件钩子函数集合
 * @property {PluginCommunicate} [communicate] - 通信函数集合
 * @example
 * {
 *   name: 'examplePlugin',
 *   init: (manager) => {
 *     console.log('插件初始化');
 *     return instance
 *   }
 *   destroy: (manager) => {
 *     console.log('插件销毁');
 *   }
 *   hooks: {
 *     'someEvent': (data) => {
 *       console.log('插件接收到 someEvent', data);
 *     }
 *   }
 *   communicate: {
 *     'anotherEvent': (data) => {
 *       return `Hello, ${data}!`;
 *     }
 *   }
 * }
 */
export interface IPlugin {
  name: string; // 插件名称ID
  init: (manager: Core) => void; // 初始化函数
  destroy?: (manager: Core) => void; // 销毁函数
  hooks?: PluginHooks; // 自定义插件钩子函数集合
  communicate?: PluginCommunicate; // 通信函数集合

}

export interface EventListener {
  callback: Function; // 事件回调函数
  pluginName: string; // 事件所属插件名称
}

type PluginInstance = any; // 插件实例
