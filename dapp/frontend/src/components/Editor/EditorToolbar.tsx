import {
  AlignCenterOutlined,
  AlignLeftOutlined,
  AlignRightOutlined,
  BoldOutlined,
  CodeOutlined,
  ItalicOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  RedoOutlined,
  StrikethroughOutlined,
  UndoOutlined,
  UnorderedListOutlined,
} from '@ant-design/icons';
import { Editor } from '@tiptap/react';
import { Button, Divider } from 'antd';
import styles from './EditorToolbar.module.less';

export type EditorToolbarProps = {
  editor: Editor;
};

export function EditorToolbar({ editor }: EditorToolbarProps) {
  return (
    <div
      className={styles.editorToolbar}
      onPointerDown={(event) => event.preventDefault()}
    >
      <Button
        size="small"
        icon={<BoldOutlined />}
        type={editor.isActive('bold') ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().toggleBold().run()}
      />
      <Button
        size="small"
        icon={<ItalicOutlined />}
        type={editor.isActive('italic') ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      />
      <Button
        size="small"
        icon={<StrikethroughOutlined />}
        type={editor.isActive('strike') ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      />

      <Divider type="vertical" />

      <Button
        size="small"
        icon={<OrderedListOutlined />}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      />
      <Button
        size="small"
        icon={<UnorderedListOutlined />}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      />

      <Divider type="vertical" />

      <Button
        size="small"
        icon={<CodeOutlined />}
        type={editor.isActive('codeBlock') ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      />

      <Button
        size="small"
        icon={<MenuUnfoldOutlined />}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      />

      <Divider type="vertical" />

      <Button
        size="small"
        icon={<AlignLeftOutlined />}
        type={editor.isActive({ textAlign: 'left' }) ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      />
      <Button
        size="small"
        icon={<AlignCenterOutlined />}
        type={editor.isActive({ textAlign: 'center' }) ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      />
      <Button
        size="small"
        icon={<AlignRightOutlined />}
        type={editor.isActive({ textAlign: 'right' }) ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      />

      <Divider type="vertical" />

      <Button
        size="small"
        type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        H1
      </Button>
      <Button
        size="small"
        type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </Button>
      <Button
        size="small"
        type={editor.isActive('heading', { level: 3 }) ? 'primary' : 'default'}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </Button>

      <Divider type="vertical" />

      <Button
        size="small"
        icon={<UndoOutlined />}
        disabled={!editor.can().chain().focus().undo().run()}
        onClick={() => editor.chain().focus().undo().run()}
      />
      <Button
        size="small"
        icon={<RedoOutlined />}
        disabled={!editor.can().chain().focus().redo().run()}
        onClick={() => editor.chain().focus().redo().run()}
      />
    </div>
  );
}
