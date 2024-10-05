import React, { useRef, useState, useMemo, useEffect } from 'react'
import { TodoItemProps } from '@/types'
import { Text, StyleSheet, TouchableOpacity, Animated } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useBottomSheet } from '@/hooks/useBottomSheet'
import { Strings } from '@/constants/Strings'
import Todo from '@/models/Todo'

/** This component is used to display a todo item in the Todos screen.*/
function TodoItem ({ todo, onDelete, onUpdate }: TodoItemProps) {

  const { openBottomSheet } = useBottomSheet()

  const slideAnim = useRef(new Animated.Value(0)).current

  const [currentTodo, setCurrentTodo] = useState<Todo>(todo)

  useEffect(() => {
    setCurrentTodo(todo)
  }, [todo])

  const styles = useMemo(() => getStyles(slideAnim, currentTodo),  [slideAnim, currentTodo])

  /** This function handles the delete action with animation.*/
  const handleDelete = (): void => {
    Animated.timing(slideAnim, {toValue: -500, duration: 300, useNativeDriver: true}).start(() => onDelete(todo.id))
  }

  /** This function renders the right action for the swipeable component (DELETE).*/
  const renderRightActions = (): React.JSX.Element => (
    <TouchableOpacity style={styles.deleteIconButton} onPress={handleDelete}>
      <Ionicons name="trash" size={24} color="red" />
    </TouchableOpacity>
  )

  /** This function renders the left action for the swipeable component (UPDATE).*/
  const renderLeftActions = (): React.JSX.Element => (
    <TouchableOpacity style={styles.editconButton} onPress={() => openBottomSheet(todo)}>
      <Ionicons name="pencil" size={24} color="green" />
    </TouchableOpacity>
  )

  /** This function handles the tap action on the item (updates the done status in the database).*/
  const handleItemTap = async (): Promise<void> => {
    try{
      const updatedTodo = {...todo, done: todo.done === 0 ? 1 : 0}
      await onUpdate(updatedTodo)
      setCurrentTodo(updatedTodo)
    } catch (error) {
      console.error(Strings.ERRORS.UPDATE, error)
    }
  }

  return (
    <Swipeable renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}>
      <Animated.View style={[styles.container, styles.slideAnimation]}>
        <TouchableOpacity style={styles.touchable} onPress={handleItemTap}>
          <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">{currentTodo.todo}</Text>
        </TouchableOpacity>
      </Animated.View> 
    </Swipeable>
  )
}

const getStyles = (slideAnim: Animated.Value, currentTodo: Todo) => StyleSheet.create({
  touchable: { flex: 1 },
  slideAnimation: { transform: [{ translateX: slideAnim }] },
  text: { 
    color: currentTodo.done === 1 ? 'gray' : 'white',
    fontSize: 16,
    textDecorationLine: currentTodo.done === 1 ? 'line-through' : 'none',
  },
  deleteIconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    marginRight: 16,
  },
  editconButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    marginLeft: 16,
  },
  container: {
    backgroundColor: '#303030',
    padding: 14,
    margin: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    alignSelf: 'center',
  },
})

export default React.memo(TodoItem)