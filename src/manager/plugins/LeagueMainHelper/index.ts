import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { AxiosRequestConfig } from 'axios'
import { Schemes } from '../Schemes'
import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'
import Request from '../../utils/request'
import https from 'node:https'
import { CmdParsedType, League } from '../League'
import { Logger } from '../logger/Logger'
// import PQueue from 'p-queue'
import { AsyncQueue } from "../../utils/AsyncQueue"
import { MainIpcHandle } from '../../../main/utils/MainIpcHandle'
import { EventManager } from '../EventBus'
import { EVENT_BUS_TYPE } from '../Bridge/eventType'
import { LeagueClientHttpApi } from '../../api/leagueCilent'


export class LeagueClientLcuUninitializedError extends Error {
  name = 'LeagueClientLcuUninitializedError'
}

/**
 * 主要用于请求LOL客户端的API
 */
export class LeagueMainHelper implements IPlugin {
  static id: string = 'leagueMainHelper'
  name = LeagueMainHelper.id
  _league:League | null = null
  _request: Request | null = null
  _logger: Logger | null = null
  _assetLimiter:AsyncQueue = new AsyncQueue({
    concurrency: 10, // 最大并发数
  })
  _eventManager: EventManager | null = null
  _lcuAPICanUse:boolean = false
  // 暂存 等待lcu api接口可用后的请求
  _axiosLinks:AsyncQueue =  new AsyncQueue({
    concurrency: 10, // 最大并发数
    autoStart: false, // 自动启动
  })


  init(core: Core): void {
    try {
      core[this.name] = core.getPlugin(this.name)
    } catch ( e ) {
      // this._logger?.error(`初始化LeagueMainHelper插件失败：${e}`, )
    }
  }

  hooks = {
    eventManagerRegistered: (eventManager:EventManager) => {
      this._eventManager = eventManager
    },
    leagueRegistered: (league:League) => {
      this._league = league
    },
    leagueConnSuccess: (auth:CmdParsedType) => {
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
      this._eventManager!.emit(EVENT_BUS_TYPE.LOL_CONN_SUCCESS)
      this.loopCheckLCUApiCanUse()
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
      return this._limitedRequest(config, this._assetLimiter)
      // return this._request!.http.request<T>(config)
    } else {
      return this._request!.http.request<T>(config)
    }
  }

  /**
   * 限制请求并发数
   * @param config
   * @param limiter
   * @private
   */
  private async _limitedRequest<T = any, D = any>(config: AxiosRequestConfig<D>, limiter: AsyncQueue) {
    const res = await limiter.add(() => this._request!.http.request<T>(config))

    if (!res) {
      throw new Error('asset request failed')
    }

    return res
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
    core.schemes.registerDomain(import.meta.env.VITE_CUS_SCHEME_LCU_DOMAIN, async (uri:string, req:any):Promise<any> => {
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
        if(this._lcuAPICanUse) {
          const res:any = await this.request(config)
          return this.handleResponse(res)
        } else {
          // this._logger.warn('检测lcu api 接口是否可用中...')
          const res = await this._axiosLinks.add(() => this.request(config))
          return this.handleResponse(res)
        }

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
    // this._logger?.info('代理渲染进程通过axios发送过来的请求（yyy://lol-client）', LOGGER_NAMESPACE.APP)
  }

  handleResponse(res:any) {
    const resHeaders: any = Object.fromEntries(
      Object.entries(res.headers).filter(([ _, value ]) => typeof value === 'string')
    )
    return new Response(res.status === 204 || res.status === 304 ? null : res.data, {
      statusText: res.statusText,
      headers: resHeaders,
      status: res.status
    })
  }

  /**
   * 循环检测lcu api接口是否可用
   *
   */
  loopCheckLCUApiCanUse() {
    const timer = setInterval(async() => {
      try {
        if ( !this._league?.cmdParsedInfo ) return
        const res = await LeagueClientHttpApi.getInstance(this._request!.http).summoner.getCurrentSummoner()
        if(res.status === 200) {
          this._logger?.info(`LCU API接口检测完毕,可用`)
          this._lcuAPICanUse = true
          this._axiosLinks.start()
          clearInterval(timer)
          Core.getInstance().emit(this.name,'leagueMainHelperInit',LeagueClientHttpApi.getInstance(this._request!.http))
        }
      } catch ( e ) {
        throw new Error(`尝试lcu接口连通性请求失败：${e}`)
      }
    },1000)
  }
}
