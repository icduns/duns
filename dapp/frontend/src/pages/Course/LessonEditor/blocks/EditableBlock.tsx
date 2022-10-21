import { useCallback } from 'react';
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
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

export type BlockMoveDirection = 'up' | 'down';

export type EditableBlockProps = {
  block: EditorBlock;
  isFirst: boolean;
  isLast: boolean;
  onEdit: (blockUuid: string, value: Partial<EditorBlock>) => void;
  onMove: (blockUuid: string, direction: BlockMoveDirection) => void;
  onDelete: (blockUuid: string) => void;
};

export function EditableBlock({
  block,
  isFirst,
  isLast,
  onEdit,
  onMove,
  onDelete,
}: EditableBlockProps) {
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

  const handleMove = useCallback(
    (direction: BlockMoveDirection) => {
      if (!onMove) return;

      onMove(block.uuid, direction);
    },
    [block.uuid, onMove],
  );

  return (
    <div id={block.uuid} className={styles.editableBlock}>
      <div className={styles.editableBlock__actions}>
        {!isLast && (
          <Button
            size="small"
            onClick={() => handleMove('down')}
            icon={<ArrowDownOutlined />}
          />
        )}
        {!isFirst && (
          <Button
            size="small"
            onClick={() => handleMove('up')}
            icon={<ArrowUpOutlined />}
          />
        )}
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
