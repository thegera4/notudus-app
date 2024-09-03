import { Note } from '../types'

/**
 * This function returns all of the notes if the user is authenticated, otherwise it only returns the notes that are not locked.
*/
export const getNotes = (isAuth: boolean, notes: Note[]) => isAuth ? notes : notes.filter(note => note.locked === 0)
