
// declare module '../resources/addons/lol-tools.node' {
//   interface LOLToolsAddon {
//     /**
//      * 获取进程 PID
//      */
//     getProcessCommandLine(pid: number): string
//
//     /**
//      * 获取进程名的 PID
//      * @param name 进程名
//      */
//     getPidByName(name: string): number
//     /**
//      * 当前是否是管理员权限
//      */
//     isElevated(): boolean
//     /**
//      * 请求管理员权限
//      */
//     requestAdmin(): boolean
//   }
//
//   const lolTools: LOLToolsAddon
//   export default lolTools
// }

declare module 'lol-tools.node' {
  const lolTools: {
    getPidByName: (name: string) => number;
    getProcessCommandLine: (pid: number) => string;
    isElevated: () => boolean;
    requestAdmin: () => boolean;
  };
  export default lolTools;
}
