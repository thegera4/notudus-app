import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { v4 as uuidv4 } from 'uuid'
import TopBar from '@/components/shared/TopBar'
import ChatBubble from '@/components/assistant/ChatBubble'
import VoiceButton from '@/components/assistant/VoiceButton'
import ModelDownloader from '@/components/assistant/ModelDownloader'
import { ScreenEnum } from '@/constants/Enums'
import { Strings } from '@/constants/Strings'
import { Colors } from '@/constants/Colors'
import { ChatMessage, ModelStatus } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Note from '@/models/Note'
import {
  isModelDownloaded,
  downloadModel,
} from '@/services/modelManagerService'
import {
  queryLocalModel,
} from '@/services/localLlamaService'

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: Strings.ASSISTANT.WELCOME,
  timestamp: new Date().toISOString(),
}

export default function AssistantScreen() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>('checking')
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [downloadError, setDownloadError] = useState<string>('')
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [inputText, setInputText] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const { auth } = useAuth()
  const flatListRef = useRef<FlatList<ChatMessage>>(null)

  // Verify model existence on screen load
  useEffect(() => {
    checkModel()
  }, [])

  const checkModel = async () => {
    setModelStatus('checking')
    const exists = await isModelDownloaded()
    setModelStatus(exists ? 'ready' : 'not_downloaded')
  }

  const handleStartDownload = async () => {
    try {
      setModelStatus('downloading')
      setDownloadProgress(0)
      setDownloadError('')

      await downloadModel((percent) => {
        setDownloadProgress(percent)
      })

      setModelStatus('ready')
    } catch (error: any) {
      console.error('Download error:', error)
      setDownloadError(error?.message || Strings.ASSISTANT.DOWNLOAD_ERROR)
      setModelStatus('error')
    }
  }

  const handleClearChat = useCallback(() => {
    Alert.alert(
      Strings.ASSISTANT.CLEAR_CHAT,
      '¿Deseas reiniciar la conversación?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Limpiar', style: 'destructive', onPress: () => setMessages([INITIAL_MESSAGE]) },
      ]
    )
  }, [])

  const handleVoiceTranscript = (transcript: string) => {
    setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript))
  }

  const handleSend = async () => {
    const question = inputText.trim()
    if (!question || isGenerating) return

    setInputText('')
    setIsGenerating(true)

    const userMessage: ChatMessage = {
      id: uuidv4(),
      role: 'user',
      content: question,
      timestamp: new Date().toISOString(),
    }

    const assistantMsgId = uuidv4()
    const placeholderAssistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '...',
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage, placeholderAssistantMessage])

    try {
      // 1. Fetch user notes from local SQLite (honors biometric lock)
      const userNotes = await Note.getNotes(auth)

      if (userNotes.length === 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: Strings.ASSISTANT.NO_NOTES }
              : msg
          )
        )
        setIsGenerating(false)
        return
      }

      // 2. Query local on-device Llama model with streaming tokens
      let streamedResponse = ''

      await queryLocalModel(question, userNotes, (token) => {
        streamedResponse += token
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? { ...msg, content: streamedResponse }
              : msg
          )
        )
      })
    } catch (error: any) {
      console.error('Error during local inference:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  '❌ Ocurrió un error al procesar tu pregunta con el modelo local. Intenta de nuevo.',
              }
            : msg
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  if (modelStatus === 'checking') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar screen={ScreenEnum.Assistant} auth={false} view="assistant" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#66bb6a" />
          <Text style={styles.loadingText}>Verificando asistente local...</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (modelStatus !== 'ready') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <TopBar screen={ScreenEnum.Assistant} auth={false} view="assistant" />
        <ModelDownloader
          progress={downloadProgress}
          status={modelStatus}
          onStartDownload={handleStartDownload}
          errorMessage={downloadError}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopBar
        screen={ScreenEnum.Assistant}
        auth={false}
        view="assistant"
        onClearChat={handleClearChat}
      />

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={styles.chatContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {isGenerating && (
        <View style={styles.thinkingContainer}>
          <ActivityIndicator size="small" color="#66bb6a" />
          <Text style={styles.thinkingText}>{Strings.ASSISTANT.THINKING}</Text>
        </View>
      )}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.inputBar}>
          <VoiceButton
            onTranscript={handleVoiceTranscript}
            disabled={isGenerating}
          />

          <TextInput
            style={styles.textInput}
            placeholder={Strings.ASSISTANT.INPUT_PLACEHOLDER}
            placeholderTextColor={Colors.inputs.textPlaceholder}
            selectionColor={Colors.inputs.selection}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={600}
            editable={!isGenerating}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isGenerating) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isGenerating}
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#b0b0b0',
    marginTop: 12,
    fontSize: 14,
  },
  chatContent: {
    paddingVertical: 12,
    paddingBottom: 24,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a1a',
  },
  thinkingText: {
    color: '#66bb6a',
    fontSize: 13,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#1f1f1f',
    borderTopWidth: 1,
    borderTopColor: '#2b2b2b',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#383838',
    opacity: 0.5,
  },
})
