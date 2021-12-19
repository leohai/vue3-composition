import { createVnode } from "./vnode"

export function createAppAPI(render) {
  return function createApp(rootComponent, rootProps) {
    const app = {
      _props: rootProps,
      _component: rootComponent,
      _container: null,
      mount(container) {
        // 1.根据组件创建虚拟节点
        // 2.将虚拟节点和容器获取到后调用render方法进行渲染
        const vnode = createVnode(rootComponent, rootProps)
        console.log(vnode)

        render(vnode, container)
        app._container = container
      },
    }
    return app
  }
}
