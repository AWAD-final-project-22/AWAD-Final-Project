'use client';
import { useEffect, useRef } from 'react';
import { RichTextEditor } from '../styles/ComposeEmailModal.style';

interface RichTextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  fontFamily: string;
  fontSize: string;
  onFormatStateChange?: () => void;
}

export const RichTextInput: React.FC<RichTextInputProps> = ({
  value,
  onChange,
  fontFamily,
  fontSize,
  onFormatStateChange,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      editorRef.current &&
      value !== undefined &&
      editorRef.current.innerHTML !== value
    ) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyUpOrMouseUp = () => {
    handleInput();
    if (onFormatStateChange) {
      onFormatStateChange();
    }
  };

  return (
    <RichTextEditor
      ref={editorRef}
      contentEditable
      fontFamily={fontFamily}
      fontSize={fontSize}
      data-placeholder='Compose your email...'
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyUp={handleKeyUpOrMouseUp}
      onMouseUp={handleKeyUpOrMouseUp}
    />
  );
};
