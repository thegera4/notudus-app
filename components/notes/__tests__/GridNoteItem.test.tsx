jest.mock('@/utils/animations', () => ({
  animateListItem: jest.fn(),
}))

import { renderTree, lastPressable, press, hasText } from '@/test-utils'
import GridNoteItem from '@/components/notes/GridNoteItem'
import { animateListItem } from '@/utils/animations'
import { NoteModelType } from '@/types'

const note: NoteModelType = {
  id: '1',
  title: 'My Note',
  content: 'Some content here',
  locked: 0,
  date: '2026-01-02T10:00:00.000Z',
}

describe('components/notes/GridNoteItem', () => {
  beforeEach(() => {
    ;(animateListItem as jest.Mock).mockClear()
  })

  it('renders the note title, content and date and starts the animation', () => {
    const tree = renderTree(<GridNoteItem note={note} onPress={jest.fn()} />)
    expect(hasText(tree, 'My Note')).toBe(true)
    expect(hasText(tree, 'Some content here')).toBe(true)
    expect(hasText(tree, '2026-01-02')).toBe(true)
    expect(animateListItem).toHaveBeenCalledTimes(1)
  })

  it('does not show the Private label for unlocked notes', () => {
    const tree = renderTree(<GridNoteItem note={note} onPress={jest.fn()} />)
    expect(hasText(tree, 'Private')).toBe(false)
  })

  it('shows the Private label for locked notes', () => {
    const tree = renderTree(
      <GridNoteItem note={{ ...note, locked: 1 }} onPress={jest.fn()} />,
    )
    expect(hasText(tree, 'Private')).toBe(true)
  })

  it('calls onPress with the note when pressed', () => {
    const onPress = jest.fn()
    const tree = renderTree(<GridNoteItem note={note} onPress={onPress} />)
    press(lastPressable(tree))
    expect(onPress).toHaveBeenCalledWith(note)
  })

  it('applies the pressed style for the pressable', () => {
    const tree = renderTree(<GridNoteItem note={note} onPress={jest.fn()} />)
    const style = lastPressable(tree).props.style
    expect(style({ pressed: false })).toEqual(expect.any(Object))
    expect(style({ pressed: true })).toEqual([expect.any(Object), expect.any(Object)])
  })
})
