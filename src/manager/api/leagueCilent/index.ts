import { AxiosInstance } from 'axios'

import { ChallengesHttpApi } from './challenges'
import { ChampSelectHttpApi } from './champ-select'
import { ChampionMasteryHttpApi } from './champion-mastery'
import { ChatHttpApi } from './chat'
import { EndOfGameHttpApi } from './end-of-game'
import { EntitlementsHttpApi } from './entitlements'
import { GameDataHttpApi } from './game-data'
import { GameflowHttpApi } from './gameflow'
import { HonorHttpApi } from './honor'
import { LoadoutsHttpApi } from './loadouts'
import { LobbyHttpApi } from './lobby'
import { LoginHttpApi } from './login'
import { LolLeagueSessionHttpApi } from './lol-league-session'
import { LootHttpApi } from './loot'
import { MatchHistoryHttpApi } from './match-history'
import { MatchmakingHttpApi } from './matchmaking'
import { MissionsHttpApi } from './missions'
import { PerksHttpApi } from './perks'
import { PlayerNotificationsHttpApi } from './player-notifications'
import { ProcessControlHttpApi } from './process-control'
import { RankedHttpApi } from './ranked'
import { RegaliaHttpApi } from './regalia'
import { RemedyHttpApi } from './remedy'
import { RiotClientHttpApi } from './riotclient'
import { SpectatorHttpApi } from './spectator'
import { SummonerHttpApi } from './summoner'

/**
 * 直接搬运https://github.com/Hanxven/LeagueAkari 的代码 好耶！不用自己写了！
 * 基于 Axios 封装的调用
 */
export class LeagueClientHttpApi {
  // 冠军选择相关的 HTTP API
  public readonly champSelect: ChampSelectHttpApi
  // 英雄掌握相关的 HTTP API
  public readonly championMastery: ChampionMasteryHttpApi
  // 聊天相关的 HTTP API
  public readonly chat: ChatHttpApi
  // 权益相关的 HTTP API
  public readonly entitlements: EntitlementsHttpApi
  // 游戏数据相关的 HTTP API
  public readonly gameData: GameDataHttpApi
  // 游戏流程相关的 HTTP API
  public readonly gameflow: GameflowHttpApi
  // 荣誉相关的 HTTP API
  public readonly honor: HonorHttpApi
  // 会议室相关的 HTTP API
  public readonly lobby: LobbyHttpApi
  // 登录相关的 HTTP API
  public readonly login: LoginHttpApi
  // 英雄联盟会话相关的 HTTP API
  public readonly lolLeagueSession: LolLeagueSessionHttpApi
  // 战利品相关的 HTTP API
  public readonly loot: LootHttpApi
  // 战绩历史相关的 HTTP API
  public readonly matchHistory: MatchHistoryHttpApi
  // 匹配相关的 HTTP API
  public readonly matchmaking: MatchmakingHttpApi
  // 玩家通知相关的 HTTP API
  public readonly playerNotifications: PlayerNotificationsHttpApi
  // 进程控制相关的 HTTP API
  public readonly processControl: ProcessControlHttpApi
  // 排名相关的 HTTP API
  public readonly ranked: RankedHttpApi
  // Riot 客户端相关的 HTTP API
  public readonly riotclient: RiotClientHttpApi
  // 观战相关的 HTTP API
  public readonly spectator: SpectatorHttpApi
  // 召唤师相关的 HTTP API
  public readonly summoner: SummonerHttpApi
  // 荣耀装饰相关的 HTTP API
  public readonly regalia: RegaliaHttpApi
  // 装备相关的 HTTP API
  public readonly loadouts: LoadoutsHttpApi
  // 挑战相关的 HTTP API
  public readonly challenges: ChallengesHttpApi
  // 英雄特性相关的 HTTP API
  public readonly perks: PerksHttpApi
  // 任务相关的 HTTP API
  public readonly missions: MissionsHttpApi
  // 游戏结束相关的 HTTP API
  public readonly endOfGame: EndOfGameHttpApi
  // 救援系统相关的 HTTP API
  public readonly remedy: RemedyHttpApi

  static _instance: LeagueClientHttpApi
  static getInstance(_http: AxiosInstance) {
    if (!LeagueClientHttpApi._instance) {
      LeagueClientHttpApi._instance = new LeagueClientHttpApi(_http)
    }
    return LeagueClientHttpApi._instance
  }

  constructor(private _http: AxiosInstance) {
    this.champSelect = new ChampSelectHttpApi(this._http)
    this.championMastery = new ChampionMasteryHttpApi(this._http)
    this.chat = new ChatHttpApi(this._http)
    this.entitlements = new EntitlementsHttpApi(this._http)
    this.gameData = new GameDataHttpApi(this._http)
    this.gameflow = new GameflowHttpApi(this._http)
    this.honor = new HonorHttpApi(this._http)
    this.lobby = new LobbyHttpApi(this._http)
    this.login = new LoginHttpApi(this._http)
    this.lolLeagueSession = new LolLeagueSessionHttpApi(this._http)
    this.loot = new LootHttpApi(this._http)
    this.matchHistory = new MatchHistoryHttpApi(this._http)
    this.matchmaking = new MatchmakingHttpApi(this._http)
    this.playerNotifications = new PlayerNotificationsHttpApi(this._http)
    this.processControl = new ProcessControlHttpApi(this._http)
    this.ranked = new RankedHttpApi(this._http)
    this.riotclient = new RiotClientHttpApi(this._http)
    this.spectator = new SpectatorHttpApi(this._http)
    this.summoner = new SummonerHttpApi(this._http)
    this.regalia = new RegaliaHttpApi(this._http)
    this.loadouts = new LoadoutsHttpApi(this._http)
    this.challenges = new ChallengesHttpApi(this._http)
    this.perks = new PerksHttpApi(this._http)
    this.missions = new MissionsHttpApi(this._http)
    this.endOfGame = new EndOfGameHttpApi(this._http)
    this.remedy = new RemedyHttpApi(this._http)
  }
}
