import { FABProps } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, TouchableOpacity, View } from 'react-native'

/**
 * The FAB (Floating Action Button) is a button that floats above the content to promote a primary action.
 * It is used to add a new note in the Notes screen or a new task in the Todos screen.
*/
export default function FAB({ onPress }: FABProps ) {
  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <View><Ionicons name="add" size={24} color="white"/></View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    marginLeft: -28,
    backgroundColor: 'green',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});