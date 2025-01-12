import { Manager } from './index'

type PluginHooks = {
  [key: string]: Function; // 插件钩子函数映射
};

type PluginCommunicate = {
  [key: string]: Function; // 插件通信函数映射
};

export interface IPlugin {
  name: string; // 插件名称
  init?: (manager: Manager) => void; // 初始化函数
  destroy?: (manager: Manager) => void; // 销毁函数
  hooks?: PluginHooks; // 自定义插件钩子函数集合
  communicate?: PluginCommunicate; // 通信函数集合

}

export interface EventListener {
  callback: Function; // 事件回调函数
  pluginName: string; // 事件所属插件名称
}
