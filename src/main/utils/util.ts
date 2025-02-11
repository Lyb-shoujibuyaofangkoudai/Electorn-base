import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

export function openFolder(pathToOpen: string) {
  let cmd = '';
  const resolvedPath = path.resolve(pathToOpen);

  // 检查路径是文件还是文件夹
  fs.stat(resolvedPath, (err, stats) => {
    if (err) {
      console.error(`Error accessing path: ${err}`);
      return;
    }

    if (stats.isFile()) {
      // 如果是文件，打开文件所在的文件夹
      const folderPath = path.dirname(resolvedPath);
      switch (process.platform) {
        case 'darwin':
          cmd = `open ${folderPath}`;
          break;
        case 'win32':
          cmd = `explorer ${folderPath}`;
          break;
        case 'linux':
          cmd = `xdg-open ${folderPath}`;
          break;
        default:
          cmd = `open ${folderPath}`;
          break;
      }
    } else if (stats.isDirectory()) {
      // 如果是文件夹，直接打开该文件夹
      switch (process.platform) {
        case 'darwin':
          cmd = `open ${resolvedPath}`;
          break;
        case 'win32':
          cmd = `explorer ${resolvedPath}`;
          break;
        case 'linux':
          cmd = `xdg-open ${resolvedPath}`;
          break;
        default:
          cmd = `open ${resolvedPath}`;
          break;
      }
    }

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing command: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
        return;
      }
      console.log(`Command stdout: ${stdout}`);
    });
  });
}
