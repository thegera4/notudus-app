jest.mock('expo-router', () => {
  const React = require('react')
  const Link = (props: any) => React.createElement('Text', null, props.children)
  const Stack = { Screen: () => null }
  return { Link, Stack }
})

import { renderTree, hasText } from '@/test-utils'
import NotFoundScreen from '@/app/+not-found'

describe('app/+not-found', () => {
  it('renders the not found message and a link home', () => {
    const tree = renderTree(<NotFoundScreen />)
    expect(hasText(tree, "This screen doesn't exist.")).toBe(true)
    expect(hasText(tree, 'Go to home screen!')).toBe(true)
  })
})
