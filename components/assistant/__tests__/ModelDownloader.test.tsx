import React from 'react'
import { renderTree, hasText, getTexts, press, lastPressable, findPressables } from '@/test-utils'
import ModelDownloader from '@/components/assistant/ModelDownloader'
import { Strings } from '@/constants/Strings'

describe('components/assistant/ModelDownloader', () => {
  it('renders initial state with download button, model selector, and specs', () => {
    const onStartDownload = jest.fn()
    const onSelectModel = jest.fn()
    const tree = renderTree(
      <ModelDownloader
        progress={0}
        status="not_downloaded"
        onStartDownload={onStartDownload}
        onSelectModel={onSelectModel}
      />
    )

    expect(hasText(tree, Strings.ASSISTANT.MODEL_TITLE)).toBe(true)
    expect(hasText(tree, 'Ligero (1.5B)')).toBe(true)
    expect(hasText(tree, 'Avanzado (3B)')).toBe(true)
    expect(hasText(tree, Strings.ASSISTANT.DOWNLOAD_BTN)).toBe(true)

    const pressables = findPressables(tree)
    press(pressables[1])
    expect(onSelectModel).toHaveBeenCalledWith('advanced')

    press(lastPressable(tree))
    expect(onStartDownload).toHaveBeenCalledTimes(1)
  })

  it('handles pressing model option when onSelectModel is not provided and falls back on unknown model', () => {
    const tree = renderTree(
      <ModelDownloader
        progress={0}
        status="not_downloaded"
        selectedModel={'unknown' as any}
        onStartDownload={jest.fn()}
      />
    )
    const pressables = findPressables(tree)
    press(pressables[0])
    expect(getTexts(tree).some((t) => t.includes('Qwen 2.5 (1.5B)'))).toBe(true)
  })

  it('renders advanced download label when selectedModel is advanced', () => {
    const tree = renderTree(
      <ModelDownloader
        progress={0}
        status="not_downloaded"
        selectedModel="advanced"
        onStartDownload={jest.fn()}
      />
    )

    expect(hasText(tree, Strings.ASSISTANT.DOWNLOAD_ADVANCED_BTN)).toBe(true)
  })

  it('renders downloading state with progress percentage', () => {
    const tree = renderTree(
      <ModelDownloader
        progress={45}
        status="downloading"
        onStartDownload={jest.fn()}
      />
    )

    expect(hasText(tree, Strings.ASSISTANT.DOWNLOADING)).toBe(true)
    expect(hasText(tree, '45%')).toBe(true)
  })

  it('renders error state with custom and default error messages and retry button', () => {
    const onRetry = jest.fn()
    const tree = renderTree(
      <ModelDownloader
        progress={0}
        status="error"
        onStartDownload={onRetry}
        errorMessage="Network timeout"
      />
    )

    expect(hasText(tree, 'Network timeout')).toBe(true)
    expect(hasText(tree, Strings.ASSISTANT.RETRY)).toBe(true)

    press(lastPressable(tree))
    expect(onRetry).toHaveBeenCalledTimes(1)

    const fallbackTree = renderTree(
      <ModelDownloader
        progress={0}
        status="error"
        onStartDownload={onRetry}
      />
    )
    expect(hasText(fallbackTree, Strings.ASSISTANT.DOWNLOAD_ERROR)).toBe(true)
  })
})
