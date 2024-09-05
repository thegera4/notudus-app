import { NoteItemProps } from '@/types'
import { limitContent } from '@/utils/utils'
import { View, Text, StyleSheet, Pressable } from 'react-native'

export default function GridNoteItem ({note, onPress}: NoteItemProps) {
  return (
    <View style={styles.gridItem}>
        <Pressable 
            style={({pressed}) => pressed ? [styles.pressed, styles.button] : styles.button} 
            onPress={onPress}
        >
            <View style={styles.innerConatiner}>
                {note.locked === 1 && <Text style={styles.locked}>Private</Text>}
                <Text style={styles.title}>{note.title}</Text>
                <Text style={styles.content}>{limitContent(note.content, 30)}</Text>
                <Text style={styles.date}>{note.date}</Text>
            </View>
        </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
    pressed: {
        opacity: 0.5
    },
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
    button: {
        flex: 1,
    },
    innerConatiner: {
        flex: 1,
        padding: 16,
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    title: {
        color: 'white',
        fontSize: 20,
        fontWeight: 'bold'
    },
    content: {
        color: 'white',
        opacity: 0.9
    },
    date: {
        color: 'white',
        opacity: 0.5
    },
    locked: {
        color: 'green',
        borderColor: 'green',
        fontWeight: 'bold',
    },
})