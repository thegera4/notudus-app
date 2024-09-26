import { Note } from '../types'
import { notes } from '@/fakenotes'

/**
 * This function returns all of the notes if the user is authenticated, otherwise it only returns the notes that are not locked.
 * @param {boolean} isAuth - A boolean that indicates if the user is authenticated.
 * @param {Note[]} notes - An array of notes, used to filter the notes that are not private.
 * @returns {Note[]} - An array of notes that are not private.
*/
export const getNotes = (isAuth: boolean, notes: Note[]): Note[] => isAuth ? notes : notes.filter(note => note.locked === 0)

/**
 * This function updates a note in the database.
 * @param {number} noteId - A string that represents the id of the note to be updated.
 * @param {Note} note - A Note object that contains the updated information.
 * @returns {void} This function does not return anything.
*/
export const updateNote = (noteId: number, note: Note): void => {
    const noteIndex = notes.findIndex(note => note.id.toString() === noteId.toString())
    notes[noteIndex] = { ...note, id: Number(note.id) }
}