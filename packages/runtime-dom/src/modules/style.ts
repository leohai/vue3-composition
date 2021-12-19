export const patchStyle = (el, prev, next) => {
  const style = el.style
  //   el.style.xxx = "x"
  if (next == null) {
    el.removeAttribute("style") // {style: {}} {}
  } else {
    if (prev) {
      for (const key in prev) {
        if (next[key] == null) {
          // 老的里有， 新的里没有，需要删除
          style[key] = ""
        }
      }
    }
    for (const key in next) {
      style[key] = next[key]
    }
  }
}
