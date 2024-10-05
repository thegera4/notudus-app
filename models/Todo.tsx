import { Strings } from '@/constants/Strings'
import { db } from '@/utils/db'

/** This class represents a Todo object. 
* @param {string} id - The unique identifier of the todo.
* @param {string} todo - The content of the todo.
* @param {number} done - The status of the todo (0 for not done, 1 for done).
* @param {string} date - The date and time the todo was created.
* @method insertTodo - Inserts a new todo into the database.
* @method getTodos - Retrieves all the todos from the database.
* @method updateTodo - Updates a todo in the database.
* @method deleteTodo - Deletes a todo from the database.
*/
export default class Todo {

  id: string
  todo: string
  done: number
  date: string
  
  constructor(id: string, todo: string, done: number, date: string) {
    this.id = id
    this.todo = todo
    this.done = done
    this.date = date
  }
  
  /** This function inserts a todo in the database.
  * @param {Todo} todo - The todo object to be inserted.
  * @returns {Promise<void>} A promise that resolves to void.
  */
  static insertTodo = async (todo: Todo): Promise<void> => {
    const query: string = 'INSERT INTO todos (id, todo, done) VALUES (?, ?, ?)'
    try {
      (await db).runAsync(query, [todo.id, todo.todo, todo.done])
    } catch (e) {
      console.error(Strings.ERRORS.INSERT, e)
    }
  }
    
  /** This function returns all of the todos from the database.
  * @returns {Promise<Todo[]>} A promise that resolves to an array of todos.
  */
  static getTodos = async (): Promise<Todo[]> => {
    const query = 'SELECT * FROM todos'
    try {
      const result: Todo[] = (await db).getAllAsync(query) as unknown as Todo[]
      return result
    } catch (e) {
      console.error(Strings.ERRORS.GET, e)
      return []
    }
  }

  /** This function deletes a todo from the database.
  * @param {string} id - The unique identifier of the todo to be deleted.
  * @returns {Promise<void>} A promise that resolves to void.
  */
  static deleteTodo = async (id: string): Promise<void> => {
    const query = 'DELETE FROM todos WHERE id = ?'
    try {
      (await db).runAsync(query, [id])
    } catch (e) {
      console.error(Strings.ERRORS.DELETE, e)
    }
  }
  
  /** This function updates a todo in the database.
   * @param {string} id - The unique identifier of the todo to be updated.
   * @param {Todo} todo - The updated todo object.
   * @returns {Promise<void>} A promise that resolves to void.
  */
  static updateTodo = async (todo: Todo): Promise<void> => {
    const query = 'UPDATE todos SET todo = ?, done = ? WHERE id = ?'
    try {
      (await db).runAsync(query, [todo.todo, todo.done, todo.id])
    } catch (e) {
      console.error(Strings.ERRORS.UPDATE, e)
    }
  }
  
}