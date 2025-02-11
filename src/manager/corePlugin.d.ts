
import Logger from "./plugins/logger/Logger"
import Bridge from "./plugins/Bridge/Bridge"
import League from "./plugins/League"
import Config from "./plugins/config"
import Schemes from "./plugins/Schemes"
import LeagueMainHelper from "./plugins/LeagueMainHelper"
import Db from "./plugins/db/Db"
import { Core } from './Core';

declare module './Core' {
  interface Core {
    logger: Logger;
		bridge: Bridge;
		league: League;
		config: Config;
		schemes: Schemes;
		leagueMainHelper: LeagueMainHelper;
		db: Db;
  }
}
