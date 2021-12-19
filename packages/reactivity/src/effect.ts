import { isArray, isIntergerKey } from "./../../shared/src/index"
import { TriggerOrType } from "./operators"

export function effect(fn, options: any = {}) {
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}
let uid = 0
let activeEffect // 存储effct
const effectStack = []
function createReactiveEffect(fn, options) {
  const effect = function reactEffect() {
    // 保证effect没有加入到effectStack中
    if (!effectStack.includes(effect)) {
      // fn 可能会报错
      try {
        effectStack.push(effect)
        activeEffect = effect
        return fn()
      } finally {
        effectStack.pop()
        activeEffect = effectStack[effectStack.length - 1]
      }
    }
  }
  effect.id = uid++ // 用于区分
  effect._isEffect = true // 标识这个是响应的effect
  effect.raw = fn
  effect.options = options
  return effect
}
//  {name:'zz', age:12} => name => [effect, effect]
// weakMap key =>  { name: 'zz', age: 12}  value (map) => {name => set}
// 让某个对象中的属性收集effect函数
const targetMap = new WeakMap()
export function track(target, type, key) {
  // 此属性不用收集，因为没在effect中
  if (activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
  console.log(targetMap)
}
export function trigger(
  target: any,
  type: TriggerOrType,
  key?: any,
  newValue?: any,
  oldValue?: any
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return
  const effects = new Set() // 这里去重
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach((effect) => {
        effects.add(effect)
      })
    }
  }
  // 我要将所有的effect 全部存到一个新的集合中，最终一起执行
  if (key === "length" && isArray(target)) {
    depsMap.forEach((dep, key) => {
      // state.arr.length = 1 2>1 更改的长度小于收集的索引，那么索引也需要触发effect
      if (key === "length" || key > newValue) {
        add(dep)
      }
    })
  } else {
    // 可能是对象
    if (key !== undefined) {
      // 这里肯定是修改，不是新增
      add(depsMap.get(key))
    }
    // 如果修改数组中的某一个索引 怎么办?
    switch (type) {
      case TriggerOrType.ADD:
        if (isArray(target) && isIntergerKey(key)) {
          add(depsMap.get("length"))
        }
    }
  }
  effects.forEach((effect: any) => {
    if (effect.options.scheduler) {
      effect.options.scheduler(effect)
    } else {
      effect()
    }
  })
}
// set
// effect(() => {
//     state.name  state.name state.name
// })
// 无限会掉
// effect(() => {
//     state.age++
// })
// effect(() => {
//     state.name -> effect1
//     effect(() => {
//         state.age -> effect2
//     })
//     state.address -> effect2
// })
