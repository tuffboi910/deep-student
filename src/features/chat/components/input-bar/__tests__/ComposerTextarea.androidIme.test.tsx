import React, { createRef } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ComposerTextarea } from '../ComposerTextarea';

vi.mock('@/utils/platform', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/platform')>()),
  isAndroidWebView: () => true,
}));

const skillSlash = {
  open: false,
  moveSelectionUp: vi.fn(),
  moveSelectionDown: vi.fn(),
  dismiss: vi.fn(),
} as any;

function renderComposer(inputValue: string, onInputChange = vi.fn()) {
  const textareaRef = createRef<HTMLTextAreaElement>();
  const ghostRef = createRef<HTMLDivElement>();
  const viewportRef = createRef<HTMLDivElement>();

  const result = render(
    <ComposerTextarea
      textareaRef={textareaRef}
      ghostRef={ghostRef}
      viewportRef={viewportRef}
      inputValue={inputValue}
      placeholder="Message"
      isMobile
      isStreaming={false}
      queueEnabled={false}
      showStop={false}
      sendShortcut="enter"
      textareaViewportHeight={40}
      onInputChange={onInputChange}
      onCaretPosChange={vi.fn()}
      adjustTextareaHeight={vi.fn()}
      scrollCaretIntoView={vi.fn()}
      onSend={vi.fn()}
      onStop={vi.fn()}
      onFocusChange={vi.fn()}
      onPaste={vi.fn()}
      skillSlash={skillSlash}
      applySkillSlashSelection={vi.fn(() => false)}
    />,
  );

  return { ...result, textareaRef };
}

describe('ComposerTextarea Android WebView IME ownership', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not overwrite the live DOM composition with a stale React value', () => {
    const onInputChange = vi.fn();
    const { rerender, textareaRef } = renderComposer('', onInputChange);
    const textarea = screen.getByTestId('input-bar-v2-textarea') as HTMLTextAreaElement;

    fireEvent.compositionStart(textarea);
    fireEvent.change(textarea, { target: { value: 'h' } });
    expect(onInputChange).toHaveBeenCalledWith('h');

    // A parent render can still carry the previous store snapshot. Android's active editor
    // must retain the composing text instead of receiving a programmatic value write.
    rerender(
      <ComposerTextarea
        textareaRef={textareaRef}
        ghostRef={createRef<HTMLDivElement>()}
        viewportRef={createRef<HTMLDivElement>()}
        inputValue=""
        placeholder="Message"
        isMobile
        isStreaming={false}
        queueEnabled={false}
        showStop={false}
        sendShortcut="enter"
        textareaViewportHeight={40}
        onInputChange={onInputChange}
        onCaretPosChange={vi.fn()}
        adjustTextareaHeight={vi.fn()}
        scrollCaretIntoView={vi.fn()}
        onSend={vi.fn()}
        onStop={vi.fn()}
        onFocusChange={vi.fn()}
        onPaste={vi.fn()}
        skillSlash={skillSlash}
        applySkillSlashSelection={vi.fn(() => false)}
      />,
    );

    expect(screen.getByTestId('input-bar-v2-textarea')).toBe(textarea);
    expect(textarea.value).toBe('h');
  });

  it('applies a genuine external value change when no composition is active', () => {
    const { rerender, textareaRef } = renderComposer('draft');

    rerender(
      <ComposerTextarea
        textareaRef={textareaRef}
        ghostRef={createRef<HTMLDivElement>()}
        viewportRef={createRef<HTMLDivElement>()}
        inputValue=""
        placeholder="Message"
        isMobile
        isStreaming={false}
        queueEnabled={false}
        showStop={false}
        sendShortcut="enter"
        textareaViewportHeight={40}
        onInputChange={vi.fn()}
        onCaretPosChange={vi.fn()}
        adjustTextareaHeight={vi.fn()}
        scrollCaretIntoView={vi.fn()}
        onSend={vi.fn()}
        onStop={vi.fn()}
        onFocusChange={vi.fn()}
        onPaste={vi.fn()}
        skillSlash={skillSlash}
        applySkillSlashSelection={vi.fn(() => false)}
      />,
    );

    expect(screen.getByTestId('input-bar-v2-textarea')).toHaveValue('');
  });
});
