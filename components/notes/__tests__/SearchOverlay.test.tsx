jest.mock('@/components/notes/ListNoteItem', () => {
  const React = require('react')
  return {
    __esModule: true,
    default: ({ note }: any) => React.createElement('Text', null, note.title),
  }
})

import { act } from 'react'
import { InteractionManager } from 'react-native'
import { renderTree, findPressables, press } from '@/test-utils'
import SearchOverlay from '@/components/notes/SearchOverlay'
import { NoteModelType } from '@/types'

jest.useFakeTimers()

const notes: NoteModelType[] = [
  { id: '1', title: 'Apple Pie', content: 'tasty', locked: 0, date: '2026-01-01T00:00:00.000Z' },
  { id: '2', title: 'Banana', content: 'recipe here', locked: 0, date: '2026-01-01T00:00:00.000Z' },
  { id: '3', title: 'Cherry', content: 'nothing', locked: 0, date: '2026-01-01T00:00:00.000Z' },
]

function findFlatList(tree: any) {
  return tree.root.findAll(
    (n: any) =>
      n.props &&
      typeof n.props.renderItem === 'function' &&
      typeof n.props.keyExtractor === 'function',
  )[0]
}

describe('components/notes/SearchOverlay', () => {
  let runAfterSpy: jest.SpyInstance

  beforeEach(() => {
    runAfterSpy = jest
      .spyOn(InteractionManager, 'runAfterInteractions')
      .mockImplementation((cb: any) => cb())
  })

  afterEach(() => {
    runAfterSpy.mockRestore()
  })

  const defaultProps = {
    visible: true,
    notes,
    onClose: jest.fn(),
    setSearchTerm: jest.fn(),
    handleNotePressed: jest.fn(),
  }

  it('renders nothing filtered when there is no search term', () => {
    const tree = renderTree(<SearchOverlay {...defaultProps} searchTerm="" />)
    expect(findFlatList(tree).props.data).toEqual([])
  })

  it('filters notes by title and content', () => {
    const tree = renderTree(<SearchOverlay {...defaultProps} searchTerm="rec" />)
    const data = findFlatList(tree).props.data
    expect(data).toHaveLength(1)
    expect(data[0].id).toBe('2')
  })

  it('renders each filtered item via renderItem and extracts keys', () => {
    const tree = renderTree(<SearchOverlay {...defaultProps} searchTerm="a" />)
    const flatList = findFlatList(tree)
    const item = { id: '9', title: 'Rendered', content: 'x', locked: 0, date: '2026-01-01T00:00:00.000Z' }
    expect(flatList.props.renderItem({ item })).toBeDefined()
    expect(flatList.props.keyExtractor(item)).toBe('9')
  })

  it('focuses the input after the modal onShow callback', () => {
    const tree = renderTree(<SearchOverlay {...defaultProps} searchTerm="" />)
    const modal = tree.root.findAll(
      (n: any) => n.props && typeof n.props.onShow === 'function',
    )[0]
    act(() => modal.props.onShow())
    act(() => jest.advanceTimersByTime(600))
    expect(runAfterSpy).toHaveBeenCalled()
  })

  it('calls onClose when the close button or the overlay is pressed', () => {
    const onClose = jest.fn()
    const tree = renderTree(
      <SearchOverlay {...defaultProps} onClose={onClose} searchTerm="" />,
    )
    // the CLOSE button is the leaf pressable bound to onClose
    const closeLeaf = findPressables(tree, (n) => n.props.onPress === onClose)
    expect(closeLeaf.length).toBe(1)
    press(closeLeaf[0])

    // the overlay is the outermost node bound to onClose
    const overlay = tree.root.findAll(
      (n: any) => n.props && n.props.onPress === onClose,
    )[0]
    act(() => overlay.props.onPress())

    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('stops propagation when pressing inside the inner container', () => {
    const onClose = jest.fn()
    const tree = renderTree(
      <SearchOverlay {...defaultProps} onClose={onClose} searchTerm="" />,
    )
    const stopNode = tree.root.findAll(
      (n: any) =>
        n.props &&
        typeof n.props.onPress === 'function' &&
        n.props.onPress !== onClose,
    )[0]
    const event = { stopPropagation: jest.fn() }
    act(() => stopNode.props.onPress(event))
    expect(event.stopPropagation).toHaveBeenCalled()
  })
})
