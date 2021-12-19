import { reactive } from '.';
import { isObject } from '@vue/shared';
import { hasChanged, isArray } from './../../shared/src/index';
import { track, trigger } from "./effect";
import { TrackOpTypes, TriggerOrType } from "./operators";

export function ref(value) { // value是一个普通类型
    //  可以是对象，一般将普通类型变换为对象
    return createRef(value)
}

export function shallowRef(value) {
    return createRef(value, true)
}
const convert = (val) => isObject(val) ? reactive(val) : val
class RefImpl {
    public _value;
    public _v_isRef = true // _v_isRef 表示是一个ref属性
    constructor(public rawValue, public shallow) {
        this._value = shallow ? rawValue : convert(rawValue)
    }

    get value() {
        track(this, TrackOpTypes.GET, 'value')
        return this._value
    }
    set value(newValue) {
        if (hasChanged(newValue, this.rawValue)) {
            this.rawValue = newValue
            this._value = this.shallow ? newValue : convert(newValue)
        }
        trigger(this, TriggerOrType.SET, 'value', newValue)
    }
}
let state = ref({ name: { n: 1 } })
console.log(state.value.name);

function createRef(rawValue: any, shallow = false) {
    return new RefImpl(rawValue, shallow)
}
class ObjectRefImpl {
    public _v_isRef = true
    constructor(public target, public key) {

    }
    get value() {
        return this.target[this.key]
    }
    set value(newValue) {
        this.target[this.key] = newValue
    }
}
export function toRef(target, key) { // 可以把一个对象的key或者值转换为ref类型
    return new ObjectRefImpl(target, key)
}
export function toRefs(object) { // 可以把一个对象的key或者值转换为ref类型
    const ret = isArray(object) ? new Array(object.length) : {}
    for (const key in object) {
        ret[key] = toRef(object, key)
    }
    return ret
}