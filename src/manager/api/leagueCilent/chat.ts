import { ChatMessage, ChatPerson, Conversation, Friend } from './types/chat'
import { AxiosInstance } from 'axios'

export type AvailabilityType =
  | 'chat'
  | 'mobile'
  | 'dnd'
  | 'away'
  | 'offline'
  | 'online'
  | 'spectating'

export class ChatHttpApi {
  constructor(private _http: AxiosInstance) {}

  /**
   * 获取好友列表
   * @returns 返回一个包含好友信息的数组
   */
  getFriends() {
    return this._http.get<Friend[]>('/lol-chat/v1/friends')
  }

  /**
   * 获取当前用户信息
   * @returns 返回当前用户信息
   */
  getMe() {
    return this._http.get<ChatPerson>('/lol-chat/v1/me')
  }

  /**
   * 获取会话列表
   * @returns 返回一个包含会话信息的数组
   */
  getConversations() {
    return this._http.get<Conversation[]>('/lol-chat/v1/conversations')
  }

  /**
   * 获取指定会话的参与者列表
   * @param id 会话ID
   * @returns 返回一个包含参与者信息的数组
   */
  getParticipants(id: string) {
    return this._http.get<ChatPerson[]>(`/lol-chat/v1/conversations/${id}/participants`)
  }

  /**
   * 更改用户可用性状态
   * @param availability 可用性状态类型
   */
  changeAvailability(availability: AvailabilityType) {
    return this._http.put('/lol-chat/v1/me', {
      availability
    })
  }

  /**
   * 发送聊天消息
   * @param targetId 目标ID（可以是用户ID或会话ID）
   * @param message 要发送的消息内容
   * @param type 消息类型，默认为'chat'
   * @param isHistorical 是否为历史消息，默认为false
   * @param summonerId 召唤师ID（可选）
   * @returns 返回发送的消息对象
   */
  chatSend(
    targetId: number | string,
    message: string,
    type: string = 'chat',
    isHistorical: boolean = false,
    summonerId?: number
  ) {
    return this._http.post<ChatMessage>(`/lol-chat/v1/conversations/${targetId}/messages`, {
      body: message,
      fromId: summonerId,
      fromPid: '',
      fromSummonerId: summonerId ?? 0,
      id: targetId,
      isHistorical,
      timestamp: '',
      type
    })
  }

  /**
   * 获取指定聊天室的参与者列表
   * @param chatRoomId 聊天室ID
   * @returns 返回一个包含参与者信息的数组
   */
  getChatParticipants(chatRoomId: string) {
    return this._http.get<ChatPerson[]>(`/lol-chat/v1/conversations/${chatRoomId}/participants`)
  }

  /**
   * 更改用户的排位信息
   * @param rankedLeagueQueue 排位队列
   * @param rankedLeagueTier 排位等级
   * @param rankedLeagueDivision 排位分段（可选）
   * @returns 返回更新后的用户信息
   */
  changeRanked(rankedLeagueQueue: string, rankedLeagueTier: string, rankedLeagueDivision?: string) {
    return this._http.put<ChatPerson>('/lol-chat/v1/me', {
      lol: {
        rankedLeagueQueue,
        rankedLeagueTier,
        rankedLeagueDivision
      }
    })
  }

  /**
   * 发送好友请求
   * @param gameName 游戏名称
   * @param tagLine 标签行
   */
  friendRequests(gameName: string, tagLine: string) {
    return this._http.post('/lol-chat/v2/friend-requests', {
      gameName,
      tagLine,
      gameTag: tagLine
    })
  }

  /**
   * 设置聊天状态消息
   * @param message 状态消息内容
   * @returns 返回更新后的用户信息
   */
  setChatStatusMessage(message: string) {
    return this._http.put<ChatPerson>('/lol-chat/v1/me', {
      statusMessage: message
    })
  }
}
