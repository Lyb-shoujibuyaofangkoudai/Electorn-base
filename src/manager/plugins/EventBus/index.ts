import { EventEmitter } from 'events';
import { IPlugin } from '../../interface'
import { Core } from '../../Core'

// 封装的 EventEmitter 类
export class EventManager implements IPlugin {
  static id: string = 'eventManager'
  name = EventManager.id
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  init(core: Core): void {
    core[this.name] = core.getPlugin(this.name)
    core.emit(this.name,'eventManagerRegistered',this)
  }

  /**
   * 监听事件
   * @param eventName 事件名称
   * @param listener 事件回调函数
   */
  on(eventName: string, listener: (...args: any[]) => void): void {
    this.emitter.on(eventName, listener);
  }

  /**
   * 监听一次性事件
   * @param eventName 事件名称
   * @param listener 事件回调函数
   */
  once(eventName: string, listener: (...args: any[]) => void): void {
    this.emitter.once(eventName, listener);
  }

  /**
   * 触发事件
   * @param eventName 事件名称
   * @param args 传递给事件回调函数的参数
   */
  emit(eventName: string, ...args: any[]): boolean {
    return this.emitter.emit(eventName, ...args);
  }

  /**
   * 移除事件监听器
   * @param eventName 事件名称
   * @param listener 要移除的事件回调函数（可选）
   */
  off(eventName: string, listener?: (...args: any[]) => void): void {
    if (listener) {
      this.emitter.removeListener(eventName, listener);
    } else {
      this.emitter.removeAllListeners(eventName);
    }
  }

  /**
   * 获取某个事件的所有监听器
   * @param eventName 事件名称
   * @returns 监听器数组
   */
  listeners(eventName: string): Function[] {
    return this.emitter.listeners(eventName);
  }

  /**
   * 清空所有事件监听器
   */
  clearAllListeners(): void {
    this.emitter.removeAllListeners();
  }
}
