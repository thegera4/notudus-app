jest.mock('expo-router/html', () => ({
  ScrollViewStyleReset: () => null,
}))

import { renderTree } from '@/test-utils'
import Root from '@/app/+html'

describe('app/+html', () => {
  it('renders the root html document with the responsive background style', () => {
    const tree = renderTree(<Root>{null}</Root>)
    // host nodes: html, head, body
    const types = tree.root
      .findAll(() => true)
      .map((n) => (typeof n.type === 'string' ? n.type : ''))
      .filter(Boolean)
    expect(types).toContain('html')
    expect(types).toContain('head')
    expect(types).toContain('body')
  })
})
