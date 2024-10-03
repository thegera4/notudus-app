import { useState, useEffect, useCallback } from 'react'
import TopBar from '@/components/shared/TopBar'
import BottomSheet from '@/components/todos/BottomSheet'
import { ScreenEnum } from '@/constants/Enums'
import { Strings } from '@/constants/Strings'
import { StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Todo from '@/models/Todo'
import TodoItem from '@/components/todos/TodoItem'
import NoDataAnimation from '@/components/shared/NoDataAnimation'

export default function TodoScreen() {

  const [todos, setTodos] = useState<Todo[]>([])
  const [bottomSheetVisible, setBottomSheetVisible] = useState<boolean>(false)
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null)

  /** This function fetches todos from the database.*/
  const fetchTodos = async () => {
    const todos: Todo[] = await Todo.getTodos()
    setTodos(todos)
  }

  // Fetch todos from database on first render
  useEffect(() => { fetchTodos() }, [])

  /** This function deletes a todo from the database.
   * @param {string} id - The unique identifier of the todo to be deleted.
  */
  const deleteTodo = async (id: string) => {
    await Todo.deleteTodo(id)
    const updatedTodos = todos.filter((todo => todo.id !== id))
    setTodos(updatedTodos)
  }

  /** This function provides the layout for each item. */
  const getItemLayout = useCallback((data: any, index: number) => (
    { length: 50, offset: 50 * index, index }
  ), [])
  
  /** This function opens the bottom sheet to add/update a todo.*/
  const openBottomSheet = (todo: Todo | null = null) => {
    setSelectedTodo(todo)
    setBottomSheetVisible(true)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar screen={ScreenEnum.Todos} auth={false} view={Strings.TOPBAR.TODOS} numberOfTasks={todos.length}/>
      { todos.length === 0 || todos === undefined ? <NoDataAnimation screen={ScreenEnum.Todos}/> :
        <FlatList 
          data={todos} 
          keyExtractor={item => item.id} 
          renderItem={({ item }: { item: Todo }) => <TodoItem todo={item} onDelete={deleteTodo} />} 
          initialNumToRender={10}
          windowSize={10}
          getItemLayout={getItemLayout}
        />
      }
      { bottomSheetVisible && 
        <BottomSheet 
          setVisible={() => setBottomSheetVisible(!bottomSheetVisible)} 
          todos={todos} 
          setTodos={setTodos}
          selectedTodo={selectedTodo}
        /> 
      }
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  screenTitle: { 
    color: 'white',
    fontSize: 18,
    flex: 1,
    marginTop: 10,
    marginLeft: 16,
  },
})