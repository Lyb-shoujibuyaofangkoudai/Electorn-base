import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { EventManager } from '../EventBus'
import { CmdParsedType, League } from '../League'
import Request from '../../utils/request'
import https from 'node:https'
import { EVENT_BUS_TYPE } from '../Bridge/eventType'
import { Logger } from '../logger/Logger'
import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'
import { AxiosRequestConfig } from 'axios'
import { Schemes } from '../Schemes'
import { LeagueClientLcuUninitializedError } from '../LeagueMainHelper'


export class SgpRendererApi implements IPlugin {
  static id: string = 'sgpMainHelper'
  name = SgpRendererApi.id
  _league:League | null = null
  _request: Request | null = null
  _logger: Logger | null = null
  init(core: Core): void {
    try {
      core[this.name] = core.getPlugin(this.name)
    } catch ( e ) {
      throw e
    }
  }

  hooks = {

    leagueRegistered: (league:League) => {
      this._league = league
    },
    leagueConnSuccess: (auth:CmdParsedType) => {
      this._request = new Request({
        baseURL: `${import.meta.env.VITE_BASE_HOST}:${auth.riotClientPort}`,
        headers: {
          'Authorization': `Basic ${Buffer.from(`riot:${auth.riotClientAuthToken}`).toString('base64')}`
        },
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
      })
    },
    schemesRegistered: (core:Core) => {
      this.proxyYYYSgpClientFromRenderer(core)
    },
  }
  async request<T = any, D = any>(config: AxiosRequestConfig<D>) {
    if (!this._request) {
      throw new Error('RC Uninitialized')
    }

    return this._request!.http.request<T>(config)
  }
  proxyYYYSgpClientFromRenderer(core: Core) {
    if ( !core.schemes ) {
      if ( core?.logger ) {
        core?.logger?.error('代理渲染进程通过axios发送过来的请求（yyy://lol-client）失败，未找到Schemes插件', LOGGER_NAMESPACE.APP)
      } else {
        console.error('代理渲染进程通过axios发送过来的请求（yyy://lol-client）失败，未找到Schemes插件')
      }
      return
    }
    core.schemes.registerDomain(import.meta.env.VITE_CUS_SCHEME_RIOT_DOMAIN, async (uri:string, req:any):Promise<any> => {
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
        return this.handleResponse(res)

      } catch ( e ) {

        return new Response((e as Error).message, {
          headers: { 'Content-Type': 'text/plain' },
          status: 500
        })
      }
    })
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
}
