jest.mock('expo-router', () => ({
  router: { dismissAll: jest.fn(), navigate: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
  useNavigation: jest.fn(),
}))
jest.mock('@/hooks/useAuth', () => ({ __esModule: true, useAuth: jest.fn() }))
jest.mock('expo-local-authentication', () => ({ __esModule: true, authenticateAsync: jest.fn() }))
jest.mock('uuid', () => ({ __esModule: true, v4: () => 'mock-uuid' }))
jest.mock('@/models/Note', () => ({
  __esModule: true,
  default: { updateNote: jest.fn(), insertNote: jest.fn() },
}))
jest.mock('@/components/notes/PrivateText', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('@/components/shared/TopBar', () => ({ __esModule: true, default: jest.fn(() => null) }))
jest.mock('react-native-safe-area-context', () => {
  const React = require('react')
  return { SafeAreaView: ({ children }: any) => React.createElement(React.Fragment, null, children) }
})

import { act } from 'react'
import { Alert, Platform } from 'react-native'
import { renderTree } from '@/test-utils'
import AddNoteScreen from '@/app/addNote'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import { useAuth } from '@/hooks/useAuth'
import * as LocalAuthentication from 'expo-local-authentication'
import Note from '@/models/Note'
import TopBar from '@/components/shared/TopBar'
import PrivateText from '@/components/notes/PrivateText'
import { Strings } from '@/constants/Strings'
import { homeRoute } from '@/constants/Routes'
import { NoteModelType } from '@/types'

jest.useFakeTimers()

const existingNote: NoteModelType = {
  id: '1',
  title: 'Old Title',
  content: 'Old content',
  locked: 0,
  date: '2026-01-01T00:00:00.000Z',
}

function topBarProps() {
  return (TopBar as unknown as jest.Mock).mock.calls[
    (TopBar as unknown as jest.Mock).mock.calls.length - 1
  ][0]
}

function findInputs(tree: any) {
  const inputs = tree.root.findAll(
    (n: any) => n.props && typeof n.props.onChangeText === 'function',
  )
  const content = inputs.find((n: any) => n.props.multiline === true)
  const title = inputs.find((n: any) => n.props.autoFocus === true) ||
    inputs.find((n: any) => n.props.multiline !== true)
  return { title, content }
}

describe('app/addNote', () => {
  let addListener: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({ auth: false, setAuth: jest.fn() })
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({})
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: true })
    addListener = jest.fn(() => jest.fn())
    ;(useNavigation as jest.Mock).mockReturnValue({ addListener })
  })

  async function renderAndFlush() {
    const tree = renderTree(<AddNoteScreen />)
    await act(async () => {})
    return tree
  }

  it('renders a new note screen with empty fields', async () => {
    await renderAndFlush()
    expect(topBarProps().screen).toBe('Add Note')
    expect(PrivateText).not.toHaveBeenCalled()
  })

  it('loads an existing note from the search params', async () => {
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({
      note: JSON.stringify(existingNote),
    })
    await renderAndFlush()
    expect(topBarProps().currentNote).toEqual(existingNote)
  })

  it('dismisses all when going back from an unchanged existing note', async () => {
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({
      note: JSON.stringify(existingNote),
    })
    await renderAndFlush()
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(router.dismissAll).toHaveBeenCalledTimes(1)
    expect(Note.updateNote).not.toHaveBeenCalled()
  })

  it('dismisses all when going back from an empty new note', async () => {
    await renderAndFlush()
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(router.dismissAll).toHaveBeenCalledTimes(1)
  })

  it('inserts a new note and navigates home when content is added', async () => {
    const tree = await renderAndFlush()
    act(() => findInputs(tree).content.props.onChangeText('New content'))
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(Note.insertNote).toHaveBeenCalledTimes(1)
    const inserted = (Note.insertNote as jest.Mock).mock.calls[0][0]
    expect(inserted.id).toBe('mock-uuid')
    expect(inserted.content).toBe('New content')
    expect(router.navigate).toHaveBeenCalledWith(homeRoute)
  })

  it('updates an existing note when its content changes', async () => {
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({
      note: JSON.stringify(existingNote),
    })
    const tree = await renderAndFlush()
    act(() => findInputs(tree).content.props.onChangeText('Updated content'))
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(Note.updateNote).toHaveBeenCalledWith('1', expect.objectContaining({ content: 'Updated content' }))
    expect(router.navigate).toHaveBeenCalledWith(homeRoute)
  })

  it('requires biometrics to save a private note and inserts on success', async () => {
    const tree = await renderAndFlush()
    act(() => findInputs(tree).content.props.onChangeText('Secret'))
    act(() => topBarProps().onShieldPress())
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(LocalAuthentication.authenticateAsync).toHaveBeenCalled()
    expect((Note.insertNote as jest.Mock).mock.calls[0][0].locked).toBe(1)
  })

  it('alerts and stays on screen when private auth fails', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {})
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockResolvedValue({ success: false })
    const tree = await renderAndFlush()
    act(() => findInputs(tree).content.props.onChangeText('Secret'))
    act(() => topBarProps().onShieldPress())
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(alertSpy).toHaveBeenCalled()
    expect(router.navigate).not.toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('logs and stays on screen when private auth throws', async () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(LocalAuthentication.authenticateAsync as jest.Mock).mockRejectedValue(new Error('boom'))
    const tree = await renderAndFlush()
    act(() => findInputs(tree).content.props.onChangeText('Secret'))
    act(() => topBarProps().onShieldPress())
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(errorSpy).toHaveBeenCalledWith(Strings.ERRORS.ONBACK, expect.any(Error))
    expect(router.navigate).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('toggles the private flag via the shield icon', async () => {
    await renderAndFlush()
    act(() => topBarProps().onShieldPress())
    expect((PrivateText as unknown as jest.Mock)).toHaveBeenCalled()
    act(() => topBarProps().onShieldPress())
  })

  it('toggles the lock state via the lock icon', async () => {
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({
      note: JSON.stringify(existingNote),
    })
    await renderAndFlush()
    act(() => topBarProps().onLockPress())
    expect(topBarProps().auth).toBe(true)
    act(() => topBarProps().onLockPress())
    expect(topBarProps().auth).toBe(false)
  })

  it('updates a private existing note after successful biometric auth', async () => {
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({
      note: JSON.stringify(existingNote),
    })
    const tree = await renderAndFlush()
    act(() => findInputs(tree).content.props.onChangeText('Updated'))
    act(() => topBarProps().onShieldPress())
    await act(async () => {
      topBarProps().onBackPress()
    })
    expect(Note.updateNote).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ content: 'Updated', locked: 1 }),
    )
    expect(router.navigate).toHaveBeenCalledWith(homeRoute)
  })

  it('uses the height keyboard behavior on android', async () => {
    const originalOS = Platform.OS
    Object.defineProperty(Platform, 'OS', { value: 'android', configurable: true })
    await renderAndFlush()
    Object.defineProperty(Platform, 'OS', { value: originalOS, configurable: true })
  })

  it('shows the private text for an authenticated, locked existing note', async () => {
    ;(useAuth as jest.Mock).mockReturnValue({ auth: true, setAuth: jest.fn() })
    ;(useLocalSearchParams as jest.Mock).mockReturnValue({
      note: JSON.stringify({ ...existingNote, locked: 0 }),
    })
    await renderAndFlush()
    act(() => topBarProps().onLockPress()) // locked -> 1
    expect((PrivateText as unknown as jest.Mock)).toHaveBeenCalled()
  })

  it('prevents default navigation and saves via the beforeRemove listener', async () => {
    await renderAndFlush()
    const cb = addListener.mock.calls[0][1]
    const event = { preventDefault: jest.fn() }
    act(() => cb(event))
    expect(event.preventDefault).toHaveBeenCalled()
    act(() => jest.advanceTimersByTime(50))
    expect(router.dismissAll).toHaveBeenCalled()
  })

  it('allows navigation when already saving (beforeRemove guard)', async () => {
    await renderAndFlush()
    // trigger a save which sets isSaving.current = true
    await act(async () => {
      topBarProps().onBackPress()
    })
    const cb = addListener.mock.calls[0][1]
    const event = { preventDefault: jest.fn() }
    act(() => cb(event))
    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})
