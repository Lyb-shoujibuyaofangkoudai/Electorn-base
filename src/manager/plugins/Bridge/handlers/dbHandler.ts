import { ipcMain } from "electron";
import { Core } from "../../../Core";

export function registerDbHandlers() {
  // 获取最近搜索记录
  ipcMain.handle("db:getRecentSearches", async () => {
    const core = Core.getInstance();
    const db = core.getPlugin("db");
    return await db._dao.recentSearch?.getAll();
  });

  // 添加最近搜索记录
  ipcMain.handle(
    "db:addRecentSearch",
    async (
      _,
      puuid: string,
      summonerName: string,
      avatar?: string,
      region?: string,
      regionDetail?: string,
    ) => {
      const core = Core.getInstance();
      const db = core.getPlugin("db");
      await db._dao.recentSearch?.add(
        puuid,
        summonerName,
        avatar,
        region,
        regionDetail,
      );
    },
  );

  // 清空最近搜索记录
  ipcMain.handle("db:clearRecentSearches", async () => {
    const core = Core.getInstance();
    const db = core.getPlugin("db");
    await db._dao.recentSearch?.clear();
  });

  // 删除单条最近搜索记录
  ipcMain.handle("db:removeRecentSearch", async (_, puuid: string) => {
    const core = Core.getInstance();
    const db = core.getPlugin("db");
    await db._dao.recentSearch?.remove(puuid);
  });
}
