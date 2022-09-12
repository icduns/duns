import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { TextBlock as TextBlockType } from '~/api';
import { EditableBlockProps } from '../../LessonEditor.types';
import styles from './TextBlock.module.less';

export type TextBlockProps = EditableBlockProps & {
  block: {
    uuid: string;
    text: TextBlockType;
  };
};

export function TextBlock({ block, onEdit }: TextBlockProps) {
  const editor = useEditor({
    content: block.text.content || '',
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class: 'ant-input',
      },
    },
    onUpdate({ editor: editorRef }) {
      onEdit(block.uuid, {
        uuid: block.uuid,
        text: {
          content: editorRef.getHTML(),
          viewSettings: block.text.viewSettings,
        },
      });
    },
  });

  return (
    <div className={styles.text_block}>
      <EditorContent editor={editor} />
    </div>
  );
}
