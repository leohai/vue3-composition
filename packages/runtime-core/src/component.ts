import { ShapeFlags, isFunction, isObject } from "@vue/shared"
import { publicInstanceProxyHandlers } from "./componentPublicInstance"
export function createComponentInstance(vnode) {
  const instance = {
    vnode,
    type: vnode.type,
    props: {},
    attrs: {},
    slots: {},
    ctx: {},
    data: {},
    setupState: {}, // 如果setup返回一个对象，这个对象会最为setupstate
    render: null,
    isMounted: false,
  }
  instance.ctx = { _: instance }
  return instance
}
export function setupComponent(instance) {
  const { props, children } = instance.vnode
  // 根据props 解析 props attrs， 将其放到instance
  instance.props = props
  instance.children = children // 插槽的解析 initSlot()
  let isStateful = instance.vnode.shapeFlag & ShapeFlags.STATEFUL_COMPONENT
  if (isStateful) {
    // 调用当前实例的setup方法，用setup返回值填充 setupstate 和对应的render方法
    setupStatefulComponent(instance)
  }
}
function setupStatefulComponent(instance) {
  // 1代理 传递给render函数的参数
  // 2获取组件的类型 拿到组件的setup方法
  instance.proxy = new Proxy(instance.ctx, publicInstanceProxyHandlers as any)
  let Component = instance.type
  let { setup } = Component
  if (setup) {
    let setupContext = createSetupContext(instance)
    const setupResult = setup(instance.props, setupContext)
    handleSetupResult(instance, setupResult)
  } else {
    finishComponentSetup(instance)
  }
}

function handleSetupResult(instance, setupResult) {
  if (isFunction(setupResult)) {
    instance.render = setupResult
  } else if (isObject(setupResult)) {
    instance.setupState = setupResult
  }
  finishComponentSetup(instance)
}
function finishComponentSetup(instance) {
  let Component = instance.type
  if (!instance.render) {
    // 对template 模版进行编译，产生render函数
    if (!Component.render && Component.template) {
      // 将编译结果赋予给Component.render
    }
    instance.render = Component.render
  } else {
  }
}
function createSetupContext(instance) {
  return {
    attrs: instance.attrs,
    slots: instance.slots,
    emit: () => {},
    expose: () => {},
  }
}
