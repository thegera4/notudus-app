import React from 'react'
import { TodoItemProps } from '@/types'
import { Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useBottomSheet } from '@/hooks/useBottomSheet'

//TODO: check if animation can be added to the swipeable component to make the item to slide to the left when deleted.
//TODO: implement the logic to mark a todo as done when the item is pressed as well as to strikethrough the text.

/** This component is used to display a todo item in the Todos screen.*/
function TodoItem ({ todo, onDelete }: TodoItemProps) {

  const { openBottomSheet } = useBottomSheet()

  /** This function renders the right action for the swipeable component (DELETE).*/
  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteIconButton} onPress={() => onDelete(todo.id)}>
      <Ionicons name="trash" size={24} color="red" />
    </TouchableOpacity>
  )

  /** This function renders the left action for the swipeable component (UPDATE).*/
  const renderLeftActions = () => (
    <TouchableOpacity style={styles.editconButton} onPress={() => openBottomSheet(todo)}>
      <Ionicons name="pencil" size={24} color="green" />
    </TouchableOpacity>
  )

  return (
    <Swipeable renderRightActions={renderRightActions} renderLeftActions={renderLeftActions}>
      <TouchableOpacity style={styles.container} onPress={() => console.log("aqui hay que tachar la letra y markar el todo como done")}>
        <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">
          {todo.todo}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  )
}

const styles = StyleSheet.create({
  text: { color: 'white', fontSize: 16 },
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