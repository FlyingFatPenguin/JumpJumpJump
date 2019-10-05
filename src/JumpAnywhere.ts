import * as vscode from 'vscode'
import jsHelper from './JavaScriptHelper'
import * as path from 'path';
import * as fs from 'fs';

/**
 * 查找文件定义的provider，匹配到了就return一个location，否则不做处理
 * 最终效果是，当按住Ctrl键时，如果return了一个location，字符串就会变成一个可以点击的链接，否则无任何效果
 * @param {*} document 
 * @param {*} position 
 * @param {*} token 
 */
function provideDefinition(
  document: vscode.TextDocument,
  position: vscode.Position,
  token: vscode.CancellationToken
) {
  const fileName = document.fileName;
  const workDir = path.dirname(fileName);


  // 获取代码中的路径
  let pathName = getPathFromCode(document, position);

  // vue 专属，将 @ 替换为 src
  let src = workDir.replace(/(src)(.*$)/, '$1'); // 获取 src 的值
  pathName = pathName.replace('@', src)

  // 绝对路径
  if (!path.isAbsolute(pathName)) {
    pathName = path.resolve(workDir, pathName);
  }

  console.log('pathName: ' + pathName)

  // 对文件夹自动定位到 index 文件
  if (isDir(pathName)) {
    pathName = path.resolve(pathName, 'index');
  }

  // 推断后缀
  let result = fixExtname(pathName);

  console.log('result: ' + result)

  if (result) {
    return new vscode.Location(vscode.Uri.file(result), new vscode.Position(0, 0))
  }
}


/**
 * 返回光标所在处的文件名
 * @example
 * // 代码是： "import * as _ from 'test.js'"
 * // 光标位于 单引号 之间
 * getPathFromCode(document, position) // test.js
 * @param document 当前的文档
 * @param position 当前光标的位置
 */
function getPathFromCode(document: vscode.TextDocument, position: vscode.Position) {
  // 所在行的代码
  let lineText = document.lineAt(position).text;
  // 光标的水平偏移量
  let character = position.character;

  return jsHelper.getJavaScriptString(lineText, character);
}

// /**
//  * 将路径调整为相对于工作目录的绝对路径
//  * @param p 文本中获取的路径
//  */
// function getAbsolutePath(p: string): string {
//   // 获取当前的根目录
//   let rootPath = (vscode.workspace.workspaceFolders || [])[0].uri.path;
//   // 去除开头的 ‘/’, 如 '/C:/demo/' => 'C:/demo/'
//   rootPath = rootPath.slice(1);

//   if (path.isAbsolute(p)) {
//     return p;
//   } else {
//     return path.resolve(rootPath, p);
//   }
// }

/**
 * 返回修改后的文件路径，该路径对应的文件一定存在
 * @param p 路径
 */
function fixExtname(p: string) {
  if (path.extname(p) === '') {
    for (let extname of ['', '.js', '.vue']) {
      const name = p + extname;
      if (fs.existsSync(name)) {
        return name;
      }
    }
  } else {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return undefined;
}

/**
 * 判断当前路径对应的是否是文件夹
 * @param pathName 路径
 */
function isDir(pathName: string) {
  if(!fs.existsSync(pathName)){
    return false;
  }
  let stat = fs.lstatSync(pathName)
  if(stat){
    return stat.isDirectory()
  }else{
    return false;
  }
}

export default {
  enable(context: any) {
    // 注册如何实现跳转到定义，第一个参数表示仅对 js 文件生效
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(['javascript', 'vue'], {
      provideDefinition
    }));
  }
}