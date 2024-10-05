import { NoteItemProps } from '@/types'
import { View, Text, StyleSheet, Pressable } from 'react-native'

/** Card that shows the title, description and last modified date of a note in the Notes Screen.*/
export default function GridNoteItem ({note, onPress}: NoteItemProps) {

  /** This function handles the press event of the card and calls the onPress function with the note as parameter.*/
  const handlePress = () => onPress(note)

  return (
    <View style={styles.gridItem}>
      <Pressable style={({pressed}) => pressed ? [styles.pressed, styles.button] : styles.button} onPress={handlePress}>
        <View style={styles.innerConatiner}>
          {note.locked === 1 && <Text style={styles.locked}>Private</Text>}
          <Text style={styles.title} numberOfLines={1}>{note.title}</Text>
          <Text style={styles.content} numberOfLines={2}>{note.content}</Text>
          <Text style={styles.date}>{note.date.split('T')[0]}</Text>
        </View>
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.5 },
  gridItem: {
    flex: 1,
    margin: 10,
    height: 130,
    borderRadius: 10,
    backgroundColor: '#212121',
    elevation: 5,
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  button: { flex: 1 },
  innerConatiner: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    width: '100%',
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold'
  },
  content: {
    width: '100%',
    color: 'white',
    opacity: 0.9,
    paddingVertical: 2
  },
  date: {
    width: '100%',
    color: 'white',
    opacity: 0.5
  },
  locked: {
    color: 'green',
    borderColor: 'green',
    fontWeight: 'bold',
  },
})