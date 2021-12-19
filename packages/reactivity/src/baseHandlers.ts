import {
  extend,
  isObject,
  isArray,
  isIntergerKey,
  hasChanged,
  hasOwn,
} from "@vue/shared";
import { reactive, readonly } from ".";
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOrType } from "./operators";

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const showllowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter(true);
export const mutableHandlers = {
  get,
  set,
};
export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet,
};

let readonlyObj = {
  set: (target, key) => {
    console.warn(`set on key ${key} falied`);
  },
};
export const readonlyHandlers = extend(
  {
    get: readonlyGet,
  },
  readonlyObj
);
export const shallowReadonlyHandlers = extend(
  {
    get: showllowReadonlyGet,
  },
  readonlyObj
);

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    // proxy + Reflect
    // 后续Object上的方法 会被迁移到Reflect.getProptypeof()
    // 以前target[key] = value 方法设置值，并不会保异常，也没有返回值标识
    // Reflect 具备返回值
    const res = Reflect.get(target, key, receiver);
    if (!isReadonly) {
      // 收集依赖，等会数据变化更新对应视图
      track(target, TrackOpTypes.GET, key);
    }
    if (shallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }

    return res;
  };
}
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key];
    let hasKey =
      isObject(target) && isIntergerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key);
    const result = Reflect.set(target, key, value, receiver);
    // 新增的还是修改的
    if (!hasKey) {
      // 新增
      trigger(target, TriggerOrType.ADD, key, value);
    } else if (hasChanged(oldValue, value)) {
      // 修改
      trigger(target, TriggerOrType.SET, key, value, oldValue);
    }
    // 当数据更新时， 通知对应属性的effect重新执行
    return result;
  };
}
// function trigger(target: any, ADD: TriggerOrType, key: any, value: any)
