import sgpServersMap from '../../../../resources/sgp/mh-sgp-servers.json?commonjs-external&asset'
import fs from 'node:fs'
import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { SgpApi } from '../../api/sgp/SgpApi'
import { LeagueClientHttpApi } from '../../api/leagueCilent'
import { Schemes } from '../Schemes'
import { LOGGER_NAMESPACE } from '../Bridge/bridgeType'
import { LeagueClientLcuUninitializedError } from '../LeagueMainHelper'
import { parseUrlParams } from '../../utils/utils'
import { getExpirationTime } from '../../utils/jwtUtils'
import { Logger } from '../logger/Logger'
import { isAxiosError } from 'axios'


export class SgpMainHelper implements IPlugin {
  static id: string = 'sgpMainHelper'
  name = SgpMainHelper.id
  static _instance: SgpMainHelper
  _logger:Logger = Core.getInstance()?.logger
  _sgpApi: SgpApi
  _lcuHttpApi: LeagueClientHttpApi | null = null

  static getInstance() {
    if ( !SgpMainHelper._instance ) {
      SgpMainHelper._instance = new SgpMainHelper()
    }
    return SgpMainHelper._instance
  }

  constructor() {
    this._sgpApi = new SgpApi()

  }


  async init(core: Core) {
    core[this.name] = core.getPlugin(this.name)
    await this._loadAvailableServersFromLocalFile()

  }

  hooks = {
    leagueMainHelperInit: async (lcuHttpApi: LeagueClientHttpApi) => {
      try {
        this._lcuHttpApi = lcuHttpApi
        await this._saveEntTokenAndLeagueSession()
      } catch ( e ) {
        console.log('请求有问题：', e)
        this._logger.error(`获取 Entitlements Token 和 League Session Token 失败：${ e }`, LOGGER_NAMESPACE.APP)
      }
    },
    schemesRegistered: (core:Core) => {
      this.proxyYYYSgpClientFromRenderer(core)
    },

  }

  /**
   * 从本地文件加载 SGP 服务器配置
   * @private
   */
  private async _loadAvailableServersFromLocalFile() {
    try {
      if ( fs.existsSync(sgpServersMap) ) {
        const data = await fs.promises.readFile(sgpServersMap, 'utf-8')
        this._logger.info(`从本地文件加载 SGP 服务器配置成功`, LOGGER_NAMESPACE.APP)
        this._sgpApi.setAvailableSgpServers(JSON.parse(data))
      }

    } catch ( error ) {
      this._logger.error(`未找到内置的 SGP 服务器配置文件：${error}`, LOGGER_NAMESPACE.APP)
    }
  }

  /**
   * 获取 entitlementsToken 和 leagueSessionToken
   * @param lcuHttpApi
   * @private
   */
  private _getEntTokenAndAndLeagueSession(lcuHttpApi: LeagueClientHttpApi) {
    const promiseArr: any[] = []
    promiseArr.push(
      lcuHttpApi.entitlements.getEntitlementsToken(),
      lcuHttpApi.lolLeagueSession.getLolLeagueSessionToken()
    )

    return Promise.allSettled(promiseArr)
  }

  async _saveEntTokenAndLeagueSession() {
    const lcuHttpApi = this._lcuHttpApi
    const [ entTokenRes, leagueSessionTokenRes ]: any[] = await this._getEntTokenAndAndLeagueSession(lcuHttpApi as LeagueClientHttpApi)
    if ( entTokenRes.value.status === 200 ) {
      const token = entTokenRes.value.data
      if ( !token ) {
        this._sgpApi.setEntitlementsToken(null)
      }
      const copiedToken = structuredClone(token)
      copiedToken.accessToken = copiedToken.accessToken?.slice(0, 24) + '...'
      copiedToken.token = copiedToken.token?.slice(0, 24) + '...'

      this._logger!.info(`更新 Entitlements Token: ${ JSON.stringify(copiedToken) }`)
      this._sgpApi.setEntitlementsToken(token.accessToken)
    }

    if ( leagueSessionTokenRes.value.status === 200 ) {
      const sessionToken = leagueSessionTokenRes.value.data
      if ( !sessionToken )
        this._sgpApi.setEntitlementsToken(null)
      else {
        this._logger!.info(`更新 league session: ${ JSON.stringify(sessionToken.slice(0, 24) + '...') }`)
        this._sgpApi.setLolLeagueSessionToken(sessionToken)
      }
    }
  }

  /**
   * 检查Entitlements Token 和 League Session Token 是否过期
   * @private
   */
  async checkEntitlementsTokenAndLeagueSessionTokenIsExpired() {
    const entToken = this._sgpApi.entitlementToken
    const sessionToken = this._sgpApi.lolLeagueSessionToken
    if(!entToken || !sessionToken || getExpirationTime(entToken).isExpired || getExpirationTime(sessionToken).isExpired) {
      await this._saveEntTokenAndLeagueSession()
    }
  }

  proxyYYYSgpClientFromRenderer(core: Core) {
    if ( !core.schemes ) {
      if ( core?.logger ) {
        core!.logger.error(`代理渲染进程通过axios发送过来的请求（${import.meta.env.VITE_CUS_SCHEME_SGP_URL}）失败，未找到Schemes插件`, LOGGER_NAMESPACE.APP)
      } else {
        console.error(`代理渲染进程通过axios发送过来的请求（${import.meta.env.VITE_CUS_SCHEME_SGP_URL}）失败，未找到Schemes插件`)
      }
      return
    }
    core.schemes.registerDomain(import.meta.env.VITE_CUS_SCHEME_SGP_DOMAIN, async (uri:string, req:any):Promise<any> => {
      const params:any = parseUrlParams(req.url)
      params['methods'] = req.method
      params['data'] = req.body ? Schemes.convertWebStreamToNodeStream(req.body) : undefined
      try {
        await this.checkEntitlementsTokenAndLeagueSessionTokenIsExpired()
        return await this._sgpApi.requestSgp(params)
      } catch ( e ) {
        if (e instanceof LeagueClientLcuUninitializedError) {
          return new Response(JSON.stringify({ error: e.name }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503
          })
        }
        if(isAxiosError(e) && e.status === 401) {
          await this._saveEntTokenAndLeagueSession()
        }

        return new Response((e as Error).message, {
          headers: { 'Content-Type': 'text/plain' },
          status: 500
        })
      }
    })
    this._logger?.info(`代理渲染进程通过axios发送过来的请求（${import.meta.env.VITE_CUS_SCHEME_SGP_URL}）`, LOGGER_NAMESPACE.APP)
  }

}
