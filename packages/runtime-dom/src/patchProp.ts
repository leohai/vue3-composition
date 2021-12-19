import { patchAttr } from "./modules/attr"
import { patchClass } from "./modules/class"
import { patchEvent } from "./modules/event"
import { patchStyle } from "./modules/style"

export const patchProp = (el, key, prevValue, nextValue) => {
  switch (key) {
    case "class":
      patchClass(el, nextValue)
      break
    case "style": // {style: {color: 'red}} {style: {background: 'red'}}
      patchStyle(el, prevValue, nextValue)
      break
    default:
      if (/^on[^a-z]/.test(key)) {
        patchEvent(el, key, nextValue) // 事件 添加删除修改2
      } else {
        patchAttr(el, key, nextValue)
      }
      break
  }
}
