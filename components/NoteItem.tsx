import { View, Text, StyleSheet, Pressable } from 'react-native'
import { limitContent } from '@/utils/utils'
import { NoteItemProps } from '@/types';
import { Ionicons } from '@expo/vector-icons';

//TODO: fix the styles for the list view note item with the new lock icon
//TODO: create a new component for the grid view note item

/**
 * Card that shows the title, description and last modified date of a note in the Notes Screen.
 */
export default function NoteItem({note, view}: NoteItemProps) {
  return (
    <Pressable style={({pressed}) => pressed && styles.pressed} onPress={() => console.log(`noteitem: ${note.id}`)}>
        <View style={view === 'grid' ? styles.cardGrid : styles.card}>
            <View style={styles.tagContainer}>
                {note.locked === 1 && <Ionicons style={styles.locked} name="lock-open" size={24} color="white" />}
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteDescription}>{view === 'list' ? limitContent(note.content, 40) : limitContent(note.content, 10)}</Text>
                <Text style={styles.noteDate}>{view === 'list' && 'Last modified:'}{note.date}</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cardGrid: {
        backgroundColor: '#212121',
        padding: 10,
        margin: 5,

        borderRadius: 10,
        flex: 1,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: 120,
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
    locked: {
        color: 'green',
        borderColor: 'green',
        fontSize: 10
    },
});