import { act } from 'react'
import TestRenderer from 'react-test-renderer'

/**
 * Render an element with react-test-renderer, wrapped in act() so that
 * effects and state updates are flushed. Returns the test renderer tree.
 */
export function renderTree(el: React.ReactElement): TestRenderer.ReactTestRenderer {
  let tree!: TestRenderer.ReactTestRenderer
  act(() => {
    tree = TestRenderer.create(el)
  })
  return tree
}

/**
 * Re-render an existing tree with new props/element, wrapped in act().
 */
export function rerenderTree(
  tree: TestRenderer.ReactTestRenderer,
  el: React.ReactElement,
): void {
  act(() => {
    tree.update(el)
  })
}

/** Read the text content of a node's `children` prop. */
function nodeText(node: TestRenderer.ReactTestInstance): string {
  const c = (node as any).children
  return Array.isArray(c) ? c.join('') : typeof c === 'string' ? c : ''
}

/**
 * Find every leaf node (except the root) that declares an `onPress` handler
 * and has no descendant with its own `onPress`. This avoids matching wrapper
 * components (e.g. TopBarIcon) that merely forward `onPress` to an inner
 * Pressable/TouchableOpacity. `findAllByType(Pressable)` cannot be used because
 * the runtime reference does not match the imported one in jest.
 */
export function findPressables(
  tree: TestRenderer.ReactTestRenderer,
  filter: (node: TestRenderer.ReactTestInstance) => boolean = () => true,
): TestRenderer.ReactTestInstance[] {
  return tree.root.findAll((n) => {
    if (!n.props || typeof n.props.onPress !== 'function') return false
    if (n === tree.root) return false
    const hasDescendantPress = n.findAll(
      (d) => d !== n && d.props && typeof d.props.onPress === 'function',
    ).length > 0
    if (hasDescendantPress) return false
    return filter(n)
  })
}

/** The deepest pressable node (typically the actual interactive element). */
export function lastPressable(
  tree: TestRenderer.ReactTestRenderer,
): TestRenderer.ReactTestInstance {
  const all = findPressables(tree)
  return all[all.length - 1]
}

/** Invoke a node's onPress handler inside act(), optionally with an event. */
export function press(
  node: TestRenderer.ReactTestInstance | undefined,
  event?: unknown,
): void {
  if (!node) return
  act(() => {
    node.props.onPress?.(event)
  })
}

/** Whether the tree contains a node whose text content equals `text`. */
export function hasText(
  tree: TestRenderer.ReactTestRenderer,
  text: string,
): boolean {
  return tree.root.findAll((n) => nodeText(n) === text).length > 0
}

/** All text contents rendered in the tree, in order. */
export function getTexts(
  tree: TestRenderer.ReactTestRenderer,
): string[] {
  return tree.root
    .findAll((n) => nodeText(n).length > 0)
    .map((n) => nodeText(n))
}

/** Find the first node whose text content equals the given string (throws if missing). */
export function findText(
  tree: TestRenderer.ReactTestRenderer,
  text: string,
): TestRenderer.ReactTestInstance {
  const node = tree.root.findAll((n) => nodeText(n) === text)[0]
  if (!node) throw new Error(`Text not found: ${text}`)
  return node
}

