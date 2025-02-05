
import Bridge from "plugins/Bridge/Bridge"
import Logger from "plugins/logger/Logger"
import League from "plugins/League"
import Config from "plugins/config"
import { Core } from './Core';

declare module './Core' {
  interface Core {
    bridge: Bridge;
		logger: Logger;
		league: League;
		config: Config;
  }
}
