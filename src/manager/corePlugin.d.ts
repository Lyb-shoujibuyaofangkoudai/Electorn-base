
import Logger from "./plugins/logger/Logger"
import Bridge from "./plugins/Bridge/Bridge"
import EventManager from "./plugins/EventBus"
import League from "./plugins/League"
import Config from "./plugins/config"
import Schemes from "./plugins/Schemes"
import Db from "./plugins/db/Db"
import LeagueMainHelper from "./plugins/LeagueMainHelper"
import LeagueWs from "./plugins/LeagueWs/LeagueWs"
import SgpMainHelper from "./plugins/SgpMainHelper"
import RiotMainHelper from "./plugins/RiotMainHelper"
import { Core } from './Core';

declare module './Core' {
  interface Core {
    logger?: Logger;
		bridge?: Bridge;
		eventManager?: EventManager;
		league?: League;
		config?: Config;
		schemes?: Schemes;
		db?: Db;
		leagueMainHelper?: LeagueMainHelper;
		leagueWs?: LeagueWs;
		sgpMainHelper?: SgpMainHelper;
		riotMainHelper?: RiotMainHelper;
  }
}
