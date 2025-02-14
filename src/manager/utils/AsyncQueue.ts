type Task<T> = {
  fn: () => Promise<T>;
  priority: number;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
};

type PQueueOptions = {
  concurrency?: number;
  autoStart?: boolean;
};

type EventName = 'idle' | 'add' | 'next' | 'completed' | 'error';

export class AsyncQueue {
  private queue: Task<any>[];
  private pending: number;
  private concurrency: number;
  private isPaused: boolean;
  private eventListeners: Map<EventName, Set<Function>>;

  constructor(options: PQueueOptions = {}) {
    this.queue = [];
    this.pending = 0;
    this.concurrency = options.concurrency || 1;
    this.isPaused = options.autoStart === false;
    this.eventListeners = new Map();
  }

  private emit(event: EventName, ...args: any[]) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  on(event: EventName, listener: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)?.add(listener);
    return this;
  }

  add<T>(fn: () => Promise<T>, priority = 0): Promise<T> {
    return new Promise((resolve, reject) => {
      const task: Task<T> = { fn, priority, resolve, reject };

      // 根据优先级插入任务
      const index = this.queue.findIndex(t => t.priority < task.priority);
      if (index === -1) {
        this.queue.push(task);
      } else {
        this.queue.splice(index, 0, task);
      }

      this.emit('add');
      if (!this.isPaused) {
        this.next();
      }
    });
  }

  private next() {
    while (
      !this.isPaused &&
      this.pending < this.concurrency &&
      this.queue.length > 0
      ) {
      const task = this.queue.shift()!;
      this.pending++;
      this.emit('next');

      task.fn()
        .then(result => {
          task.resolve(result);
          this.emit('completed', result);
        })
        .catch(error => {
          task.reject(error);
          this.emit('error', error);
        })
        .finally(() => {
          this.pending--;
          this.checkIdle();
          this.next();
        });
    }
  }

  private checkIdle() {
    if (this.pending === 0 && this.queue.length === 0) {
      this.emit('idle');
    }
  }

  pause() {
    this.isPaused = true;
  }

  start() {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.next();
  }

  clear() {
    this.queue = [];
  }

  get size() {
    return this.queue.length;
  }

  get pendingCount() {
    return this.pending;
  }
}
