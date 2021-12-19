import { isObject } from '@vue/shared';
import { mutableHandlers, shallowReactiveHandlers, readonlyHandlers, shallowReadonlyHandlers } from './baseHandlers'
export function reactive(target) {
    return createReactiveObject(target, false, mutableHandlers)
}
export function shallowReactive(target) {
    return createReactiveObject(target, false, shallowReactiveHandlers)
}
export function readonly(target) {
    return createReactiveObject(target, true, readonlyHandlers)
}
export function shallowReadonly(target) {
    return createReactiveObject(target, true, shallowReadonlyHandlers)
}
// 柯里化 proxy 拦截
const reactiveMap = new WeakMap()
const readonlyMap = new WeakMap()
export function createReactiveObject(target, isReadonly, baseHandlers) {
    if (!isObject(target)) {
        return target
    }
    // 如果某个对象已经被代理过了，就不需要代理了，可能一个对象被代理时深度又被仅读代理了
    const proxyMap = isReadonly ? readonlyMap : reactiveMap
    const exisitProxy = proxyMap.get(target)
    if (exisitProxy) {
        return exisitProxy
    }
    const proxy = new Proxy(target, baseHandlers)
    proxyMap.set(target, proxy) // 将要代理的对象和对应代理结果缓存起来
    return proxy
}