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
            <View style={styles.textContainer}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteDescription}>{limitContent(note.content, 40)}</Text>
                <Text style={styles.noteDate}>Last modified: {note.date}</Text>
            </View>
            <View style={styles.tagContainer}>
                {note.locked === 1 && <Text style={styles.privateTag}>Private</Text>}
            </View>
        </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.5
    },
    card: {
        backgroundColor: '#212121',
        padding: 10,
        margin: 10,
        borderRadius: 10,
        width: '90%',
        alignSelf: 'center',
        flexDirection: 'row', // Add this line
        justifyContent: 'space-between', // Add this line
        alignItems: 'center' // Add this line
    },
    textContainer: {
        flex: 1,
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
    },
    tagContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
    },
    privateTag: {
        color: 'green',
        fontWeight: 'bold',
        borderColor: 'green',
        borderWidth: 1,
        padding: 5,
        borderRadius: 6,
        fontSize: 10
    },
});