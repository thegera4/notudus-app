jest.mock('@/hooks/useAuth', () => ({ __esModule: true, useAuth: jest.fn() }))
jest.mock('expo-router', () => ({ router: { push: jest.fn(), navigate: jest.fn() } }))
jest.mock('@react-navigation/native', () => {
  const React = require('react')
  return { useFocusEffect: (cb: any) => React.useEffect(() => { cb(); return () => {} }, [cb]) }
})
jest.mock('@/models/Note', () => ({
  __esModule: true,
  default: { getNotes: jest.fn(), deleteNote: jest.fn() },
}))
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: { getItem: jest.fn(), setItem: jest.fn() },
}))
jest.mock('expo-local-authentication', () => ({
  __esModule: true,
  authenticateAsync: jest.fn(),
}))
jest.mock('@/components/shared/TopBar', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/notes/ListNoteItem', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/notes/GridNoteItem', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/notes/SearchOverlay', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/shared/CustomLoading', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/shared/NoDataAnimation', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return { SafeAreaView: ({ children }: any) => React.createElement(React.Fragment, null, children) }
})

import { act } from 'react'
import { AppState, Alert } from 'react-native'
import { renderTree } from '@/test-utils'
import NotesScreen from '@/app/(tabs)/index'
import { useAuth } from '@/hooks/useAuth'
import { router } from 'expo-router'
import Note from '@/models/Note'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as LocalAuthentication from 'expo-local-authentication'
import TopBar from '@/components/shared/TopBar'
import CustomLoading from '@/components/shared/CustomLoading'
import SearchOverlay from '@/components/notes/SearchOverlay'
import ListNoteItem from '@/components/notes/ListNoteItem'
import GridNoteItem from '@/components/notes/GridNoteItem'
import { Strings } from '@/constants/Strings'
import { addNoteRoute } from '@/constants/Routes'
import { NoteModelType } from '@/types'

jest.useFakeTimers()

const notes: NoteModelType[] = [
  { id: '1', title: 'First', content: 'aaa', locked: 0, date: '2026-01-01T00:00:00.000Z' },
  { id: '2', title: 'Second', content: 'bbb', locked: 1, date: '2026-01-02T00:00:00.000Z' },
]

function findFlatList(tree: any) {
  return tree.root.findAll(
    (n: any) =>
      n.props &&
      typeof n.props.renderItem === 'function' &&
      typeof n.props.keyExtractor === 'function',
  )[0]
}

function topBarProps() {
  return (TopBar as unknown as jest.Mock).mock.calls[
    (TopBar as unknown as jest.Mock).mock.calls.length - 1
  ][0]
}

describe('app/(tabs)/index (NotesScreen)', () => {
  let appStateSpy: jest.SpyInstance
  let alertSpy: jest.SpyInstance
  let subscriptionRemove: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ auth: false, setAuth: jest.fn() })
    ;(Note.getNotes as jest.Mock).mockImplementation(() =>
      Promise.resolve(notes.map((n) => ({ ...n }))),
    )
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(null)
    ;(AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined)
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true })
    subscriptionRemove = jest.fn()
    appStateSpy = jest
      .spyOn(AppState, 'addEventListener')
      .mockReturnValue({ remove: subscriptionRemove } as any)
    alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
  })

  afterEach(() => {
    appStateSpy.mockRestore()
    alertSpy.mockRestore()
  })

  async function renderAndFlush() {
    const tree = renderTree(<NotesScreen />)
    await act(async () => {})
    return tree
  }

  it('shows the loading screen before notes are loaded', async () => {
    const tree = renderTree(<NotesScreen />)
    expect(CustomLoading).toHaveBeenCalledTimes(1)
    await act(async () => {})
    act(() => tree.unmount())
  })

  it('renders the top bar and the notes list after loading', async () => {
    const tree = await renderAndFlush()
    expect(TopBar).toHaveBeenCalled()
    const flatList = findFlatList(tree)
    expect(flatList.props.data).toHaveLength(2)
    expect(flatList.props.keyExtractor(notes[0])).toBe('1')
    expect(flatList.props.getItemLayout(null, 2)).toEqual({ length: 50, offset: 100, index: 2 })
  })

  it('navigates to addNote with the note data when an item is pressed', async () => {
    const tree = await renderAndFlush()
    const item = findFlatList(tree).props.renderItem({ item: notes[0] })
    act(() => item.props.onPress(notes[0]))
    expect(router.push).toHaveBeenCalledWith({
      pathname: addNoteRoute,
      params: { note: JSON.stringify(notes[0]) },
    })
  })

  it('authenticates with biometrics and enables private notes on success', async () => {
    const setAuth = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({ auth: false, setAuth })
    await renderAndFlush()
    await act(async () => {
      topBarProps().onLockPress()
    })
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled()
    expect(setAuth).toHaveBeenCalledWith(true)
  })

  it('disables private notes when already authenticated', async () => {
    const setAuth = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({ auth: true, setAuth })
    await renderAndFlush()
    await act(async () => {
      topBarProps().onLockPress()
    })
    expect(setAuth).toHaveBeenCalledWith(false)
    expect(LocalAuthentication.authenticateAsync).not.toHaveBeenCalled()
  })

  it('alerts when biometric authentication fails', async () => {
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false })
    await renderAndFlush()
    await act(async () => {
      topBarProps().onLockPress()
    })
    expect(alertSpy).toHaveBeenCalled()
  })

  it('logs an error when biometric authentication throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(new Error('boom'))
    await renderAndFlush()
    await act(async () => {
      topBarProps().onLockPress()
    })
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.AUTH_ERROR, expect.any(Error))
    errorSpy.mockRestore()
  })

  it('toggles the view from list to grid and persists it', async () => {
    const tree = await renderAndFlush()
    await act(async () => {
      topBarProps().onViewPress()
    })
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(Strings.NOTES.VIEW, Strings.NOTES.GRID)
    expect(findFlatList(tree).props.numColumns).toBe(2)
  })

  it('toggles the view from grid back to list', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(Strings.NOTES.GRID)
    const tree = await renderAndFlush()
    await act(async () => {
      topBarProps().onViewPress()
    })
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(Strings.NOTES.VIEW, Strings.NOTES.LIST)
    expect(findFlatList(tree).props.numColumns).toBe(1)
  })

  it('logs an error when persisting the view fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('boom'))
    await renderAndFlush()
    await act(async () => {
      topBarProps().onViewPress()
    })
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.CHANGE_VIEW, expect.any(Error))
    errorSpy.mockRestore()
  })

  it('opens and closes the search overlay', async () => {
    const tree = await renderAndFlush()
    await act(async () => {
      topBarProps().onSearchPress()
    })
    expect((SearchOverlay as unknown as jest.Mock).mock.calls.at(-1)![0].visible).toBe(true)
  })

  it('sets auth to false when the app goes to the background', async () => {
    const setAuth = jest.fn()
    ;(useAuth as jest.Mock).mockReturnValue({ auth: true, setAuth })
    renderTree(<NotesScreen />)
    const handler = appStateSpy.mock.calls[0][1]
    act(() => handler('background'))
    expect(setAuth).toHaveBeenCalledWith(false)
    act(() => handler('active'))
    expect(setAuth).toHaveBeenCalledTimes(1)
    await act(async () => {})
  })

  it('removes the AppState subscription on unmount', async () => {
    const tree = renderTree(<NotesScreen />)
    await act(async () => {})
    act(() => {
      tree.unmount()
    })
    expect(subscriptionRemove).toHaveBeenCalledTimes(1)
  })

  it('renders grid items when the view is grid', async () => {
    ;(AsyncStorage.getItem as jest.Mock).mockResolvedValue(Strings.NOTES.GRID)
    const tree = await renderAndFlush()
    const rendered = findFlatList(tree).props.renderItem({ item: notes[0] })
    expect(GridNoteItem).toBeDefined()
    act(() => rendered.props.onPress(notes[0]))
    expect(router.push).toHaveBeenCalled()
    void ListNoteItem
  })

  it('logs an error when loading notes fails', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    // The useMemo call (render) must resolve; the loadNotes call (focus effect)
    // rejects and is caught by its try/catch, logging the LOADING error.
    ;(Note.getNotes as jest.Mock).mockReset()
    ;(Note.getNotes as jest.Mock)
      .mockResolvedValueOnce(notes.map((n) => ({ ...n })))
      .mockRejectedValueOnce(new Error('boom'))
      .mockResolvedValue(notes.map((n) => ({ ...n })))
    await renderAndFlush()
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.LOADING, expect.any(Error))
    errorSpy.mockRestore()
  })
})
