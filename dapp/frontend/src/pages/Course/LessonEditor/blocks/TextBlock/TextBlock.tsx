import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { EditorTextBlock } from '../blocks.types';
import styles from './TextBlock.module.less';

export type TextBlockProps = {
  block: EditorTextBlock;
  onEdit?: (blockUuid: string, value: Partial<EditorTextBlock>) => void;
};

export function TextBlock({ block, onEdit }: TextBlockProps) {
  const editor = useEditor({
    content: block.text || '',
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'ant-input',
      },
    },
    onUpdate({ editor: editorRef }) {
      if (!onEdit) return;

      onEdit(block.uuid, { text: editorRef.getHTML() });
    },
  });

  return (
    <div className={styles.text_block}>
      <EditorContent editor={editor} />
    </div>
  );
}
