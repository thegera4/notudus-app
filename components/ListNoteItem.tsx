import { View, Text, StyleSheet, Pressable } from 'react-native'
import { NoteItemProps } from '@/types';
import PrivateText from './PrivateText';

/** Card that shows the title, description and last modified date of a note in the Notes Screen.*/
export default function ListNoteItem({note, onPress}: NoteItemProps) {

  const handlePress = () => onPress(note);

  return (
    <Pressable style={({pressed}) => pressed && styles.pressed} onPress={handlePress}>
      <View style={styles.card}>
        <View style={styles.textContainer}>
          {note.locked === 1 && <PrivateText />}
          <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">{note.title}</Text>
          <Text style={styles.noteDescription} numberOfLines={2}>{note.content}</Text>
          <Text style={styles.noteDate}>Last modified: {note.date}</Text>
        </View>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.5 },
  textContainer: { flex: 1 },
  noteDate: { color: 'white', opacity: 0.5 },
  noteDescription: { color: 'white', opacity: 0.9, marginVertical: 4 },
  noteTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  card: {
    backgroundColor: '#212121',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: '95%',
    alignSelf: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    maxHeight: 120
  },
});