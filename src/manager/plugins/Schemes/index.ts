/**
 * 自定义协议 用于处理特殊资源
 *
 */
import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { protocol, session } from 'electron'
import { MainWindow } from '../../../main/windows/MainWindow'
import { Readable } from 'node:stream'


export class Schemes implements IPlugin {
  static id: string = 'schemes'
  name = Schemes.id
  private readonly _domainRegistry = new Map<
    string,
    (uri: string, req: Request) => Promise<Response> | Response
  >()

  static SCHEME_HEADER = 'yyy'
  _logger = Core.getInstance()?.logger

  init(core: Core): void {
    this.register()
    core[this.name] = core.getPlugin(this.name)
    core.emit('schemesRegistered',core)
  }

  destroy() {
    this._unhandlePartitionYYYProtocol(MainWindow.PARTITION_ID)
    // this._unhandlePartitionYYYProtocol(MainWindow.PARTITION_ID)
  }

  /**
   *
   * @param readableStream
   */
  static convertWebStreamToNodeStream(readableStream: ReadableStream) {
    const reader = readableStream.getReader()

    return Readable.from({
      async* [Symbol.asyncIterator]() {
        while ( true ) {
          try {
            const { done, value } = await reader.read()
            if ( done ) break
            yield value
          } catch {
            break
          }
        }
      }
    })
  }

  /**
   *  处理协议 这个方法需要在app.read后才能调用
   * @private
   */
  private handleProtocol() {
    this.handlePartitionYYYProtocol(MainWindow.PARTITION_ID)
    // this.handlePartitionYYYProtocol(MainWindow.PARTITION_ID)
  }

  private handlePartitionYYYProtocol(partition: string) {
    session
      .fromPartition(partition)
      .protocol.handle(Schemes.SCHEME_HEADER, async (req) => {
      const path1 = req.url.slice(`${ Schemes.SCHEME_HEADER }://`.length)
      const index = path1.indexOf('/')
      const domain = path1.slice(0, index).trim()
      const uri = path1.slice(index + 1).trim()
      const handler = this._domainRegistry.get(domain)
      if ( handler ) {
        return handler(uri, req)
      }

      return new Response(`No handler for ${ req.url }`, {
        statusText: 'Not Found',
        headers: { 'Content-Type': 'text/plain' },
        status: 404
      })
    })
  }

  private _unhandlePartitionYYYProtocol(partition: string) {
    session.fromPartition(partition).protocol.unhandle(Schemes.SCHEME_HEADER)
  }

  /**
   * 注册域名，用于代理
   * @param domain
   * @param handler
   */
  registerDomain(
    domain: string,
    handler: (uri: string, req: Request) => Promise<Response> | Response
  ) {
    if ( this._domainRegistry.has(domain) ) {
      throw new Error(`Domain ${ domain } is already registered`)
    }
    this._domainRegistry.set(domain, handler)
  }

  /**
   * 注册自定义协议
   * 该方法用于在 Electron 应用中注册自定义协议，并为该协议启用一系列特权
   */
  register() {
    // 使用 protocol.registerSchemesAsPrivileged 方法注册自定义协议
    this._logger?.info('注册自定义协议成功',this.name)
    protocol.registerSchemesAsPrivileged([
      {
        // 指定自定义协议的名称
        scheme: Schemes.SCHEME_HEADER,
        // 定义自定义协议的特权
        privileges: {
          // 表示该协议是标准协议，遵循标准的 URL 解析规则
          standard: true,
          // 表示该协议是安全的，通常用于 HTTPS 协议
          secure: true,
          // 表示该协议支持 Fetch API，允许使用 fetch 方法进行网络请求
          supportFetchAPI: true,
          // 表示该协议启用了跨源资源共享（CORS），允许跨域请求
          corsEnabled: true,
          // 表示该协议支持流式传输，适用于处理大文件或实时数据
          stream: true,
          // 表示该协议可以绕过内容安全策略（CSP），允许加载不受信任的资源
          bypassCSP: true
        }
      }
    ])
  }


}
