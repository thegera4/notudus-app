import React, { useState, useEffect } from 'react';
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopBar from '@/components/TopBar';
import { ScreenEnum } from '@/constants/Enums';
import { Colors } from '@/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';
import Note from '@/models/Note';
import { notes } from '@/fakenotes';
import { updateNote } from '@/utils/db';
import PrivateText from '@/components/PrivateText';
import { useAuth } from '@/contexts/authContext';
import { Strings } from '@/constants/Strings';

/**
  * This is the Add Note screen where you can define and add a new note, as well as update an existing note.
  * The lock icon allows you to make a note private and the back icon saves the changes.
*/
export default function AddNoteScreen() {

  //TODO: Add code for no notes case (icon with animation).

  const localParams = useLocalSearchParams()

  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [locked, setLocked] = useState<number>(0)
  const [currentNote, setCurrentNote] = useState<Note>()
  const [newNoteLocked, setNewNoteLocked] = useState<boolean>(false)

  const { auth } = useAuth()

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

  /**This function handles the shield icon press event (opens a modal to ask for user confirmation to make the note private).*/
  const onShieldPress = () => {
    if(newNoteLocked){
      const message = 'Do you want to remove the private status of this note?'
      //TODO: maybe change the alert to a custom modal
      Alert.alert(
        Strings.MODALS.REMOVE_PRIVATE_STATUS, 
        Strings.MODALS.REMOVE_MESSAGE,  
        [{text: 'NO', style: 'cancel'}, {text: 'YES', onPress: () => setNewNoteLocked(false)}]
      )
    } else {
      //TODO: maybe change the alert to a custom modal
      Alert.alert(
        Strings.MODALS.MAKE_NOTE_PRIVATE, 
        Strings.MODALS.MAKE_MESSAGE, 
        [{text: 'NO', style: 'cancel'}, {text: 'YES', onPress: () => setNewNoteLocked(true)}]
      )
    }
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
        onShieldPress={onShieldPress}
        newNoteLocked={newNoteLocked}
      />
      <ScrollView style={styles.container}>
        { auth && currentNote && locked === 1 && <PrivateText/> }
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