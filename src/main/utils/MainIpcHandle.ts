import { MainWindow } from "../windows/MainWindow";
import { Core } from "../../manager/Core";
import {
  BRIDGE_EVENT,
  BridgeDataType,
  LOGGER_NAMESPACE,
} from "../../manager/plugins/Bridge/bridgeType";
import {
  DATA_ACTION,
  EVENT_BUS_TYPE,
  EVENT_TYPE,
} from "../../manager/plugins/Bridge/eventType";
import { Bridge } from "../../manager/plugins/Bridge/Bridge";
import lolTools from "lol-tools.node";
import { openFolder } from "./util";
import { Settings } from "../../manager/plugins/db/entities/Settings";
import { EventManager } from "../../manager/plugins/EventBus";
import { AvailableServersMap } from "../../manager/api/sgp/types";

/**
 * 同意管理主进程和渲染进程的通信
 */
export class MainIpcHandle {
  private static _instance: MainIpcHandle | null = null;
  _logger = Core.getInstance().logger;
  bridge = Core.getInstance().bridge as Bridge;
  _tools = lolTools;
  _eventManager: EventManager = Core.getInstance().eventManager!;

  static getInstance(): MainIpcHandle {
    if (!MainIpcHandle._instance) {
      MainIpcHandle._instance = new MainIpcHandle();
    }
    return MainIpcHandle._instance;
  }

  constructor() {
    this.init();
  }

  async init() {
    this.windowHandle();
    this.adminHandle();
    this.loggerHandle();
    this.dbHandle();
    this.settingHandle();
    this.folderHandle();
    this.leagueHandle();
  }

  windowHandle() {
    Core.getInstance().bridge.addCall(EVENT_TYPE.WINDOW_MAXIMIZED, () => {
      MainWindow.instance.setWindowMaximization();
    });

    Core.getInstance().bridge.addCall(EVENT_TYPE.WINDOW_MINIMIZED, () => {
      MainWindow.instance.setWindowMinimization();
    });

    Core.getInstance().bridge.addCall(EVENT_TYPE.WINDOW_CLOSED, () => {
      MainWindow.instance.closeWindow();
    });

    Core.getInstance().bridge.addCall(EVENT_TYPE.WINDOW_RESTORED, () => {
      MainWindow.instance.setWindowRestore();
    });

    Core.getInstance().bridge.addCall(EVENT_TYPE.WINDOW_UNMAXIMIZED, () => {
      MainWindow.instance.setWindowUnmaximization();
    });
  }

  /**
   * 用户修改配置信息 需要修改的话需要渲染段传入整个修改后的配置信息
   * @example
   * 渲染进程：ipc.call(EVENT_TYPE.SET_LOL_DETAILS,{
   *     "test": {
   *       "a": 1,
   *       "b": 4,
   *       "c": {
   *         "d": 90000
   *       }
   *     },
   *     "theme": {
   *       "name": "dark"
   *     },
   *     "main_window": {
   *       "width": 1280,
   *       "height": 960
   *     }
   *   })
   */
  settingHandle() {
    this.bridge.addCall(
      EVENT_TYPE.SET_DETAILS,
      (data?: BridgeDataType<any>): BridgeDataType<any> => {
        if (data?.data?.action === DATA_ACTION.INIT) {
          //   初始化配置信息
          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.SET_DETAILS,
            success: true,
            data: Settings.defaultSettings,
          };
        }

        if (data?.data?.config && data?.data?.action === DATA_ACTION.UPDATE) {
          Core.getInstance().config.setConfig(data?.data.config);
          Core.getInstance().config.settingsDao.updateSetting(
            "config",
            data?.data.config,
          );
        }

        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.SET_DETAILS,
          success: true,
          data: Core.getInstance().config?.configInfo,
        };
      },
    );
  }

  leagueHandle() {
    this.bridge.addCall(EVENT_TYPE.SET_LOL_DETAILS, (): BridgeDataType<any> => {
      return {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.SET_LOL_DETAILS,
        data: Core.getInstance().league?.cmdParsedInfo,
      };
    });

    this._eventManager.on(EVENT_BUS_TYPE.LOL_CONN_SUCCESS, () => {
      this._logger?.info("连接LOL客户端成功", LOGGER_NAMESPACE.APP);
      this.bridge.send(
        EVENT_TYPE.SET_LOL_DETAILS,
        Core.getInstance().league?.cmdParsedInfo,
        "lol客户端参数详情",
      );
    });
  }

  adminHandle() {
    this.bridge.addCall(
      EVENT_TYPE.ADMIN_DETAILS,
      (
        data?: BridgeDataType<{
          applyAdmin: boolean;
        }>,
      ): BridgeDataType<any> => {
        if (data?.data?.applyAdmin) {
          console.log("申请管理员权限");
          if (this._tools.requestAdmin())
            return {
              namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
              eventName: EVENT_TYPE.ADMIN_DETAILS,
              data: true,
            };
          else
            return {
              namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
              eventName: EVENT_TYPE.ADMIN_DETAILS,
              data: false,
            };
        } else
          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.ADMIN_DETAILS,
            data: this._tools.isElevated(),
          };
      },
    );
  }

  /**
   * 日志相关的handle
   */
  loggerHandle() {
    this.bridge.addCall(EVENT_TYPE.LOGGER_DETAILS, (): BridgeDataType<any> => {
      return {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.LOGGER_DETAILS,
        data: {
          loggerSavePath: this._logger?.logDirPath,
        },
      };
    });
  }

  /**
   * 数据库相关的handle
   */
  dbHandle() {
    this.bridge.addCall(EVENT_TYPE.DB_DETAILS, (): BridgeDataType<any> => {
      return {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.DB_DETAILS,
        data: {
          dbPath: Core.getInstance().db?._dbPath,
        },
      };
    });

    // 添加搜索历史
    this.bridge.addCall(
      EVENT_TYPE.DB_ADD_SEARCH_HISTORY,
      async (data?: BridgeDataType<any>): Promise<BridgeDataType<any>> => {
        try {
          const searchHistoryDao = Core.getInstance().db?._dao.searchHistory;
          if (!searchHistoryDao)
            throw new Error("SearchHistoryDao not initialized");
          if (!data?.data?.summonerName)
            throw new Error("Summoner name is required");

          const result = await searchHistoryDao.addSearchHistory(
            data.data.summonerName,
            data.data.avatar,
          );

          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_ADD_SEARCH_HISTORY,
            success: true,
            data: result,
          };
        } catch (error) {
          console.error("Failed to add search history:", error);
          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_ADD_SEARCH_HISTORY,
            success: false,
            msg: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    );

    // 获取最近搜索记录
    this.bridge.addCall(
      EVENT_TYPE.DB_GET_RECENT_SEARCHES,
      async (): Promise<BridgeDataType<any>> => {
        try {
          const searchHistoryDao = Core.getInstance().db?._dao.searchHistory;
          if (!searchHistoryDao)
            throw new Error("SearchHistoryDao not initialized");

          const result = await searchHistoryDao.getRecentSearches();

          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_GET_RECENT_SEARCHES,
            success: true,
            data: result,
          };
        } catch (error) {
          console.error("Failed to get recent searches:", error);
          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_GET_RECENT_SEARCHES,
            success: false,
            msg: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    );

    // 删除搜索记录
    this.bridge.addCall(
      EVENT_TYPE.DB_DELETE_SEARCH_HISTORY,
      async (data?: BridgeDataType<any>): Promise<BridgeDataType<any>> => {
        try {
          const searchHistoryDao = Core.getInstance().db?._dao.searchHistory;
          if (!searchHistoryDao)
            throw new Error("SearchHistoryDao not initialized");
          if (!data?.data?.summonerName)
            throw new Error("Summoner name is required");

          await searchHistoryDao.deleteSearchHistory(data.data.summonerName);

          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_DELETE_SEARCH_HISTORY,
            success: true,
          };
        } catch (error) {
          console.error("Failed to delete search history:", error);
          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_DELETE_SEARCH_HISTORY,
            success: false,
            msg: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    );

    // 清空所有搜索记录
    this.bridge.addCall(
      EVENT_TYPE.DB_CLEAR_ALL_HISTORY,
      async (): Promise<BridgeDataType<any>> => {
        try {
          const searchHistoryDao = Core.getInstance().db?._dao.searchHistory;
          if (!searchHistoryDao)
            throw new Error("SearchHistoryDao not initialized");

          await searchHistoryDao.clearAllHistory();

          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_CLEAR_ALL_HISTORY,
            success: true,
          };
        } catch (error) {
          console.error("Failed to clear search history:", error);
          return {
            namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
            eventName: EVENT_TYPE.DB_CLEAR_ALL_HISTORY,
            success: false,
            msg: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    );
  }

  /**
   * 文件夹handle
   */
  folderHandle() {
    this.bridge.onEvent(
      EVENT_TYPE.OPEN_FOLDER,
      (data?: BridgeDataType<string>) => {
        const filePath = data?.data;
        if (!filePath) return;
        openFolder(filePath);
      },
    );
  }

  /**
   * riot服务器的一些本地信息 handle
   */
  serverHandle(data: AvailableServersMap) {
    this.bridge.addCall(
      EVENT_TYPE.LOCAL_SERVER_DETAILS,
      (): BridgeDataType<any> => {
        return {
          namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
          eventName: EVENT_TYPE.LOCAL_SERVER_DETAILS,
          data: data,
        };
      },
    );
  }

  debugHandle(info: any) {
    this.bridge.addCall(EVENT_TYPE.DEBUG_DETAILS, (): BridgeDataType<any> => {
      return {
        namespace: BRIDGE_EVENT.MAIN_COMMUNICATION_RENDERER,
        eventName: EVENT_TYPE.DEBUG_DETAILS,
        data: info,
      };
    });
  }
}
