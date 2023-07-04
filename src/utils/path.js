export const getRelativePath = (filepath, relative) => {
  const temp = filepath.replace(relative, '')
  return temp[0] === '/' ? temp.substring(1) : temp
}
