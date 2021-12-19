import { isObject, ShapeFlags, isString, isArray } from "@vue/shared"
// h('div', {style: {color:red}}, 'children') // h方法和createApp类似
export function isVnode(vnode) {
  return vnode.__v_isVnode
}
export const createVnode = (type, props, children = null) => {
  // 可以根据type区分是组件还是普通元素
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONENT
    : 0
  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    component: null, // 组件实例
    el: null,
    key: props && props.key,
    shapeFlag, //判断自己的类型和儿子的类型
  }

  normalizeChildren(vnode, children)
  return vnode
}
function normalizeChildren(vnode, children) {
  let type = 0
  if (children == null) {
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN
  } else {
    type = ShapeFlags.TEXT_CHILDREN
  }
  vnode.shapeFlag |= type
}
export const TEXT = Symbol("Text")
export function normalizeVnode(child) {
  if (isObject(child)) return child
  return createVnode(TEXT, null, String(child))
}
