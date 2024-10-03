import React, { useRef, useEffect, useState } from 'react'
import { Colors } from '@/constants/Colors'
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Animated, Pressable, 
  KeyboardAvoidingView, Platform, Dimensions } from 'react-native'
import { BottomSheetProps } from '@/types'
import Todo from '@/models/Todo'
import { v4 as uuidv4 } from 'uuid'
import { Strings } from '@/constants/Strings'

/** This component is a BottomSheet used to add todos.*/
export default function BottomSheet({ setVisible, setTodos, todos, selectedTodo }: BottomSheetProps) {

  const [content, setContent] = useState<string>(selectedTodo ? selectedTodo.todo : '')
  const [bottomSheetHeight] = useState(Dimensions.get('window').height * 0.5)

  const slideUpRef = useRef<Animated.Value>(new Animated.Value(300)).current

  const styles = getStyles(slideUpRef, bottomSheetHeight, content)

  /** This function is the animation definition to slide the BottomSheet up.*/
  const slideUp = (): void => {
    Animated.timing(slideUpRef, { toValue: 0, duration: 200, useNativeDriver: true }).start()
  }

  /** This function is the animation definition to slide the BottomSheet down.*/
  const slideDown = (): void => {
    Animated.timing(slideUpRef, { toValue: 300, duration: 200, useNativeDriver: true }).start()
  }

  // Trigger the slideUp animation when the component mounts.
  useEffect(() => { slideUp() }, [])

  // Set the content of the todo to be updated.
  useEffect(() => { selectedTodo && setContent(selectedTodo.todo) }, [selectedTodo])

  /** This function closes the BottomSheet by triggering the slideDown animation.*/
  const closeBottomSheet = (): void => { slideDown(); setTimeout(() => setVisible(), 200) }

  /** This function saves a todo in the database.*/
  const saveTodo = async (): Promise<void> => {
    if (!content.trim()) return
    try{
      if(selectedTodo){
        const updatedTodo: Todo = { ...selectedTodo, todo: content }
        await Todo.updateTodo(updatedTodo)
        const updatedTodos = todos.map(todo => todo.id === selectedTodo.id ? updatedTodo : todo)
        setTodos(updatedTodos)
      } else {
        const newTodo: Todo = {
          id: uuidv4(),
          todo: content,
          done: 0,
        }
        await Todo.insertTodo(newTodo)
        setTodos([...todos, newTodo])
      }
    } catch (e) {
      console.error(Strings.ERRORS.INSERT, e)
    } finally {
      setContent('')
      closeBottomSheet()
    }
  }

  return (
    <Pressable style={styles.backdrop} onPress={closeBottomSheet}>
      <Pressable style={styles.voidPressable}>
        <Animated.View style={[styles.container, styles.animation]}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboard}>
            <View style={styles.controls}>
              <TouchableOpacity onPress={closeBottomSheet}>
                <Text style={[styles.title, styles.cancel]}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.title}>Add Todo</Text>
              <TouchableOpacity onPress={saveTodo} disabled={!content}>
                <Text style={[styles.title, styles.save]}>Save</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              multiline={true}
              style={styles.input}
              placeholderTextColor={Colors.inputs.textPlaceholder}
              selectionColor={Colors.inputs.selection}
              value={content}
              onChangeText={setContent}
              autoFocus={true}
            />
          </KeyboardAvoidingView>
        </Animated.View>
      </Pressable>
    </Pressable>
  )
}

const getStyles = (slideUpRef: Animated.Value, bottomSheetHeight: number, content: string) => StyleSheet.create({
  save:{ color: content.trim() ? 'green' : 'gray' },
  cancel: { color: 'red' },
  keyboard: { flex: 1 },
  animation: { transform: [ { translateY: slideUpRef } ] },
  voidPressable: { 
    width: '100%', 
    height: bottomSheetHeight < 300 ? 150 : 180 
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    alignContent: 'center',
    textAlign: 'center',
    paddingVertical: 16,
  },
  backdrop: {
    flex: 1,
    position: 'absolute',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    height: '100%',
    width: '100%',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#303030',
    height: '100%',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
    bottom: -25,
  },
  input: {
    width: '90%',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderBottomWidth: 1,
    marginBottom: 20,
    color: 'white',
    marginLeft: '5%',
    fontSize: 18,
  },
})