import React, { createContext, useState, useEffect } from 'react';
import Todo from '@/models/Todo';
import BottomSheet from '@/components/todos/BottomSheet';
import { BottomSheetContextProps, BottomSheetProviderProps } from '@/types';

export const BottomSheetContext = createContext<BottomSheetContextProps>({
  openBottomSheet: () => {},
  todos: [],
  setTodos: () => {},
  screenIsLoading: false
});

export const BottomSheetProvider: React.FC<BottomSheetProviderProps> = ({children}) => {
  const [todos, setTodos] = useState<Todo[]>([])
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)
  const [screenIsLoading, setScreenIsLoading] = useState<boolean>(true)

  // Fetch todos from the database on app load
  useEffect(() => {
    /** This function fetches todos from the database.*/
    const fetchTodos = async () => {
      const todos: Todo[] = await Todo.getTodos()
      setTodos(todos)
    }
    fetchTodos()
    setScreenIsLoading(false)
  }, [])

  /** This function opens the BottomSheet to add or update a todo.
  * @param {Todo} todo - The todo to be updated.
  * @returns {void} The function does not return anything.
  */
  const openBottomSheet = (todo: Todo | null = null): void => {
    setSelectedTodo(todo)
    setBottomSheetVisible(true)
  }

  return (
    <BottomSheetContext.Provider value={{ openBottomSheet, todos, setTodos, screenIsLoading }}>
      { children }
      { bottomSheetVisible && (
        <BottomSheet
          setVisible={() => setBottomSheetVisible(!bottomSheetVisible)}
          todos={todos}
          setTodos={setTodos}
          selectedTodo={selectedTodo}
        />
      )}
    </BottomSheetContext.Provider>
  )
}