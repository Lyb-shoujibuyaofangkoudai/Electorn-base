import BronzeMedal from "../assets/ico/ranked-icons-large/bronze.png";
import ChallengerMedal from "../assets/ico/ranked-icons-large/challenger.png";
import DiamondMedal from "../assets/ico/ranked-icons-large/diamond.png";
import EmeraldMedal from "../assets/ico/ranked-icons-large/emerald.png";
import GoldMedal from "../assets/ico/ranked-icons-large/gold.png";
import GrandmasterMedal from "../assets/ico/ranked-icons-large/grandmaster.png";
import IronMedal from "../assets/ico/ranked-icons-large/iron.png";
import MasterMedal from "../assets/ico/ranked-icons-large/master.png";
import PlatinumMedal from "../assets/ico/ranked-icons-large/platinum.png";
import SilverMedal from "../assets/ico/ranked-icons-large/silver.png";
import Unranked from "../assets/ico/ranked-icons-large/unranked.png";

export const TIERS_ICON = {
  UNRANKED: Unranked,
  IRON: IronMedal,
  BRONZE: BronzeMedal,
  SILVER: SilverMedal,
  GOLD: GoldMedal,
  PLATINUM: PlatinumMedal,
  EMERALD: EmeraldMedal,
  DIAMOND: DiamondMedal,
  MASTER: MasterMedal,
  GRANDMASTER: GrandmasterMedal,
  CHALLENGER: ChallengerMedal,
};

export const TIERS = {
  UNRANKED: "未定级",
  IRON: "坚韧黑铁",
  BRONZE: "英勇黄铜",
  SILVER: "不屈白银",
  GOLD: "荣耀黄金",
  PLATINUM: "华贵铂金",
  EMERALD: "流光翡翠",
  DIAMOND: "璀璨钻石",
  MASTER: "超凡大师",
  GRANDMASTER: "傲世宗师",
  CHALLENGER: "最强王者",
};

export const SHORT_TIERS = {
  UNRANKED: "无",
  IRON: "黑铁",
  BRONZE: "黄铜",
  SILVER: "白银",
  GOLD: "黄金",
  PLATINUM: "铂金",
  EMERALD: "翡翠",
  DIAMOND: "钻石",
  MASTER: "大师",
  GRANDMASTER: "宗师",
  CHALLENGER: "王者",
};

export const MODES = {
  RANKED_SOLO_5x5: "单双排",
  RANKED_FLEX_SR: "灵活排",
  NORMAL: "匹配模式",
  ARAM_UNRANKED_5x5: "极地大乱斗",
  CHERRY: "斗魂竞技场",
  URF: "无限火力 / 无限乱斗",
  RANKED_FLEX_TT: "灵活排位 3v3",
  NORMAL_TFT: "云顶之弈",
  RANKED_TFT: "云顶之弈 排位",
  RANKED_TFT_TURBO: "云顶之弈 狂暴模式",
  RANKED_TFT_DOUBLE_UP: "云顶之弈 双人作战",
};

export enum TAGS_ENUM {
  all = "all",
  current = "current",
  q_420 = "q_420",
  q_430 = "q_430",
  q_440 = "q_440",
  q_450 = "q_450",
  q_490 = "q_490",
  q_900 = "q_900",
  q_1700 = "q_1700",
  q_1900 = "q_1900",
}

export const TAGS = {
  [TAGS_ENUM.all]: "所有模式",
  [TAGS_ENUM.current]: "当前模式",
  [TAGS_ENUM.q_420]: "单双排位",
  [TAGS_ENUM.q_430]: "匹配模式",
  [TAGS_ENUM.q_440]: "灵活排位",
  [TAGS_ENUM.q_450]: "极地大乱斗",
  [TAGS_ENUM.q_490]: "快速匹配",
  [TAGS_ENUM.q_900]: "无限乱斗",
  [TAGS_ENUM.q_1700]: "斗魂竞技场",
  [TAGS_ENUM.q_1900]: "无限火力",
};

// 模式中文名称映射
export const GAME_TYPES = [
  { label: TAGS[TAGS_ENUM.all], value: TAGS_ENUM.all },
  { label: TAGS[TAGS_ENUM.q_420], value: TAGS_ENUM.q_420 },
  { label: TAGS[TAGS_ENUM.q_440], value: TAGS_ENUM.q_440 },
  { label: TAGS[TAGS_ENUM.q_430], value: TAGS_ENUM.q_430 },
  { label: TAGS[TAGS_ENUM.q_450], value: TAGS_ENUM.q_450 },
] as const;
