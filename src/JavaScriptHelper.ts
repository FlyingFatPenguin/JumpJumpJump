
interface StringNode {
  start: number, // 起始位置
  end: number, // 终止位置
  data: string // 数据
}

/**
 * 获取光标所在位置的 JavaScript字符串
 * @param text 目标文本
 * @param offset 光标位置的下标
 */
function getJavaScriptString(text: string, offset: number) {
  let allString = getAllJavaScriptString(text);
  let currentString = allString.filter(v => v.start < offset && v.end > offset);
  if (currentString.length > 0) {
    return currentString[0].data
  } else {
    return ''
  }
}

/**
 * 获取目标代码中的所有字符串
 * @param text 目标代码
 */
function getAllJavaScriptString(text: string) {
  // 原则上将应该构造 AST
  // 这里考虑到出现这种情况的机会不多，简化获取方法
  const result: Array<StringNode> = []
  const allSeparators = ['\'', '"'] // 字符串分隔符
  let separators = allSeparators // 当前有效的分隔符
  let start = undefined
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (separators.includes(c)) {
      if (!start) { // 字符串起始位置
        separators = [c] // 起始位置和终止位置应该是同一个标识符
        start = i + 1
      } else { // 字符串终止位置
        result.push({
          start,
          end: i,
          data: text.slice(start, i)
        })
        start = undefined
        separators = allSeparators;
      }
    }
  }
  return result;
}

export default {
  getJavaScriptString
}


/******* 测试 ********/
if (!module.parent) {
  let result = getAllJavaScriptString(
    `
    import * as _ from "lodash"
    let a = '1"23'; 
    let b = "ab''c"
    `);
  console.log(result)
}