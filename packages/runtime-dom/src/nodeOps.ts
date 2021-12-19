export const nodeOps = {
  createElement: (tagName) => document.createElement(tagName),
  remove: (child) => {
    const parent = child.parentNode
    if (parent) {
      parent.removeChild(child)
    }
  },
  insert: (child, parent, anchor) => {
    parent.insertBefore(child, anchor) // 如果参照物为空，相当于appendChild
  },
  querySelector: (selector) => document.querySelector(selector),
  setElementText: (el, text) => (el.textContent = text),
  createText: (text) => document.createTextNode(text),
  setText: (node, text) => (node.setValue = text),
  nextSibling: (node) => node.nextSibling,
}
