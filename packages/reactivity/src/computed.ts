import { isFunction } from "./../../shared/src/index";
import { effect, track, trigger } from "./effect";
import { TrackOpTypes, TriggerOrType } from "./operators";
class ComputedRefImpl {
  public _value;
  public _dirty = true; // 默认取值时不要用缓存
  public effect;
  constructor(getter, public setter) {
    this.effect = effect(
      getter,
      // 计算属性默认产生一个effect
      {
        lazy: true,
        scheduler: () => {
          if (!this._dirty) {
            this._dirty = true;
            trigger(this, TriggerOrType.SET, "value");
          }
        },
      }
    );
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect();
      this._dirty = false;
    }
    track(this, TrackOpTypes.GET, "value");
    return this._value;
  }
  set value(newValue) {
    this.setter(newValue);
  }
}
export function computed(getterOrOptions) {
  let getter;
  let setter;
  if (isFunction(getterOrOptions)) {
    getter = getterOrOptions;
    setter = () => {
      console.log("computed value must be readonly");
    };
  } else {
    getter = getterOrOptions.get;
    setter = getterOrOptions.set;
  }
  return new ComputedRefImpl(getter, setter);
}
