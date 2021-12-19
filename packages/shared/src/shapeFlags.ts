export const enum ShapeFlags {
  ELEMENT = 1,
  FUNCTIONAL_COMPONENT = 1 << 1, // 10 2
  STATEFUL_COMPONENT = 1 << 2, // 100 4
  TEXT_CHILDREN = 1 << 3, // 1000 8
  ARRAY_CHILDREN = 1 << 4, // 10000 16
  SLOTS_CHILDREN = 1 << 5, // 32
  TELEPORT = 1 << 6, // 64
  SUSPENSE = 1 << 7, // 128
  COMPONENT_SHOULD_KEEP_ALIVE = 1 << 8, // 256
  COMPONENT_KEPT_ALIVE = 1 << 9,
  COMPONENT = ShapeFlags.STATEFUL_COMPONENT | ShapeFlags.FUNCTIONAL_COMPONENT, // 110 或运算
}
// 100 & 110 全是1 才是1  =》 100 true
// | 有一个1 就是1
// & 都是1 才是1
