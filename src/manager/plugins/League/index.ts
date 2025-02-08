import { IPlugin } from '../../interface'
// import lolTools from '../../../../resources/addons/lol-tools.node'
import lolTools from 'lol-tools.node'
import { Core } from '../../Core'


/**
 * 来自 Riot 的证书文件
 */
export const RIOT_CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIEIDCCAwgCCQDJC+QAdVx4UDANBgkqhkiG9w0BAQUFADCB0TELMAkGA1UEBhMC
VVMxEzARBgNVBAgTCkNhbGlmb3JuaWExFTATBgNVBAcTDFNhbnRhIE1vbmljYTET
MBEGA1UEChMKUmlvdCBHYW1lczEdMBsGA1UECxMUTG9MIEdhbWUgRW5naW5lZXJp
bmcxMzAxBgNVBAMTKkxvTCBHYW1lIEVuZ2luZWVyaW5nIENlcnRpZmljYXRlIEF1
dGhvcml0eTEtMCsGCSqGSIb3DQEJARYeZ2FtZXRlY2hub2xvZ2llc0ByaW90Z2Ft
ZXMuY29tMB4XDTEzMTIwNDAwNDgzOVoXDTQzMTEyNzAwNDgzOVowgdExCzAJBgNV
BAYTAlVTMRMwEQYDVQQIEwpDYWxpZm9ybmlhMRUwEwYDVQQHEwxTYW50YSBNb25p
Y2ExEzARBgNVBAoTClJpb3QgR2FtZXMxHTAbBgNVBAsTFExvTCBHYW1lIEVuZ2lu
ZWVyaW5nMTMwMQYDVQQDEypMb0wgR2FtZSBFbmdpbmVlcmluZyBDZXJ0aWZpY2F0
ZSBBdXRob3JpdHkxLTArBgkqhkiG9w0BCQEWHmdhbWV0ZWNobm9sb2dpZXNAcmlv
dGdhbWVzLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAKoJemF/
6PNG3GRJGbjzImTdOo1OJRDI7noRwJgDqkaJFkwv0X8aPUGbZSUzUO23cQcCgpYj
21ygzKu5dtCN2EcQVVpNtyPuM2V4eEGr1woodzALtufL3Nlyh6g5jKKuDIfeUBHv
JNyQf2h3Uha16lnrXmz9o9wsX/jf+jUAljBJqsMeACOpXfuZy+YKUCxSPOZaYTLC
y+0GQfiT431pJHBQlrXAUwzOmaJPQ7M6mLfsnpHibSkxUfMfHROaYCZ/sbWKl3lr
ZA9DbwaKKfS1Iw0ucAeDudyuqb4JntGU/W0aboKA0c3YB02mxAM4oDnqseuKV/CX
8SQAiaXnYotuNXMCAwEAATANBgkqhkiG9w0BAQUFAAOCAQEAf3KPmddqEqqC8iLs
lcd0euC4F5+USp9YsrZ3WuOzHqVxTtX3hR1scdlDXNvrsebQZUqwGdZGMS16ln3k
WObw7BbhU89tDNCN7Lt/IjT4MGRYRE+TmRc5EeIXxHkQ78bQqbmAI3GsW+7kJsoO
q3DdeE+M+BUJrhWorsAQCgUyZO166SAtKXKLIcxa+ddC49NvMQPJyzm3V+2b1roP
SvD2WV8gRYUnGmy/N0+u6ANq5EsbhZ548zZc+BI4upsWChTLyxt2RxR7+uGlS1+5
EcGfKZ+g024k/J32XP4hdho7WYAS2xMiV83CfLR/MNi8oSMaVQTdKD8cpgiWJk3L
XWehWA==
-----END CERTIFICATE-----`


export type CmdParsedType = {
  port: number
  pid: number
  authToken: string
  rsoPlatformId: string
  region: string
  certificate?: string
  riotClientPort: number
  riotClientAuthToken: string
}

export class League implements IPlugin {

  static id: string = 'league'
  name = League.id

  private _PROCESS_NAME = 'LeagueClientUx.exe'
  private tools = lolTools
  private _cmdOriginInfo = ''
  private _cmdParsedInfo: CmdParsedType | null = null

  // 端口号
  private _portRegex = /--app-port=([0-9]+)/
  // 远程连接认证码
  private _remotingAuth = /--remoting-auth-token=([\w-_]+)/
  private _pidRegex = /--app-pid=([0-9]+)/
  private _rsoPlatformIdRegex = /--rso_platform_id=([\w-_]+)/
  private _regionRegex = /--region=([\w-_]+)/
  private _riotClientPortRegex = /--riotclient-app-port=([0-9]+)/
  private _riotClientAuthRegex = /--riotclient-auth-token=([\w-_]+)/


  get cmdParsedInfo(): CmdParsedType | null {
    return this._cmdParsedInfo
  }

  init(core: Core) {
    this.loopConnection(core)
    core['league'] = core.getPlugin(League.id) // 挂载到core上
  }

  loopConnection(core: Core) {
    const timer = setInterval(() => {
      const cmdLine = this.getLOLClientConnArgByNativeApi()
      if ( cmdLine ) {
        this._cmdParsedInfo = this.parseCommandLine(cmdLine)
        core.emit('leagueConnSuccess', this._cmdParsedInfo)
        clearInterval(timer)
      }

    }, 1000)
  }

  /**
   * 通过native api获取lol客户端连接参数
   */
  getLOLClientConnArgByNativeApi() {
    const pid = this.tools.getPidByName(this._PROCESS_NAME)
    if ( !pid ) return ''
    const args = this.tools.getProcessCommandLine(pid)
    this._cmdOriginInfo = args
    return args
  }

  parseCommandLine(s: string): CmdParsedType | null {
    const [ , port ] = s.match(this._portRegex) || []
    const [ , password ] = s.match(this._remotingAuth) || []
    const [ , pid ] = s.match(this._pidRegex) || []
    const [ , rsoPlatformId = '' ] = s.match(this._rsoPlatformIdRegex) || []
    const [ , region = '' ] = s.match(this._regionRegex) || []
    const [ , riotClientPort = '' ] = s.match(this._riotClientPortRegex) || []
    const [ , riotClientAuth = '' ] = s.match(this._riotClientAuthRegex) || []

    if ( !port || !password || !pid ) {
      return null
    }
    return {
      port: Number(port),
      pid: Number(pid),
      authToken: password,
      rsoPlatformId,
      region,
      // certificate: RIOT_CERTIFICATE,
      riotClientPort: Number(riotClientPort),
      riotClientAuthToken: riotClientAuth
    }
  }
}
