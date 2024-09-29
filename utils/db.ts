import { Note } from '@/types'
import * as SQLite from 'expo-sqlite'

const db = SQLite.openDatabaseAsync('notudus.db')

/** This function creates 2 tables in the database, one for the notes and another for todos.*/
const createTables = async () => {
  (await db).execAsync(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY NOT NULL UNIQUE,
      title TEXT,
      content TEXT,
      locked INTEGER NOT NULL,
      date TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY NOT NULL UNIQUE,
      todo TEXT NOT NULL,
      done INTEGER NOT NULL
    );
  `)
}

/** This function initializes the database and creates the tables if they do not exist.*/
export const initDB = async () => await createTables()

/**
 * This function returns all of the notes if the user is authenticated, otherwise it only returns the notes that are not locked.
 * @param {boolean} isAuth - A boolean that indicates if the user is authenticated.
 * @returns {Promise<Note[]>} A promise that resolves to an array of notes.
*/
export const getNotes = async (isAuth: boolean): Promise<Note[]> => {
  const query = isAuth ? 'SELECT * FROM notes' : 'SELECT * FROM notes WHERE locked = 0'
  try{
    const result = (await db).getAllAsync(query) as unknown as Note[]
    return result
  } catch (e) {
    console.error("Error getting notes: ", e)
    return []
  }
}

/**
 * This function inserts a note in the database.
 * @param {Note} note - A string that represents the id of the note to be retrieved.
 * @returns {Promise<void>} A promise that resolves to void.
*/
export const insertNote = async (note: Note): Promise<void> => {
  const query = 'INSERT INTO notes (id, title, content, locked, date) VALUES (?, ?, ?, ?, ?)'
  try{
    (await db).runAsync(query, [note.id, note.title, note.content, note.locked, note.date])
  } catch (e) {
    console.error("Error inserting note: ", e)
  }
}

/**
 * This function updates a note in the database.
 * @param {number} noteId - A string that represents the id of the note to be updated.
 * @param {Note} note - A Note object that contains the updated information.
 * @returns {Promise<void>} This function does not return anything.
*/
export const updateNote = async (noteId: string, note: Note): Promise<void> => {
  const query = 'UPDATE notes SET title = ?, content = ?, locked = ?, date = ? WHERE id = ?'
  try{
    (await db).runAsync(query, [note.title, note.content, note.locked, note.date, noteId])
  } catch (e) {
    console.error("Error updating note: ", e)
  }
}

/**
 * This function deletes a note from the database.
 * @param {number} noteId - A string that represents the id of the note to be updated.
 * @returns {Promise<void>} This function does not return anything.
*/
export const deleteNote = async (noteId: string): Promise<void> => {
  const query = 'DELETE FROM notes WHERE id = ?'
  try{
    (await db).runAsync(query, [noteId])
  } catch (e) {
    console.error("Error deleting note: ", e)
  }
}