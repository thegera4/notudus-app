import { useState, useEffect } from 'react'
import { View, TextInput, FlatList, StyleSheet, Modal, TouchableOpacity, Text, KeyboardAvoidingView } from 'react-native'
import ListNoteItem from '@/components/ListNoteItem'
import { Note, SearchOverlayProps } from '@/types'
import { Colors } from '@/constants/Colors'

/**
  * This is the Search Overlay component, which is opened by tapping the search icon in the TopBar.
  * It allows the user to search for notes by title or content, and displays the results in a list.
*/
export default function SearchOverlay({ visible, notes, onClose, searchTerm, setSearchTerm, handleNotePressed }: SearchOverlayProps) {
  
  //TODO: fix bug when using the search icon and going back to the notes screen
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])

  // Filter notes based on the search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = notes.filter(note =>note.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredNotes(filtered)
    } else {
      setFilteredNotes([])
    }
  }, [searchTerm, notes])

  return (
    <Modal visible={visible} transparent={true} animationType="none">
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <View style={styles.container}>
          <View style={styles.searchBar}>
            <TextInput
              style={styles.input}
              placeholder="Search notes..."
              placeholderTextColor={Colors.inputs.textPlaceholder}
              value={searchTerm}
              onChangeText={setSearchTerm}
              selectionColor={Colors.inputs.selection}
              autoFocus={true}
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            style={styles.list}
            data={filteredNotes}
            renderItem={({ item }) => <ListNoteItem note={item} onPress={handleNotePressed}/>}
            keyExtractor={item => item.id}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    width: '95%',
    backgroundColor: '#303030',
    borderRadius: 10,
    padding: 20,
    maxHeight: '95%',
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  input: {
    flex: 2,
    height: 40,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: 'white',
  },
  list: {
    flexGrow: 0, // Prevent the list from growing indefinitely
  },
  closeButton: {
    alignItems: 'center',
    marginLeft: 8,
    marginTop: 10,
  },
  closeButtonText: {
    color: 'green',
  },
});