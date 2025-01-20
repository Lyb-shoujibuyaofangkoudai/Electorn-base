const lolTools = require('./build/Release/lol-tools.node');

const pid = lolTools.getPidByName('LeagueClientUx.exe');
console.log("查看pid：", pid)
console.log("查看完整命令行：", lolTools.getProcessCommandLine(pid))
