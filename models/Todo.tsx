/** This class represents a Todo object. 
 * @param {string} id - The unique identifier of the todo.
 * @param {string} todo - The content of the todo.
 * @param {number} done - The status of the todo (0 for not done, 1 for done).
 * @method insertTodo - Inserts a new todo into the database.
 * @method getTodos - Retrieves all the todos from the database.
 * @method updateTodo - Updates a todo in the database.
 * @method deleteTodo - Deletes a todo from the database.
*/
export default class Todo {
    id: string
    todo: string
    done: number
  
    constructor(id: string, todo: string, done: number) {
      this.id = id
      this.todo = todo
      this.done = done
    }
  
    /*
    static insertTodo = async (todo: Todo): Promise<void> => {
      try {
       
      } catch (e) {
        console.error('Error inserting note: ', e)
      }
    }
  
    static getTodos = async (): Promise<Todo[]> => {
      try {
        
      } catch (e) {
       
      }
    }
  
    static updateTodo = async (id: string, todo: Todo): Promise<void> => {
      try {
        
      } catch (e) {
        console.error('Error updating note: ', e)
      }
    }
  
    static deleteTodo = async (id: string): Promise<void> => {
      try {
       
      } catch (e) {
        console.error('Error deleting note: ', e)
      }
    }
  
    static deleteAllNotes = async (): Promise<void> => {
      try {
       
      } catch (e) {
        console.error('Error deleting all notes: ', e)
      }
    }
    */
}