import { useState, useEffect } from 'react'
import { View, TextInput, FlatList, StyleSheet, Modal, TouchableOpacity, Text, KeyboardAvoidingView } from 'react-native'
import ListNoteItem from '@/components/ListNoteItem'
import { Note, SearchOverlayProps } from '@/types'

export default function SearchOverlay({ visible, notes, onClose, searchTerm, setSearchTerm }: SearchOverlayProps) {
  
    const [filteredNotes, setFilteredNotes] = useState<Note[]>([])

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
    <Modal visible={visible} transparent={true} animationType="fade">
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <View style={styles.container}>
          <TextInput
            style={styles.input}
            placeholder="Search notes..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchTerm}
            onChangeText={setSearchTerm}
            selectionColor={'green'}
          />
          <FlatList
            style={styles.list}
            data={filteredNotes}
            renderItem={({ item }) => <ListNoteItem note={item} onPress={() => {}} />}
            keyExtractor={item => item.id.toString()}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    width: '90%',
    backgroundColor: '#303030',
    borderRadius: 10,
    padding: 20,
    maxHeight: '90%',
  },
  input: {
    height: 40,
    borderColor: 'gray',
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
    marginTop: 20,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'green',
  },
});