import { View, Text, StyleSheet, Pressable } from 'react-native'
import { limitContent } from '@/utils/utils'
import { NoteItemProps } from '@/types';

/**
 * Card that shows the title, description and last modified date of a note in the Notes Screen.
 */
export default function NoteItem({note}: NoteItemProps) {
  return (
    <Pressable style={({pressed}) => pressed && styles.pressed} onPress={() => console.log(`noteitem: ${note.id}`)}>
        <View style={styles.card}>
            <Text style={styles.noteTitle}>{note.title}</Text>
            <Text style={styles.noteDescription}>{limitContent(note.content, 40)}</Text>
            <Text style={styles.noteDate}>Last modified: {note.date}</Text>
        </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.5
    },
    card: {
        backgroundColor: 'gray',
        padding: 10,
        margin: 10,
        borderRadius: 10,
        width: '90%',
        alignSelf: 'center'
    },
    noteTitle: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    },
    noteDescription: {
        color: 'white',
        opacity: 0.9
    },
    noteDate: {
        color: 'white',
        opacity: 0.5
    }
});