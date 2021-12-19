import { effect } from "@vue/reactivity"
import { ShapeFlags } from "@vue/shared"
import { createAppAPI } from "./apiCreateApp"
import { createComponentInstance, setupComponent } from "./component"
import { queueJob } from "./scheduler"
import { normalizeVnode } from "./vnode"
import { TEXT } from "./vnode"
export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText,
    nextSibling: hostNextSibling,
  } = renderOptions
  // --------------------组件-----------------------
  const setupRenderEffect = (instance, container) => {
    // 需要创建一个effect 在effect中调用render 方法，这样render方法拿到的数据会收集这个effect，属性更新时effect会重新执行
    instance.update = effect(
      function componentEffect() {
        // 每个组件都有一个effect
        if (!instance.isMounted) {
          // 初次渲染
          let proxyToUse = instance.proxy
          let subTree = (instance.subTree = instance.render.call(
            proxyToUse,
            proxyToUse
          ))
          patch(null, subTree, container)
          console.log(subTree, "subTree")
          instance.isMounted = true
        } else {
          console.log("更新了")
          const prevTree = instance.subTree
          let proxyToUse = instance.proxy
          const nextTree = instance.render.call(proxyToUse, proxyToUse)
          patch(prevTree, nextTree, container)
          // 更新逻辑
        }
      },
      {
        scheduler: queueJob,
      }
    )
    // parent.update()
  }
  const mountComponent = (initialVNode, container) => {
    // 组件的渲染流程  最核心的就是调用 setup拿到返回值，获取render函数返回的结果来进行渲染
    // 1.先有实例

    const instance = (initialVNode.component =
      createComponentInstance(initialVNode))
    // 2.需要的数据解析到实例上
    setupComponent(instance) // state props attrs render ....
    // 3.创建一个effect 让render函数执行
    setupRenderEffect(instance, container)
  }
  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      mountComponent(n2, container)
    } else {
    }
  }
  // --------------------组件-----------------------
  // --------------------处理元素-----------------------
  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      let child = normalizeVnode(children[i])
      patch(null, child, container)
    }
  }
  const mountElement = (vnode, container, anchor) => {
    // 递归渲染
    const { props, shapeFlag, type, children } = vnode
    let el = (vnode.el = hostCreateElement(type))
    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key])
      }
    }
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children)
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el)
    }
    hostInsert(el, container, anchor)
  }
  const patchProps = (oldProps, newProps, el) => {
    if (oldProps != newProps) {
      for (const key in newProps) {
        const prev = oldProps[key]
        const next = newProps[key]
        if (prev != next) {
          hostPatchProp(el, key, prev, next)
        }
      }
      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null)
        }
      }
    }
  }
  const patchChildren = (n1, n2, container) => {
    const c1 = n1.children
    const c2 = n2.children
    // 老的有儿子，新的没儿子，新的有儿子老的没儿子，新老都有儿子，新老都是文本
  }
  const patchElement = (n1, n2, container) => {
    // 元素节点是相同节点
    let el = (n2.el = n1.el)
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    patchProps(oldProps, newProps, el)
    patchChildren(n1, n2, container)
  }
  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor)
    } else {
      // 元素更新
      patchElement(n1, n2, container)
    }
  }
  // --------------------处理元素-----------------------
  // --------------------处理文本----------------------
  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert((n2.el = hostCreateText(n2.children)), container)
    }
  }
  const isSameVNodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key
  }
  const unmount = (n1) => {
    hostRemove(n1.el) // 如果是组件需要调用组件的生命周期
  }
  const patch = (n1, n2, container, anchor = null) => {
    const { shapeFlag, type } = n2
    debugger
    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = hostNextSibling(n1.el)
      unmount(n1)
      n1 = null
    }
    switch (type) {
      case TEXT:
        processText(n1, n2, container)
        break

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, anchor)
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container)
          console.log("组件")
        }
        break
    }
  }
  const render = (vnode, container) => {
    patch(null, vnode, container)
  }
  return {
    createApp: createAppAPI(render),
  }
}
