import * as SQLite from 'expo-sqlite'

export const db = SQLite.openDatabaseAsync('notudus.db')

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