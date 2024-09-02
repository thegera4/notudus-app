import { View, Text, StyleSheet, Pressable } from 'react-native'

export default function NoteItem() {
  return (
    <Pressable style={({pressed}) => pressed && styles.pressed} onPress={() => console.log('noteitem')}>
        <View style={styles.card}>
            <Text style={styles.noteTitle}>Titulo 1</Text>
            <Text style={styles.noteDescription}>Descripcion 1 no privada</Text>
            <Text style={styles.noteDate}>Last modified: 11/22/33</Text>
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
    },
    noteDescription: {
        color: 'white',
    },
    noteDate: {
        color: 'white',
        opacity: 0.5
    }
});