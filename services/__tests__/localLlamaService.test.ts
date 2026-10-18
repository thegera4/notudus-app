import { selectRelevantNotes, queryLocalModel } from '@/services/localLlamaService'
import { NoteModelType } from '@/types'

const mockCompletion = jest.fn()
const mockRelease = jest.fn()

jest.mock('llama.rn', () => ({
  initLlama: jest.fn().mockImplementation(() =>
    Promise.resolve({
      completion: mockCompletion,
      release: mockRelease,
    })
  ),
}))

jest.mock('@/services/modelManagerService', () => ({
  isModelDownloaded: jest.fn().mockResolvedValue(true),
  getModelPath: jest.fn().mockReturnValue('/mock/model.gguf'),
}))

describe('services/localLlamaService', () => {
  const notes: NoteModelType[] = [
    {
      id: '1',
      title: 'Deudas familiares',
      content: 'Mama me debe $500 de la despensa y $300 de la gasolina.',
      locked: 0,
      date: '2026-01-01',
    },
    {
      id: '2',
      title: 'Contraseñas streaming',
      content: 'Netflix usuario: pepe@gmail.com pass: Secreto123',
      locked: 0,
      date: '2026-01-02',
    },
    {
      id: '3',
      title: 'Receta de cocina',
      content: 'Ingredientes: pasta, tomate, queso.',
      locked: 0,
      date: '2026-01-03',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('selects all notes if total length is under threshold', () => {
    const selected = selectRelevantNotes(notes, '¿Cuánto me debe mi mamá?')
    expect(selected.length).toBe(3)
  })

  it('selects relevant notes when querying financial info with long text', () => {
    const longNotes: NoteModelType[] = [
      ...notes,
      {
        id: '4',
        title: 'Diario largo',
        content: 'x'.repeat(9000),
        locked: 0,
        date: '2026-01-04',
      },
    ]

    const selected = selectRelevantNotes(longNotes, '¿Cuánto me debe mi mamá?')
    expect(selected.some((n) => n.id === '1')).toBe(true)
  })

  it('queries local model and receives completion tokens', async () => {
    mockCompletion.mockImplementation((_params, onToken) => {
      onToken({ token: 'Mama ' })
      onToken({ token: 'te debe ' })
      onToken({ token: '$800.' })
      return Promise.resolve({ text: 'Mama te debe $800.' })
    })

    const onToken = jest.fn()
    const result = await queryLocalModel('¿Cuánto me debe mi mamá?', notes, onToken)

    expect(result).toBe('Mama te debe $800.')
    expect(onToken).toHaveBeenCalledTimes(3)
  })
})
