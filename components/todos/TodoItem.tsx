import React from 'react'
import { TodoItemProps } from '@/types'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { Swipeable } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'

//TODO: check if animation can be added to the swipeable component to make the item to slide to the left when deleted.

function TodoItem ({ todo, onDelete }: TodoItemProps) {

  /** This function renders the right action for the swipeable component (DELETE).*/
  const renderRightActions = () => (
    <TouchableOpacity style={styles.deleteIconButton} onPress={() => onDelete(todo.id)}>
      <Ionicons name="trash" size={24} color="red" />
    </TouchableOpacity>
  )

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <View style={styles.container}>
        <Text style={styles.text} numberOfLines={2} ellipsizeMode="tail">
          {todo.todo}
        </Text>
      </View>
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