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
  AppState,
  AppStateStatus,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import * as LocalAuthentication from 'expo-local-authentication'
import { v4 as uuidv4 } from 'uuid'
import TopBar from '@/components/shared/TopBar'
import ChatBubble from '@/components/assistant/ChatBubble'
import { ScreenEnum } from '@/constants/Enums'
import { Strings } from '@/constants/Strings'
import { Colors } from '@/constants/Colors'
import { AIConstants } from '@/constants/AI'
import { ChatMessage, NoteModelType } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import Note from '@/models/Note'
import { getActiveCloudModelParams } from '@/services/modelManagerService'
import {
  queryLocalModel,
  selectRelevantNotes,
} from '@/services/localLlamaService'
import {
  getDailyUsage,
  incrementDailyUsage,
  resetDailyUsage,
  DailyUsageState,
} from '@/services/usageLimitService'

const buildWelcomeContent = (usage?: DailyUsageState): string => {
  const limit = usage?.limit ?? AIConstants.MAX_DAILY_MESSAGES
  const remaining = usage?.remaining ?? limit
  return `Hi! 👋 I am your AI assistant. Ask me about your notes (e.g., "how much does my mom owe me?" or "what is my Outlook username and password?"). Tambien hablo español.\n\n📌 Note: You have a limit of **${limit} daily messages** (${remaining} remaining today).`
}

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: buildWelcomeContent(),
  timestamp: new Date().toISOString(),
}

export default function AssistantScreen() {
  const [dailyUsage, setDailyUsage] = useState<DailyUsageState>({
    date: '',
    count: 0,
    limit: AIConstants.MAX_DAILY_MESSAGES,
    remaining: AIConstants.MAX_DAILY_MESSAGES,
    isLimitReached: false,
  })
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
  const [inputText, setInputText] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState<boolean>(false)

  const { auth, setAuth } = useAuth()
  const flatListRef = useRef<FlatList<ChatMessage>>(null)

  const initAssistant = async () => {
    try {
      const params = await getActiveCloudModelParams()
      const usage = await getDailyUsage(params.dailyLimit)
      setDailyUsage(usage)
      setMessages([
        {
          ...INITIAL_MESSAGE,
          content: buildWelcomeContent(usage),
        },
      ])
    } catch (e) {
      console.warn('Error initializing assistant state:', e)
    }
  }

  useEffect(() => {
    initAssistant()
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener(
      'change',
      (nextAppState: AppStateStatus) => {
        if (nextAppState === 'background') {
          setAuth(false)
        }
      }
    )
    return () => subscription.remove()
  }, [setAuth])

  const handleAuth = useCallback(async (): Promise<void> => {
    if (auth) {
      setAuth(false)
      return
    }
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: Strings.ASSISTANT.UNLOCK_PROMPT,
      })
      if (result.success) {
        setAuth(true)
      } else {
        Alert.alert(Strings.MODALS.NO_AUTH_METHOD, Strings.MODALS.NO_AUTH_MESSAGE, [{ text: 'OK' }])
      }
    } catch (e) {
      console.error(Strings.ERRORS.AUTH_ERROR, e)
    }
  }, [auth, setAuth])

  const handleClearChat = useCallback(() => {
    Alert.alert(
      Strings.ASSISTANT.CLEAR_CHAT,
      'Do you want to reset the conversation?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            const usageToUse = await resetDailyUsage(dailyUsage.limit)
            setDailyUsage(usageToUse)
            setMessages([
              {
                ...INITIAL_MESSAGE,
                content: buildWelcomeContent(usageToUse),
                timestamp: new Date().toISOString(),
              },
            ])
          },
        },
      ]
    )
  }, [dailyUsage])

  const handleSend = async () => {
    const question = inputText.trim()
    if (!question || isGenerating) return

    // 1. Verify daily message limit (max 10 messages per day stored in AsyncStorage)
    const currentUsage = await getDailyUsage(dailyUsage.limit)

    if (currentUsage.isLimitReached) {
      setDailyUsage(currentUsage)
      setMessages((prev) => [
        ...prev,
        {
          id: uuidv4(),
          role: 'assistant',
          content: Strings.ASSISTANT.DAILY_LIMIT_REACHED,
          timestamp: new Date().toISOString(),
        },
      ])
      return
    }

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
      // 2. Check if there are locked/private notes and prompt biometric auth if not unlocked
      let effectiveAuth = auth
      let userNotes: NoteModelType[] = []

      if (!effectiveAuth) {
        const allNotes = await Note.getNotes(true)
        const hasPrivateNotes = allNotes.some((n) => n.locked === 1)

        if (hasPrivateNotes) {
          try {
            const authResult = await LocalAuthentication.authenticateAsync({
              promptMessage: Strings.ASSISTANT.UNLOCK_PROMPT,
            })
            if (authResult.success) {
              effectiveAuth = true
              setAuth(true)
              userNotes = allNotes
            }
          } catch (e) {
            console.warn('Biometric prompt skipped or failed:', e)
          }
        }

        if (!effectiveAuth) {
          userNotes = await Note.getNotes(false)
        }
      } else {
        userNotes = await Note.getNotes(true)
      }

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

      const relevantNotes = selectRelevantNotes(userNotes, question)

      const sourceRefs = relevantNotes.slice(0, 4).map((n) => ({
        id: n.id,
        title: n.title || 'Sin título',
        locked: n.locked,
      }))

      // 3. Query AI model via Vercel AI SDK
      let streamedResponse = ''

      const finalResponse = await queryLocalModel(
        question,
        userNotes,
        (token) => {
          streamedResponse += token
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMsgId
                ? { ...msg, content: streamedResponse, sourceNotes: sourceRefs }
                : msg
            )
          )
        }
      )

      if (!streamedResponse) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMsgId
              ? {
                  ...msg,
                  content:
                    finalResponse ||
                    'No se recibió respuesta del modelo. Intenta preguntar de nuevo.',
                  sourceNotes: sourceRefs,
                }
              : msg
          )
        )
      }

      // 4. Increment daily counter in AsyncStorage upon successful response
      const updatedUsage = await incrementDailyUsage(dailyUsage.limit)
      setDailyUsage(updatedUsage)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === 'welcome' ? { ...m, content: buildWelcomeContent(updatedUsage) } : m
        )
      )
    } catch (error: any) {
      console.error('Error during AI inference:', error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMsgId
            ? {
                ...msg,
                content:
                  '❌ Ocurrió un error al consultar el asistente de IA. Verifica tu conexión a internet o la configuración de tu API Key.',
              }
            : msg
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoiding}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <TopBar
          screen={ScreenEnum.Assistant}
          auth={auth}
          onLockPress={handleAuth}
          view="assistant"
          onClearChat={handleClearChat}
        />

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={styles.chatContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {isGenerating && (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator size="small" color="#66bb6a" />
            <Text style={styles.thinkingText}>{Strings.ASSISTANT.THINKING}</Text>
          </View>
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            placeholder={
              dailyUsage.isLimitReached
                ? Strings.ASSISTANT.LIMIT_REACHED_PLACEHOLDER
                : Strings.ASSISTANT.INPUT_PLACEHOLDER
            }
            placeholderTextColor={Colors.inputs.textPlaceholder}
            selectionColor={Colors.inputs.selection}
            value={inputText}
            onChangeText={setInputText}
            onFocus={() =>
              setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 150)
            }
            multiline
            maxLength={600}
            editable={!isGenerating && !dailyUsage.isLimitReached}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isGenerating || dailyUsage.isLimitReached) &&
                styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!inputText.trim() || isGenerating || dailyUsage.isLimitReached}
            activeOpacity={0.7}
          >
            <Ionicons
              name="send"
              size={22}
              color={
                !inputText.trim() || isGenerating || dailyUsage.isLimitReached
                  ? '#757575'
                  : '#66bb6a'
              }
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
  keyboardAvoiding: {
    flex: 1,
  },
  modelSelectorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },
  usageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  usageBadgeText: {
    color: '#d0d0d0',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },
  usageBadgeTextLimit: {
    color: '#ef5350',
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
    backgroundColor: 'transparent',
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
    backgroundColor: 'transparent',
  },
  textInput: {
    flex: 1,
    color: '#ffffff',
    fontSize: 15,
    maxHeight: 100,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    borderRadius: 20,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
})
