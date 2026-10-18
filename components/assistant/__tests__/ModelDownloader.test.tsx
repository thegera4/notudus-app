import React from 'react'
import { renderTree, hasText, press, lastPressable } from '@/test-utils'
import ModelDownloader from '@/components/assistant/ModelDownloader'
import { Strings } from '@/constants/Strings'

describe('components/assistant/ModelDownloader', () => {
  it('renders initial state with download button and specs', () => {
    const onStartDownload = jest.fn()
    const tree = renderTree(
      <ModelDownloader
        progress={0}
        status="not_downloaded"
        onStartDownload={onStartDownload}
      />
    )

    expect(hasText(tree, Strings.ASSISTANT.MODEL_TITLE)).toBe(true)
    expect(hasText(tree, Strings.ASSISTANT.DOWNLOAD_BTN)).toBe(true)

    press(lastPressable(tree))
    expect(onStartDownload).toHaveBeenCalledTimes(1)
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

  it('renders error state with retry button', () => {
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
  })
})
