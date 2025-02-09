import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { AxiosRequestConfig } from 'axios'
import { Schemes } from '../Schemes'
import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'
import Request from '../../utils/request'
import https from 'node:https'
import { CmdParsedType, League } from '../League'
import { Logger } from '../logger/Logger'
import { MainIpcHandle } from '../../../main/utils/MainIpcHandle'


export class LeagueClientLcuUninitializedError extends Error {
  name = 'LeagueClientLcuUninitializedError'
}

/**
 * 主要用于请求LOL客户端的API
 */
export class LeagueMainHelper implements IPlugin {
  static id: string = 'leagueMainHelper'
  name = LeagueMainHelper.id
  _request: Request | null = null
  _logger: Logger | null = null

  init(core: Core): void {
    try {
      // console.log('初始化LeagueMainHelper插件', core, this.name)
      core[this.name] = core.getPlugin(this.name)
    } catch ( e ) {
      console.log('初始化LeagueMainHelper插件失败', e)
    }
  }

  hooks = {
    loggerRegistered: (logger) => {
      this._logger = logger
    },
    leagueConnSuccess: (auth:CmdParsedType) => {
      console.log('连接LOL客户端成功', auth,MainIpcHandle.getInstance())
      this._logger?.info('连接LOL客户端成功', LOGGER_NAMESPACE.APP)
      MainIpcHandle.getInstance().leagueHandle()
      this._request = new Request({
        baseURL: `${import.meta.env.VITE_BASE_HOST}:${auth.port}`,
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
          keepAlive: true,
          maxCachedSessions: 2048,
          maxFreeSockets: 1024
        }),
        httpAgent: new https.Agent({
          keepAlive: true,
          maxFreeSockets: 1024
        }),
        timeout: 10000, // 设置超时时间
        headers: {
          'Authorization': `Basic ${Buffer.from(`riot:${auth.authToken}`).toString('base64')}`
        },
        auth: {
          username: import.meta.env.VITE_RIOT,
          password: auth.authToken,
        },
      })
    },
    schemesRegistered: (core:Core) => {
      this.proxyYYYLolClientFromRenderer(core)
    },
  }

  request<T = any, D = any>(config: AxiosRequestConfig<D>) {
    if (!this._request) {
      throw new LeagueClientLcuUninitializedError()
    }

    if (config.url && config.url.startsWith('lol-game-data/assets')) {
      // todo：处理游戏静态数据，图片等资源
      return this._request!.http.request<T>(config)
    } else {
      return this._request!.http.request<T>(config)
    }
  }

  /**
   * 代理渲染进程通过axios发送过来的请求（yyy://lol-client）
   * 流程：
   * 1.注册自定义协议（yyy），通过Schemes插件注册
   * 2.通过Schemes插件的registerDomain方法拦截域名（lol-client）
   * 2.渲染进程发送请求（yyy://lol-client）
   * 3.通过Schemes插件的handleProtocol方法拦截请求 进行代理
   * 4.通过Schemes插件的convertWebStreamToNodeStream方法将请求体转换为node流
   * 5.通过LeagueMainHelper的request方法发送请求（这里在主进程中发送请求）
   * 6.通过Schemes插件的convertWebStreamToNodeStream方法将响应体转换为web流
   *
   */
  proxyYYYLolClientFromRenderer(core: Core) {
    if ( !core.schemes ) {
      if ( core?.logger ) {
        core?.logger?.error('代理渲染进程通过axios发送过来的请求（yyy://lol-client）失败，未找到Schemes插件', LOGGER_NAMESPACE.APP)
      } else {
        console.error('代理渲染进程通过axios发送过来的请求（yyy://lol-client）失败，未找到Schemes插件')
      }
      return
    }
    core.schemes.registerDomain('lol-client', async (uri:string, req:any):Promise<any> => {
      try {
        const reqHeaders: Record<string, string> = {}
        req.headers.forEach((value, key) => {
          reqHeaders[key] = value
        })
        const config: AxiosRequestConfig = {
          method: req.method,
          url: uri,
          data: req.body ? Schemes.convertWebStreamToNodeStream(req.body) : undefined,
          validateStatus: () => true,
          responseType: 'stream',
          headers: reqHeaders
        }
        const res:any = await this.request(config)
        const resHeaders: any = Object.fromEntries(
          Object.entries(res.headers).filter(([ _, value ]) => typeof value === 'string')
        )

        return new Response(res.status === 204 || res.status === 304 ? null : res.data, {
          statusText: res.statusText,
          headers: resHeaders,
          status: res.status
        })
      } catch ( e ) {

        if (e instanceof LeagueClientLcuUninitializedError) {
          return new Response(JSON.stringify({ error: e.name }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          })
        }

        return new Response((e as Error).message, {
          headers: { 'Content-Type': 'text/plain' },
          status: 500
        })
      }
    })
  }
}
