import { IPlugin } from '../../interface'
import { Core } from '../../Core'
import { Logger } from '../logger/Logger'
import { CmdParsedType } from '../League'
import WebSocket from 'ws'
import { ClientRequestArgs } from 'node:http'

export class LeagueWs implements IPlugin {
  static id: string = 'leagueWs'
  name = LeagueWs.id
  _ws: WebSocket | null = null
  _logger:Logger = Core.getInstance().logger

  hooks = {
    leagueConnSuccess: async (auth:CmdParsedType) => {
      await this.initWs(auth)
    },
  }

  init(core:Core) {
    try {
      core[this.name] = core.getPlugin(this.name)
    } catch ( e ) {
      throw e
    }
  }

  async initWs(cmd:CmdParsedType) {
    try {
      this._ws = await this._wsPromisified(`wss://riot:${cmd.authToken}@127.0.0.1:${cmd.port}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(`riot:${cmd.authToken}`).toString('base64')}`
        },
        rejectUnauthorized: false
      })

      this._ws.send(JSON.stringify([5, 'OnJsonApiEvent']))

      this._ws.on('message', (msg) => {
        try {
          const res = JSON.parse(msg.toString())
          // console.log("ws接收数据：",res)
          const {
            uri,
            data
          } = res[2]
          // todo: 处理WS接收到的数据：
        } catch {}
      })

      this._ws.on('close', () => {
        this._cleanup()
      })
    } catch (error) {
      throw error
    }
  }

  private _wsPromisified(
    url: string,
    options: WebSocket.ClientOptions | ClientRequestArgs = {},
    timeout = 12500
  ): Promise<WebSocket> {
    return new Promise<WebSocket>((resolve, reject) => {
      const ws = new WebSocket(url, options)

      const timer = setTimeout(() => {
        ws.close()
        reject(new Error(`WebSocket connection timed out after ${timeout}ms`))
      }, timeout)

      ws.on('open', () => {
        clearTimeout(timer)
        this._logger.info(`ws 连接成功！`)
        resolve(ws)
      })

      ws.on('error', (err) => {
        this._logger.error(`ws 出现错误：${err}`)
        clearTimeout(timer)
        reject(err)
      })

      ws.on('close', () => clearTimeout(timer))
    })
  }

  private _cleanup() {
    if (this._ws && this._ws.readyState !== WebSocket.CLOSED) {
      this._ws.close()
      this._ws = null
    }
  }
}
