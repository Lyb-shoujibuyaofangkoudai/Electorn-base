
import Bridge from "./plugins/Bridge/Bridge"
import Logger from "./plugins/logger/Logger"
import League from "./plugins/League"
import Config from "./plugins/config"
import Schemes from "./plugins/Schemes"
import LeagueMainHelper from "./plugins/LeagueMainHelper"
import { Core } from './Core';

declare module './Core' {
  interface Core {
    bridge: Bridge;
		logger: Logger;
		league: League;
		config: Config;
		schemes: Schemes;
		leaguemainhelper: LeagueMainHelper;
  }
}
