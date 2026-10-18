import { initLlama, LlamaContext } from 'llama.rn'
import { AIConstants } from '@/constants/AI'
import { getModelPath, isModelDownloaded } from './modelManagerService'
import { NoteModelType } from '@/types'

let contextInstance: LlamaContext | null = null
let isInitializing = false

/**
 * Initializes and returns the active LlamaContext instance.
 */
export const getOrInitLlamaContext = async (): Promise<LlamaContext> => {
  if (contextInstance) {
    return contextInstance
  }

  if (isInitializing) {
    // Wait until initialization completes
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    if (contextInstance) return contextInstance
  }

  const modelExists = await isModelDownloaded()
  if (!modelExists) {
    throw new Error('El modelo de IA local no está descargado aún.')
  }

  try {
    isInitializing = true
    const modelPath = getModelPath()
    contextInstance = await initLlama({
      model: modelPath,
      n_ctx: AIConstants.CONTEXT_WINDOW,
      n_gpu_layers: AIConstants.GPU_LAYERS,
      use_mlock: true,
    })
    return contextInstance
  } finally {
    isInitializing = false
  }
}

/**
 * Releases the Llama model from RAM to free system resources.
 */
export const releaseLlamaContext = async (): Promise<void> => {
  if (contextInstance) {
    try {
      await contextInstance.release()
    } catch (e) {
      console.warn('Error releasing Llama context:', e)
    }
    contextInstance = null
  }
}

/**
 * Filters notes based on user query keywords to fit into the context window.
 */
export const selectRelevantNotes = (notes: NoteModelType[], query: string): NoteModelType[] => {
  if (notes.length === 0) return []

  // Clean and extract query words (ignore short stopwords)
  const stopWords = new Set(['el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'a', 'en', 'para', 'por', 'con', 'que', 'me', 'mi', 'mis', 'es', 'son', 'cuanto', 'cuánto', 'donde', 'dónde', 'cual', 'cuál', 'como', 'cómo', 'y', 'o'])
  const queryTerms = query
    .toLowerCase()
    .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !stopWords.has(w))

  // If query is broad or notes total size is small (< 8000 characters), return all notes
  const totalLength = notes.reduce((acc, n) => acc + (n.title?.length || 0) + (n.content?.length || 0), 0)
  if (totalLength < 8000 || queryTerms.length === 0) {
    return notes
  }

  // Score each note based on term matches
  const scoredNotes = notes.map((note) => {
    const text = `${note.title || ''} ${note.content || ''}`.toLowerCase()
    let score = 0

    for (const term of queryTerms) {
      if (text.includes(term)) {
        score += 3
      }
    }

    // Boost notes containing money patterns if the query seems financial
    const isFinancialQuery = query.toLowerCase().includes('debe') || query.toLowerCase().includes('preste') || query.toLowerCase().includes('presté') || query.toLowerCase().includes('dinero') || query.toLowerCase().includes('cuenta') || query.toLowerCase().includes('$')
    if (isFinancialQuery && (text.includes('$') || /\b\d+\b/.test(text))) {
      score += 2
    }

    // Boost notes containing credentials if the query asks for passwords/keys
    const isCredQuery = query.toLowerCase().includes('password') || query.toLowerCase().includes('contraseña') || query.toLowerCase().includes('usuario') || query.toLowerCase().includes('cuenta')
    if (isCredQuery && (text.includes('pass') || text.includes('user') || text.includes('@') || text.includes('correo') || text.includes('clave'))) {
      score += 2
    }

    return { note, score }
  })

  // Sort by score descending and take top notes
  scoredNotes.sort((a, b) => b.score - a.score)
  const topNotes = scoredNotes.filter((s) => s.score > 0).slice(0, 15).map((s) => s.note)

  return topNotes.length > 0 ? topNotes : notes.slice(0, 10)
}

/**
 * Formats notes into a text representation for the model prompt.
 */
const formatNotesForPrompt = (notes: NoteModelType[]): string => {
  if (notes.length === 0) {
    return 'El usuario no tiene notas registradas actualmente.'
  }

  return notes
    .map((note, index) => {
      const title = note.title?.trim() || '(Sin título)'
      return `[Nota ${index + 1}: "${title}"]\n${note.content || ''}`
    })
    .join('\n\n')
}

/**
 * Sends a question and relevant notes to the local Qwen model and streams back the response.
 */
export const queryLocalModel = async (
  question: string,
  notes: NoteModelType[],
  onToken?: (token: string) => void
): Promise<string> => {
  const context = await getOrInitLlamaContext()
  const relevantNotes = selectRelevantNotes(notes, question)
  const formattedNotes = formatNotesForPrompt(relevantNotes)

  const prompt = `${AIConstants.SYSTEM_PROMPT}
<|im_start|>user
A continuación se muestran mis notas personales:
---
${formattedNotes}
---

Mi pregunta: ${question}<|im_end|>
<|im_start|>assistant
`

  let fullResponse = ''

  const result = await context.completion(
    {
      prompt,
      n_predict: 512,
      temperature: 0.2, // Low temperature for factual extraction and accurate math
      top_p: 0.9,
      stop: ['<|im_end|>', '<|im_start|>', '<|endoftext|>'],
    },
    (data) => {
      if (data.token) {
        fullResponse += data.token
        if (onToken) {
          onToken(data.token)
        }
      }
    }
  )

  return fullResponse.trim() || result.text.trim()
}
