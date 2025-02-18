// pluginSystem.ts
import { EventListener, IPlugin } from './interface'

export class Core {
  static instance: Core;
  private plugins: Map<string, IPlugin> = new Map(); // 存储已加载插件的映射
  private listeners: Map<string, EventListener[]> = new Map(); // 存储事件监听器的映射
  private services: Map<string, Function> = new Map(); // 存储服务的映射
  private _emits: Map<string, any> = new Map();

  /**
   * 返回单例
   * @returns {Core & any}
   */
  public static getInstance(): Core {
    if (!Core.instance) {
      Core.instance = new Core();
    }
    return Core.instance;
  }

  constructor() {
    if(!Core.instance)
      Core.instance = this;
  }

  run() {
    // 插件初始化
    for (const plugin of this.plugins.values()) {
      if (plugin.init) {
        plugin.init(this);
        if (plugin.hooks) {
          for (const [event, handler] of Object.entries(plugin.hooks)) {
            this.on(event, handler, plugin.name);
          }
        }
        if (plugin.communicate) {
          for (const [service, handler] of Object.entries(plugin.communicate)) {
            this.services.set(`${plugin.name}.${service}`, handler); // 将服务注册到服务管理器中
          }
        }

      } else {
        throw `${plugin.name}插件不存在初始化init函数`
      }
    }

    for ( const [event,data] of this._emits ) {
      const listeners = this.listeners.get(event);
      if (listeners) {
        listeners.forEach(listener => listener.callback(data));
      }
    }
  }

  // 加载插件
  use(...plugins: IPlugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  register(plugin: IPlugin) {
    if (this.plugins.has(plugin.name)) {
      throw new Error(`插件 ${plugin.name} 已经被加载。`);
    }
    this.plugins.set(plugin.name, plugin); // 将插件添加到映射中

    // if (plugin.init) {
    //   plugin.init(this);
    // } else {
    //   throw `${plugin.name}插件不存在初始化init函数`
    // }
    // console.log("是否存在plugin.hooks钩子：",plugin)
    // 注册钩子函数
    // if (plugin.hooks) {
    //   for (const [event, handler] of Object.entries(plugin.hooks)) {
    //     this.on(event, handler, plugin.name);
    //     if(this._emits.has(event)) {
    //       handler(this._emits.get(event))
    //       this._emits.delete(event)
    //     }
    //   }
    //
    // }

    // 注册通信处理器
    // if (plugin.communicate) {
    //   for (const [service, handler] of Object.entries(plugin.communicate)) {
    //     this.services.set(`${plugin.name}.${service}`, handler); // 将服务注册到服务管理器中
    //   }
    // }

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

    // 删除插件的服务
    this.services.forEach((service, key) => {
      if (key.startsWith(`${pluginName}.`)) {
        this.services.delete(key);
      }
    });

    // 如果插件提供了销毁函数，则调用它
    if (plugin.destroy) {
      plugin.destroy(this);
    }

    this.plugins.delete(pluginName); // 从映射中删除插件
  }

  getPlugin(pluginId: string): any {
    return this.plugins.get(pluginId);
  }

  // 注册事件监听器
  on(event: string, callback: Function, pluginName: string): void {
    // console.log("监听事件：",event,pluginName,this)
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push({ callback, pluginName });
  }

  // 触发事件
  emit( pluginName: string,event: string, data?: any): void {
    const listeners = this.listeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener.callback(data));
    } else {
      // todo: 这里可能还有问题
      this._emits.set(event,data)
    }
  }

  // 控制反转的占位函数
  invertControl(methodName: string, ...args: any[]): any {
    // 实际的控制反转实现将依赖于PluginSystem中的方法。
    return this[methodName](...args);
  }

  // 调用服务
  callService(serviceName: string, ...args: any[]): any {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`服务 ${serviceName} 未被注册。`);
    }
    return service(...args);
  }
}
