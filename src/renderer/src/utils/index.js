/**
 * 斜杠转化为小驼峰
 * @param {*} str
 * @returns
 */
export const camelize = (str) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toLocaleUpperCase() : ''
  })
}
