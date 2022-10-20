import { useEffect } from 'react';
import { TextAlign } from '@tiptap/extension-text-align';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Divider } from 'antd';
import cx from 'classnames';
import styles from './Editor.module.less';
import { EditorToolbar } from './EditorToolbar';

export type EditorProps = {
  content?: string;
  readonly?: boolean;
  onUpdate?: (value: string) => unknown;
};

export function Editor({ content, readonly, onUpdate }: EditorProps) {
  const editor = useEditor({
    content: content || '',
    extensions: [
      StarterKit,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    editable: !readonly,
    editorProps: {
      attributes: {
        class: cx(styles.editorMirror),
      },
    },
    onUpdate({ editor: editorRef }) {
      if (!onUpdate) return;

      onUpdate(editorRef.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!readonly);
  }, [editor, readonly]);

  if (!editor) return null;

  const editorClasses = cx(styles.editor, {
    'ant-input': !readonly,
    'ant-input-focused': !readonly && editor?.isFocused,
    [styles.editor_readonly]: readonly,
  });

  return (
    <div className={editorClasses}>
      {!readonly && (
        <div className={styles.editor__toolbar}>
          <EditorToolbar editor={editor} />
          <Divider className={styles.editor__toolbarDivider} />
        </div>
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
