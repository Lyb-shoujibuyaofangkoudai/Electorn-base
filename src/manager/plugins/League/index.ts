import { IPlugin } from '../../interface'
import lolTools from 'lol-tools.node'
import { Core } from '../../Core'
import { exec } from "child_process"

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
  /** 客户端服务端口号 */
  port: number
  /** 客户端进程ID */
  pid: number
  /** 远程连接认证令牌 */
  authToken: string
  /** RSO认证平台标识（例如：EUW1、NA1） */
  rsoPlatformId: string
  /** 服务器地区标识 */
  region: string
  /** 可选证书配置（默认使用RIOT_CERTIFICATE） */
  certificate?: string
  /** 英雄联盟客户端端口号 */
  riotClientPort: number
  /** 英雄联盟客户端认证令牌 */
  riotClientAuthToken: string
  /** 原始RSO平台标识（用于跨区匹配场景）就是对应的诺克萨斯那些小区 */
  rsoOriginalPlatformId: string
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
  private _rso_original_platform_id = /--rso_original_platform_id=([\w-_]+)/


  get cmdParsedInfo(): CmdParsedType | null {
    return this._cmdParsedInfo
  }

  init(core: Core) {
    try {
      this.loopConnection(core)
      core['league'] = core.getPlugin(League.id) // 挂载到core上
      core.emit(this.name,'leagueRegistered', this)
    } catch ( e ) {
      console.log("初始化League插件失败",e)
    }
  }

  loopConnection(core: Core) {
    const timer = setInterval(() => {
      const cmdLine = this.getLOLClientConnArgByNativeApi()
      if ( cmdLine ) {
        console.log('获取到客户端信息', cmdLine)
        this.isLeagueClientRunning(this._PROCESS_NAME).then((res) => {
        }).catch((err) => {
          console.error('获取客户端信息失败:', err);
        });
        this._cmdParsedInfo = this.parseCommandLine(cmdLine)
        core.emit(this.name,'leagueConnSuccess', this._cmdParsedInfo)
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
    const [ , rsoOriginalPlatformId = '' ] = s.match(this._rso_original_platform_id) || []

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
      riotClientAuthToken: riotClientAuth,
      rsoOriginalPlatformId,
    }
  }

  /**
   * 检查exe是否在已经运行
   * @param exeName
   */
   isLeagueClientRunning(exeName: string) {
    return new Promise((resolve, reject) => {
      exec('tasklist', (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        const isRunning = stdout.includes(exeName);
        resolve(isRunning);
      });
    });
  }
}
