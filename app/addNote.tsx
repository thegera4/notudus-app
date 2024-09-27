import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '@/components/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { Colors } from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import Note from '@/models/Note';
import { notes } from '@/fakenotes';
import { updateNote } from '@/utils/db';

/**
  * This is the Add Note screen where you can define and add a new note, as well as update an existing note.
  * The lock icon allows you to make a note private and the back icon saves the changes.
*/
export default function AddNoteScreen() {

  const localParams = useLocalSearchParams()

  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [locked, setLocked] = useState<number>(0)
  const [currentNote, setCurrentNote] = useState<Note>()

  // Read the localParams and make it a valid object to work with (used to show the note if it exists).
  useEffect(() => { 
    if(localParams.note){
      const alreadySavedNote = JSON.parse(localParams.note as string)
      setCurrentNote(alreadySavedNote)
      setTitle(alreadySavedNote.title)
      setContent(alreadySavedNote.content)
      setLocked(alreadySavedNote.locked)
    }
  }, [localParams.note])

  /**This function marks the note as "private" when the user taps the lock icon on the top bar.*/
  const lockNote = () => setLocked(locked === 0 ? 1 : 0)

  /**This function handles the back event to save the new notes, or the updated information of an existing note.*/
  const onBack = () => { 
    if (title !== '' || content !== '') { 
      const preparedNote: Note = {
        id: currentNote ? currentNote.id : notes.length + 1,
        title,
        content,
        locked,
        date: new Date().toISOString().split('T')[0],
      }
      currentNote ? updateNote(currentNote.id, preparedNote) : notes.push(preparedNote)
    }
    router.navigate('/') 
  }

  return (
    <KeyboardAvoidingView style={styles.keyboardAvoiding} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <SafeAreaView style={styles.safeAreaView}>
      <TopBar 
        screen={ScreenEnum.AddNote} 
        onLockPress={lockNote} 
        auth={locked === 1} 
        view={ScreenEnum.AddNote} 
        onBackPress={onBack} 
        currentNote={currentNote} 
      />
      <ScrollView style={styles.container}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor={Colors.inputs.textPlaceholder}
          selectionColor={Colors.inputs.selection}
          value={title}
          onChangeText={setTitle}
          autoFocus={true}
        />
        <TextInput
          multiline
          style={styles.contentInput}
          placeholder="Note Content"
          placeholderTextColor={Colors.inputs.textPlaceholder}
          selectionColor={Colors.inputs.selection}
          value={content}
          onChangeText={setContent}
        />
      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoiding: { flex: 1 },
  safeAreaView: { flex: 1 },
  container: { padding: 16 },
  titleInput: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: 'white',
  },
  contentInput: {
    fontSize: 16,
    marginBottom: 16,
    color: 'white',
  },
});