import { Colors } from '@/constants/Colors'
import { ScreenEnum } from '@/constants/Enums'
import { homeRoute, addNoteRoute } from '@/constants/Routes'
import { Strings } from '@/constants/Strings'

describe('constants/Colors', () => {
  it('exposes light and dark theme colors', () => {
    expect(Colors.light.text).toBe('#11181C')
    expect(Colors.light.background).toBe('#fff')
    expect(Colors.light.tint).toBe('#0a7ea4')
    expect(Colors.light.icon).toBe('#687076')
    expect(Colors.light.tabIconDefault).toBe('#687076')
    expect(Colors.light.tabIconSelected).toBe('#0a7ea4')
  })

  it('exposes dark theme colors', () => {
    expect(Colors.dark.text).toBe('#ECEDEE')
    expect(Colors.dark.background).toBe('#151718')
    expect(Colors.dark.tint).toBe('#fff')
    expect(Colors.dark.icon).toBe('#9BA1A6')
    expect(Colors.dark.tabIconDefault).toBe('#9BA1A6')
    expect(Colors.dark.tabIconSelected).toBe('#fff')
  })

  it('exposes input and navigation colors', () => {
    expect(Colors.inputs.textPlaceholder).toBe('rgba(255, 255, 255, 0.3)')
    expect(Colors.inputs.selection).toBe('green')
    expect(Colors.bottomNavigation.active).toBe('green')
  })
})

describe('constants/Enums', () => {
  it('exposes the screen names', () => {
    expect(ScreenEnum.Notes).toBe('Notes')
    expect(ScreenEnum.Todos).toBe('Todos')
    expect(ScreenEnum.AddNote).toBe('Add Note')
  })
})

describe('constants/Routes', () => {
  it('exposes the route paths', () => {
    expect(homeRoute).toBe('/')
    expect(addNoteRoute).toBe('/addNote')
  })
})

describe('constants/Strings', () => {
  it('exposes app-level strings', () => {
    expect(Strings.APP_NAME).toBe('Notudus')
  })

  it('exposes tab and topbar labels', () => {
    expect(Strings.TABS.NOTES).toBe('Notes')
    expect(Strings.TABS.TODOS).toBe('ToDos')
    expect(Strings.TOPBAR.NOTES).toBe('Notes')
    expect(Strings.TOPBAR.TODOS).toBe('ToDos')
  })

  it('exposes notes view values', () => {
    expect(Strings.NOTES.LIST).toBe('list')
    expect(Strings.NOTES.VIEW).toBe('view')
    expect(Strings.NOTES.GRID).toBe('grid')
  })

  it('exposes add note placeholders', () => {
    expect(Strings.ADDNOTE.NOTE_TITLE).toBe('Note Title')
    expect(Strings.ADDNOTE.NOTE_CONTENT).toBe('Note Content')
  })

  it('exposes modal strings', () => {
    expect(Strings.MODALS.SEARCH_NOTES).toBe('Search Notes...')
    expect(Strings.MODALS.MAKE_NOTE_PRIVATE).toBe('Make Note Private')
    expect(Strings.MODALS.MAKE_MESSAGE).toBe('Do you want to make this note private?')
    expect(Strings.MODALS.REMOVE_PRIVATE_STATUS).toBe('Remove Private Status')
    expect(Strings.MODALS.REMOVE_MESSAGE).toBe('Do you want to remove the private status of this note?')
    expect(Strings.MODALS.DELETE_NOTE).toBe('Delete Note')
    expect(Strings.MODALS.DELETE_NOTE_MESSAGE).toBe('Are you sure you want to delete this note?')
    expect(Strings.MODALS.DELETE).toBe('DELETE')
    expect(Strings.MODALS.CANCEL).toBe('CANCEL')
    expect(Strings.MODALS.NO_AUTH_METHOD).toBe('No Authentication Method Found')
    expect(Strings.MODALS.NO_AUTH_MESSAGE).toBe('To use this feature, you need to set up a security method in your device settings (fingerprint/pin/pattern).')
  })

  it('exposes error strings', () => {
    expect(Strings.ERRORS.ONBACK).toBe('Error while updating the note on back: ')
    expect(Strings.ERRORS.LOADING).toBe('An error occurred while loading the notes: ')
    expect(Strings.ERRORS.AUTH_ERROR).toBe('Authentication Error: ')
    expect(Strings.ERRORS.CHANGE_VIEW).toBe('Error while changing the view: ')
    expect(Strings.ERRORS.GET).toBe('Error while getting the data: ')
    expect(Strings.ERRORS.INSERT).toBe('Error while inserting data: ')
    expect(Strings.ERRORS.UPDATE).toBe('Error while updating data: ')
    expect(Strings.ERRORS.DELETE).toBe('Error while deleting data: ')
  })
})
