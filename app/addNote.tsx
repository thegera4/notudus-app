import React, { useState, useEffect } from 'react'
import { TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import TopBar from '@/components/shared/TopBar'
import { ScreenEnum } from '@/constants/Enums'
import { Colors } from '@/constants/Colors'
import { router, useLocalSearchParams } from 'expo-router'
import NoteModelType from '@/models/Note'
import PrivateText from '@/components/notes/PrivateText'
import { useAuth } from "@/hooks/useAuth"
import { homeRoute } from "@/constants/Routes"
import * as LocalAuthentication from 'expo-local-authentication'
import { v4 as uuidv4 } from 'uuid'
import { Strings } from '@/constants/Strings'
import Note from '@/models/Note'

/**
  * This is the Add Note screen where you can define and add a new note, as well as update an existing note.
  * The lock icon allows you to make a note private and the back icon saves the changes.
*/
export default function AddNoteScreen() {
  
  const localParams: { note?: string } = useLocalSearchParams()

  const [title, setTitle] = useState<string>('')
  const [content, setContent] = useState<string>('')
  const [locked, setLocked] = useState<number>(0)
  const [currentNote, setCurrentNote] = useState<NoteModelType>()
  const [showPrivateText, setShowPrivateText] = useState<boolean>(false)

  const { auth } = useAuth()

  // Read the localParams and make it a valid object to work with (used to show the note if it exists).
  useEffect(() => { 
    if(localParams.note){
      const alreadySavedNote: Note = JSON.parse(localParams.note as string)
      setCurrentNote(alreadySavedNote)
      setTitle(alreadySavedNote.title)
      setContent(alreadySavedNote.content)
      setLocked(alreadySavedNote.locked)
    }
  }, [localParams.note])

  /**This function marks the note as "private" when the user taps the lock icon on the top bar.*/
  const lockNote = (): void => setLocked(prevLocked => (prevLocked === 0 ? 1 : 0))

  /**This function handles the back event to save the new notes, or the updated information of an existing note.*/
  const onBack = async (): Promise<void> => {
    if( (currentNote && title === currentNote.title && content === currentNote.content) || (title === '' && content === '') ){
      router.dismissAll()
    } else{
      const preparedNote: NoteModelType = {
        id: currentNote ? currentNote.id : uuidv4(),
        title,
        content,
        locked,
        date: new Date().toISOString(),
      }
      if(showPrivateText){
        preparedNote.locked = 1
        try{
          const result = await LocalAuthentication.authenticateAsync()
          if (result.success){
            currentNote ? Note.updateNote(currentNote.id, preparedNote) : Note.insertNote(preparedNote)
          } 
          else{
            Alert.alert(Strings.MODALS.NO_AUTH_METHOD, Strings.MODALS.NO_AUTH_MESSAGE, [{text: 'OK'}])
          }
        } catch (e) {
          console.error(Strings.ERRORS.ONBACK, e)
        }
      } else {
        currentNote ? Note.updateNote(currentNote.id, preparedNote) : Note.insertNote(preparedNote)
      }
      router.navigate(homeRoute)
    }
  }

  /**This function handles the shield icon press event (show the private text to save the note as private).*/
  const onShieldPress = (): void => showPrivateText ? setShowPrivateText(false) : setShowPrivateText(true)

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
        newNoteLocked={showPrivateText}
      />
      <ScrollView style={styles.container}>
        { ((auth && currentNote && locked === 1) || (showPrivateText)) && <PrivateText/> }
        <TextInput
          style={styles.titleInput}
          placeholder={Strings.ADDNOTE.NOTE_TITLE}
          placeholderTextColor={Colors.inputs.textPlaceholder}
          selectionColor={Colors.inputs.selection}
          value={title}
          onChangeText={setTitle}
          autoFocus={true}
        />
        <TextInput
          multiline
          style={styles.contentInput}
          placeholder={Strings.ADDNOTE.NOTE_CONTENT}
          placeholderTextColor={Colors.inputs.textPlaceholder}
          selectionColor={Colors.inputs.selection}
          value={content}
          onChangeText={setContent}
        />
      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
  )
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
})