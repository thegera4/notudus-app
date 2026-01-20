import { useState, useEffect, useRef } from 'react'
import { View, TextInput, FlatList, StyleSheet, Modal, TouchableOpacity, TouchableWithoutFeedback, Text, KeyboardAvoidingView, InteractionManager } from 'react-native'
import ListNoteItem from '@/components/notes/ListNoteItem'
import { NoteModelType, SearchOverlayProps } from '@/types'
import { Colors } from '@/constants/Colors'
import { Strings } from '@/constants/Strings'

/** This is the Search Overlay component, which is opened by tapping the search icon in the TopBar.
  * It allows the user to search for notes by title or content, and displays the results in a list.
*/
export default function SearchOverlay({ visible, notes, onClose, searchTerm, setSearchTerm, handleNotePressed }: SearchOverlayProps) {

  const [filteredNotes, setFilteredNotes] = useState<NoteModelType[]>([])
  const inputRef = useRef<TextInput>(null)

  // Filter notes based on the search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = notes.filter(note => note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase()))
      setFilteredNotes(filtered)
    } else {
      setFilteredNotes([])
    }
  }, [searchTerm, notes]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onShow={() => {
        InteractionManager.runAfterInteractions(() => {
          setTimeout(() => { inputRef.current?.focus() }, 600)
        })
      }}
    >
      <KeyboardAvoidingView style={styles.overlay} behavior="padding">
        <TouchableOpacity activeOpacity={1} onPress={onClose} style={styles.touchableOverlay}>
          <View style={styles.centeredContainer}>
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.container}>
                <View style={styles.searchBar}>
                  <TextInput
                    ref={inputRef}
                    style={styles.input}
                    placeholder={Strings.MODALS.SEARCH_NOTES}
                    placeholderTextColor={Colors.inputs.textPlaceholder}
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    selectionColor={Colors.inputs.selection}
                  />
                  <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>CLOSE</Text>
                  </TouchableOpacity>
                </View>
                <FlatList
                  style={styles.list}
                  data={filteredNotes}
                  renderItem={({ item }) => <ListNoteItem note={item} onPress={handleNotePressed} />}
                  keyExtractor={item => item.id}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  centeredContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
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
  touchableOverlay: {
    flex: 1,
    width: '100%',
  },
})