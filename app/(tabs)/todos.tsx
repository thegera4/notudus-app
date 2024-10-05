import { useCallback, useRef } from 'react'
import { StyleSheet, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TopBar from '@/components/shared/TopBar'
import TodoItem from '@/components/todos/TodoItem'
import NoDataAnimation from '@/components/shared/NoDataAnimation'
import { ScreenEnum } from '@/constants/Enums'
import { Strings } from '@/constants/Strings'
import Todo from '@/models/Todo'
import { useBottomSheet } from '@/hooks/useBottomSheet'
import CustomLoading from '@/components/shared/CustomLoading'

export default function TodoScreen() {

  const { todos, setTodos, screenIsLoading } = useBottomSheet()

  todos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const flatListRef = useRef<FlatList<Todo>>(null)

  /** This function deletes a todo from the database.
  * @param {string} id - The unique identifier of the todo to be deleted.
  * @returns {Promise<void>} A promise that resolves when the todo is deleted.
  */
  const deleteTodo = async (id: string): Promise<void> => {
    await Todo.deleteTodo(id)
    const updatedTodos = todos!.filter((todo => todo.id !== id))
    setTodos!(updatedTodos)
  }

  /** This function updates a todo in the database.
   * @param {Todo} updatedTodo - The updated todo object.
   * @returns {Promise<void>} A promise that resolves when the todo is updated.
  */
  const updateTodo = async (updatedTodo: Todo): Promise<void> => {
    await Todo.updateTodo(updatedTodo)
    const updatedTodos = todos!.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
    setTodos!(updatedTodos)
  };

  /** This function provides the layout for each item. 
  * @param {any} _data - The data for the item.
  * @param {number} index - The index of the item.
  * @returns {object} An object containing the length, offset, and index of the item.
  */
  const getItemLayout = useCallback((_data: any, index: number) => ({length: 50, offset: 50 * index, index}), [])

  // Scroll to the last item when a new todo is added.
  /*useEffect(() => {
    if (todos && todos.length > 0) {
      setTimeout(() => { flatListRef.current?.scrollToIndex({index: todos.length - 1, animated: true}) }, 100)
    }
  }, [todos])*/

  return (
    <SafeAreaView style={styles.safeArea}>
      { screenIsLoading ? <CustomLoading /> :
        <>
          <TopBar screen={ScreenEnum.Todos} auth={false} view={Strings.TOPBAR.TODOS} tasks={todos}/>
          <FlatList 
            ref={flatListRef}
            data={todos} 
            keyExtractor={item => item.id} 
            renderItem={({item}: {item: Todo}) => <TodoItem todo={item} onDelete={deleteTodo} onUpdate={updateTodo}/>} 
            initialNumToRender={10}
            windowSize={10}
            getItemLayout={getItemLayout}
            ListEmptyComponent={<NoDataAnimation screen={ScreenEnum.Todos}/>}
          />
        </>
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