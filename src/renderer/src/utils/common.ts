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
]

// 大区可能有错误
export enum RegionEnum {
  // 电信大区
  AIOUNIYA = "HN1",        // 电一：艾欧尼亚
  ZUAN = "HN2",            // 电二：祖安
  NUOKESASI = "HN3",       // 电三：诺克萨斯
  BANDEERCHENG = "HN4",    // 电四：班德尔城
  PIERTEWOFO = "HN5",      // 电五：皮尔特沃夫
  ZHANZHENGXUEYUAN = "HN6",// 电六：战争学院
  JUSHENFENG = "HN7",      // 电七：巨神峰
  LEISIGENGBEI = "HN8",    // 电八：雷瑟守备
  CAIJUEZHIDI = "HN9",     // 电九：裁决之地
  HEISEMEIGUI = "HN10",    // 电十：黑色玫瑰
  ANYINGDAO = "HN11",      // 电十一：暗影岛
  GANGTIELIEYANG = "HN12", // 电十二：钢铁烈阳
  JUNHENGJIAOPAI = "HN13", // 电十三：均衡教派
  SHUIJINGZHIHEN = "HN14", // 电十四：水晶之痕
  YINGLIU = "HN15",        // 电十五：影流
  SHOUWANGZHIHAI = "HN16", // 电十六：守望之海
  ZHENG_FUZHIHAI = "HN17", // 电十七：征服之海
  KALAMANDA = "HN18",      // 电十八：卡拉曼达
  PICHENGJINGBEI = "HN19", // 皮城警备

  // 网通大区
  BIERJIWOTE = "WN1",      // 网一：比尔吉沃特
  DEMAXIYA_WN = "WN2",     // 网二：德玛西亚（需与电信区分）
  FULEIERZHUODE = "WN3",   // 网三：弗雷尔卓德
  WUWEIXIANFENG = "WN4",   // 网四：无畏先锋
  SHURUIEMA = "WN5",       // 网五：恕瑞玛
  NIUQUJONGLIN = "WN6",    // 网六：扭曲丛林
  JULONGZHIZHAO = "WN7"    // 网七：巨龙之巢
}
export const RegionMap =  {
  [RegionEnum.AIOUNIYA]: "艾欧尼亚",
  [RegionEnum.ZUAN]: "祖安",
  [RegionEnum.NUOKESASI]: "诺克萨斯",
  [RegionEnum.BANDEERCHENG]: "班德尔城",
  [RegionEnum.PIERTEWOFO]: "皮尔特沃夫",
  [RegionEnum.ZHANZHENGXUEYUAN]: "战争学院",
  [RegionEnum.JUSHENFENG]: "巨神峰",
  [RegionEnum.LEISIGENGBEI]: "雷瑟守备",
  [RegionEnum.CAIJUEZHIDI]: "裁决之地",
  [RegionEnum.HEISEMEIGUI]: "黑色玫瑰",
  [RegionEnum.ANYINGDAO]: "暗影岛",
  [RegionEnum.GANGTIELIEYANG]: "钢铁烈阳",
  [RegionEnum.JUNHENGJIAOPAI]: "均衡教派",
  [RegionEnum.SHUIJINGZHIHEN]: "水晶之痕",
  [RegionEnum.YINGLIU]: "影流",
  [RegionEnum.SHOUWANGZHIHAI]: "守望之海",
  [RegionEnum.ZHENG_FUZHIHAI]: "征服之海",
  [RegionEnum.KALAMANDA]: "卡拉曼达",
  [RegionEnum.PICHENGJINGBEI]: "皮城警备",
  // 网通大区映射
  [RegionEnum.BIERJIWOTE]: "比尔吉沃特",
  [RegionEnum.DEMAXIYA_WN]: "德玛西亚",
  [RegionEnum.FULEIERZHUODE]: "弗雷尔卓德",
  [RegionEnum.WUWEIXIANFENG]: "无畏先锋",
  [RegionEnum.SHURUIEMA]: "恕瑞玛",
  [RegionEnum.NIUQUJONGLIN]: "扭曲丛林",
  [RegionEnum.JULONGZHIZHAO]: "巨龙之巢"
};
