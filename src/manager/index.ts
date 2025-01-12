// pluginSystem.ts
import { EventListener, IPlugin } from './interface'

export class Manager {
  private plugins: Map<string, IPlugin> = new Map(); // 存储已加载插件的映射
  private listeners: Map<string, EventListener[]> = new Map(); // 存储事件监听器的映射

  // 加载插件
  use(...plugins: IPlugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  register(plugin:IPlugin){
    if (this.plugins.has(plugin.name)) {
      throw new Error(`插件 ${plugin.name} 已经被加载。`);
    }

    // 如果插件提供了初始化函数，则调用它
    if (plugin.init) {
      plugin.init(this);
    }

    // 注册钩子函数
    if (plugin.hooks) {
      for (const [event, handler] of Object.entries(plugin.hooks)) {
        this.on(event, handler, plugin.name);
      }
    }

    // 注册通信处理器
    if (plugin.communicate) {
      for (const [event, handler] of Object.entries(plugin.communicate)) {
        this.on(event, handler, plugin.name);
      }
    }

    this.plugins.set(plugin.name, plugin); // 将插件添加到映射中
  }

  // 卸载插件
  removePlugin(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (!plugin) {
      throw new Error(`插件 ${pluginName} 未被加载。`);
    }

    // 注销钩子和通信处理器
    this.listeners.forEach((listeners, event) => {
      this.listeners.set(event, listeners.filter(l => l.pluginName !== pluginName));
    });

    // 如果插件提供了销毁函数，则调用它
    if (plugin.destroy) {
      plugin.destroy(this);
    }

    this.plugins.delete(pluginName); // 从映射中删除插件
  }

  // 注册事件监听器
  on(event: string, callback: Function, pluginName: string): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push({ callback, pluginName });
  }

  // 触发事件
  emit(event: string, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener.callback(data));
    }
  }

  // 控制反转的占位函数
  invertControl(methodName: string, ...args: any[]): any {
    // 实际的控制反转实现将依赖于PluginSystem中的方法。
    return this[methodName](...args);
  }
}

// 示例用法
const pluginSystem = new Manager();

// 示例插件
const examplePlugin: IPlugin = {
  name: 'examplePlugin',
  init: (system) => {
    console.log('示例插件初始化');
  },
  destroy: (system) => {
    console.log('示例插件销毁');
  },
  hooks: {
    'someEvent': (data) => {
      console.log('示例插件接收到 someEvent', data);
    }
  },
  communicate: {
    'anotherEvent': (data) => {
      console.log('示例插件接收到 anotherEvent', data);
    }
  }
};

// 加载插件
pluginSystem.use(examplePlugin);

// 触发事件
pluginSystem.emit('someEvent', { message: '来自插件系统的问候' });

// 卸载插件
pluginSystem.removePlugin('examplePlugin');
