import { useRef, useEffect } from 'react'
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native'
import { NoteItemProps } from '@/types';
import PrivateText from './PrivateText';
import { animateListItem } from '@/utils/animations'

/** Card that shows the title, description and last modified date of a note in the Notes Screen.*/
export default function ListNoteItem({ note, onPress }: NoteItemProps) {

  const scaleAnim : Animated.Value = useRef(new Animated.Value(0)).current
  const slideAnim: Animated.Value = useRef(new Animated.Value(0)).current

  // Triggers the animation when the component mounts (item appears).
  useEffect(() => { animateListItem(scaleAnim) }, [])

  /** This function handles the press event of the card and calls the onPress function with the note as parameter.*/
  const handlePress = (): void => onPress(note);

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable style={({pressed}) => pressed && styles.pressed} onPress={handlePress}>
          <View style={styles.card}>
            <View style={styles.textContainer}>
              {note.locked === 1 && <PrivateText />}
              <Text style={styles.noteTitle} numberOfLines={1} ellipsizeMode="tail">{note.title}</Text>
              <Text style={styles.noteDescription} numberOfLines={2}>{note.content}</Text>
              <Text style={styles.noteDate}>Last modified: {note.date.split('T')[0]}</Text>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    </Animated.View>
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
})