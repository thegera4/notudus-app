jest.mock('expo-router', () => ({
  router: { navigate: jest.fn(), push: jest.fn(), dismissAll: jest.fn() },
}))

jest.mock('@/models/Note', () => ({
  __esModule: true,
  default: { deleteNote: jest.fn() },
}))

jest.mock('@/components/shared/CustomModal', () => ({
  __esModule: true,
  default: jest.fn(() => null),
}))

import { renderTree, findPressables, press, hasText } from '@/test-utils'
import { router } from 'expo-router'
import TopBar from '@/components/shared/TopBar'
import Note from '@/models/Note'
import CustomModal from '@/components/shared/CustomModal'
import { ScreenEnum } from '@/constants/Enums'
import { homeRoute } from '@/constants/Routes'
import { NoteModelType, TopBarProps } from '@/types'

const CustomModalMock = CustomModal as unknown as jest.Mock
const note: NoteModelType = {
  id: 'n1',
  title: 'T',
  content: 'C',
  locked: 0,
  date: '2026-01-01T00:00:00.000Z',
}

const baseNotes: TopBarProps = {
  screen: ScreenEnum.Notes,
  auth: false,
  view: 'list',
}

describe('components/shared/TopBar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders the screen title for the Notes screen', () => {
    const tree = renderTree(<TopBar {...baseNotes} />)
    expect(hasText(tree, 'Notes')).toBe(true)
  })

  it('renders the lock/search/view icons and fires their callbacks', () => {
    const onLockPress = jest.fn()
    const onSearchPress = jest.fn()
    const onViewPress = jest.fn()
    const tree = renderTree(
      <TopBar
        {...baseNotes}
        auth={true}
        onLockPress={onLockPress}
        onSearchPress={onSearchPress}
        onViewPress={onViewPress}
        view="list"
      />,
    )

    const lock = findPressables(tree, (n) => n.props.onPress === onLockPress)[0]
    const search = findPressables(tree, (n) => n.props.onPress === onSearchPress)[0]
    const view = findPressables(tree, (n) => n.props.onPress === onViewPress)[0]

    press(lock)
    press(search)
    press(view)
    expect(onLockPress).toHaveBeenCalledTimes(1)
    expect(onSearchPress).toHaveBeenCalledTimes(1)
    expect(onViewPress).toHaveBeenCalledTimes(1)
  })

  it('renders without optional icons when callbacks are not provided', () => {
    const tree = renderTree(<TopBar screen={ScreenEnum.Notes} auth={false} view="grid" />)
    expect(hasText(tree, 'Notes')).toBe(true)
    expect(findPressables(tree).length).toBe(0)
  })

  it('renders the lock-closed and grid icons for the unauthenticated grid view', () => {
    const onLockPress = jest.fn()
    const onViewPress = jest.fn()
    const tree = renderTree(
      <TopBar
        screen={ScreenEnum.Notes}
        auth={false}
        onLockPress={onLockPress}
        onViewPress={onViewPress}
        view="grid"
      />,
    )
    expect(findPressables(tree, (n) => n.props.onPress === onLockPress).length).toBe(1)
    expect(findPressables(tree, (n) => n.props.onPress === onViewPress).length).toBe(1)
  })

  it('shows pending tasks count for the Todos screen', () => {
    const tasks = [
      { id: '1', todo: 'a', done: 0, date: '2026-01-01T00:00:00.000Z' },
      { id: '2', todo: 'b', done: 1, date: '2026-01-01T00:00:00.000Z' },
      { id: '3', todo: 'c', done: 0, date: '2026-01-01T00:00:00.000Z' },
    ]
    const tree = renderTree(
      <TopBar screen={ScreenEnum.Todos} auth={false} view="ToDos" tasks={tasks} />,
    )
    expect(hasText(tree, '2 pending tasks')).toBe(true)
  })

  it('shows zero pending tasks when no tasks are provided', () => {
    const tree = renderTree(
      <TopBar screen={ScreenEnum.Todos} auth={false} view="ToDos" />,
    )
    expect(hasText(tree, '0 pending tasks')).toBe(true)
  })

  it('renders the back and shield icons for a new note (AddNote)', () => {
    const onBackPress = jest.fn()
    const onShieldPress = jest.fn()
    const tree = renderTree(
      <TopBar
        screen={ScreenEnum.AddNote}
        auth={false}
        view="Add Note"
        onBackPress={onBackPress}
        onShieldPress={onShieldPress}
        newNoteLocked={true}
      />,
    )

    const back = findPressables(tree, (n) => n.props.onPress === onBackPress)[0]
    const shield = findPressables(tree, (n) => n.props.onPress === onShieldPress)[0]
    press(back)
    press(shield)
    expect(onBackPress).toHaveBeenCalledTimes(1)
    expect(onShieldPress).toHaveBeenCalledTimes(1)
  })

  it('renders the shield-outline icon when the new note is not locked', () => {
    const onBackPress = jest.fn()
    const onShieldPress = jest.fn()
    const tree = renderTree(
      <TopBar
        screen={ScreenEnum.AddNote}
        auth={false}
        view="Add Note"
        onBackPress={onBackPress}
        onShieldPress={onShieldPress}
        newNoteLocked={false}
      />,
    )
    expect(findPressables(tree, (n) => n.props.onPress === onBackPress).length).toBe(1)
  })

  it('does not render back/shield icons when callbacks are missing (AddNote)', () => {
    const tree = renderTree(
      <TopBar screen={ScreenEnum.AddNote} auth={false} view="Add Note" />,
    )
    expect(findPressables(tree).length).toBe(0)
  })

  it('renders the trash icon for an existing note and deletes it on confirm', () => {
    const tree = renderTree(
      <TopBar
        screen={ScreenEnum.AddNote}
        auth={false}
        view="Add Note"
        currentNote={note}
      />,
    )

    const trash = findPressables(tree)[0]
    press(trash)
    expect(CustomModalMock).toHaveBeenCalledTimes(1)

    // cancel keeps the modal closed (no deletion)
    press({ props: { onPress: CustomModalMock.mock.calls[0][0].onCancel } } as any)
    expect(Note.deleteNote).not.toHaveBeenCalled()

    // open again and confirm the deletion
    const trashAgain = findPressables(tree)[0]
    press(trashAgain)
    press({ props: { onPress: CustomModalMock.mock.calls[1][0].onConfirm } } as any)
    expect(Note.deleteNote).toHaveBeenCalledWith('n1')
    expect(router.navigate).toHaveBeenCalledWith(homeRoute)
  })
})
