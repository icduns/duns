import { useCallback } from 'react';
import { Editor } from '~/components/Editor';
import { EditorTextBlock } from '../blocks.types';

export type TextBlockProps = {
  block: EditorTextBlock;
  onEdit?: (blockUuid: string, value: Partial<EditorTextBlock>) => void;
};

export function TextBlock({ block, onEdit }: TextBlockProps) {
  const onEditorUpdate = useCallback(
    (value: string) => {
      if (!onEdit) return;

      onEdit(block.uuid, {
        text: value,
      });
    },
    [block, onEdit],
  );

  return <Editor content={block.text} onUpdate={onEditorUpdate} />;
}
