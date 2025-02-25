export interface GameRecord {
  kills: number
  deaths: number
  assists: number
  visionScore: number
  gameLength: number
  win: boolean
  position: string
}

export interface RankInfo {
  tier: string
  division: string
  leaguePoints: number
  wins: number
  losses: number
}

export interface GameStats {
  wins: number
  losses: number
} 