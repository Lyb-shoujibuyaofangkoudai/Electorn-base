
import Bridge from "./plugins/Bridge/Bridge"
import EventManager from "./plugins/EventBus"
import League from "./plugins/League"
import Config from "./plugins/config"
import Schemes from "./plugins/Schemes"
import Db from "./plugins/db/Db"
import LeagueMainHelper from "./plugins/LeagueMainHelper"
import SgpMainHelper from "./plugins/SgpMainHelper"
import { Core } from './Core';

declare module './Core' {
  interface Core {
    bridge: Bridge;
		eventManager: EventManager;
		league: League;
		config: Config;
		schemes: Schemes;
		db: Db;
		leagueMainHelper: LeagueMainHelper;
		sgpMainHelper: SgpMainHelper;
  }
}
