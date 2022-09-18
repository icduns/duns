import { useCallback } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { BlockType } from '../LessonEditor.types';
import {
  EditorBlock,
  EditorImageBlock,
  EditorTextBlock,
  EditorVideoBlock,
} from './blocks.types';
import styles from './EditableBlock.module.less';
import { ImageBlock } from './ImageBlock';
import { TextBlock } from './TextBlock';
import { VideoBlock } from './VideoBlock';

export type EditableBlockProps = {
  block: EditorBlock;
  onEdit: (blockUuid: string, value: Partial<EditorBlock>) => void;
  onDelete: (blockUuid: string) => void;
};

export function EditableBlock({ block, onEdit, onDelete }: EditableBlockProps) {
  const renderBlock = () => {
    switch (block.type) {
      case BlockType.Text:
        return <TextBlock block={block as EditorTextBlock} onEdit={onEdit} />;
      case BlockType.Image:
        return <ImageBlock block={block as EditorImageBlock} onEdit={onEdit} />;
      case BlockType.Video:
        return <VideoBlock block={block as EditorVideoBlock} onEdit={onEdit} />;
    }
  };

  const handleDelete = useCallback(() => {
    if (!onDelete) return;

    onDelete(block.uuid);
  }, [block.uuid, onDelete]);

  return (
    <div className={styles.editableBlock}>
      <div className={styles.editableBlock__actions}>
        <Button
          danger
          size="small"
          onClick={handleDelete}
          icon={<DeleteOutlined />}
        />
      </div>
      <div className={styles.editableBlock__block}>{renderBlock()}</div>
    </div>
  );
}
