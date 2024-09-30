import { Strings } from '@/constants/Strings'
import { NoteModelType } from '@/types'
import { db } from '@/utils/db'

/** This class represents a Note object. 
* @constructor 
* @param {string} id - The id of the note.
* @param {string} title - The title of the note.
* @param {string} content - The content of the note.
* @param {string} date - The date of the note.
* @param {number} locked - A number that indicates if the note is locked.
* @method getNotes - This function returns all of the notes.
* @method insertNote - This function inserts a note in the database.
*/
export default class Note  {
  constructor(id: string, title: string, content: string, date: string, locked: number) {
    this.id = id
    this.title = title
    this.content = content
    this.date = date
    this.locked = locked
  }

  id: string
  title: string
  content: string
  date: string
  locked: number
    
  /** This function returns all of the notes if the user is authenticated, otherwise it only returns the notes that are not locked.
  * @param {boolean} isAuth - A boolean that indicates if the user is authenticated.
  * @returns {Promise<NoteModelType[]>} A promise that resolves to an array of notes.
  */
  public static getNotes = async (isAuth: boolean): Promise<NoteModelType[]> => {
    const query: string = isAuth ? 'SELECT * FROM notes' : 'SELECT * FROM notes WHERE locked = 0'
    try{
      const result: NoteModelType[] = (await db).getAllAsync(query) as unknown as NoteModelType[]
      return result
    } catch (e) {
      console.error(Strings.ERRORS.GET_NOTES, e)
      return []
    }
  }

  /** This function inserts a note in the database.
  * @param {NoteModelType} note - A string that represents the id of the note to be retrieved.
  * @returns {Promise<void>} A promise that resolves to void.
  */
  public static insertNote = async (note: NoteModelType): Promise<void> => {
    const query: string = 'INSERT INTO notes (id, title, content, locked, date) VALUES (?, ?, ?, ?, ?)'
    try{
      (await db).runAsync(query, [note.id, note.title, note.content, note.locked, note.date])
    } catch (e) {
      console.error(Strings.ERRORS.INSERT_NOTE, e)
    }
  }

  /** This function updates a note in the database.
  * @param {number} noteId - A string that represents the id of the note to be updated.
  * @param {NoteModelType} note - A Note object that contains the updated information.
  * @returns {Promise<void>} This function does not return anything.
  */
  public static updateNote = async (noteId: string, note: NoteModelType): Promise<void> => {
    const query: string = 'UPDATE notes SET title = ?, content = ?, locked = ?, date = ? WHERE id = ?'
    try{
      (await db).runAsync(query, [note.title, note.content, note.locked, note.date, noteId])
    } catch (e) {
      console.error(Strings.ERRORS.UPDATE_NOTE, e)
    }
  }

  /** This function deletes a note from the database.
  * @param {number} noteId - A string that represents the id of the note to be updated.
  * @returns {Promise<void>} This function does not return anything.
  */
  public static deleteNote = async (noteId: string): Promise<void> => {
    const query: string = 'DELETE FROM notes WHERE id = ?'
    try{
      (await db).runAsync(query, [noteId])
    } catch (e) {
      console.error(Strings.ERRORS.DELETE_NOTE, e)
    }
  }

}