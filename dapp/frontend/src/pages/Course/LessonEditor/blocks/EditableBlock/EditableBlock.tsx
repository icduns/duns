import { FC, useCallback } from 'react';
import { DeleteOutlined, DragOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { useDrag } from 'react-dnd';
import { LessonBlock } from '~/api';
import {
  EditableBlockProps,
  LessonBlockWithId,
} from '../../LessonEditor.types';
import { ImageBlock } from '../ImageBlock';
import { TextBlock } from '../TextBlock';
import { VideoBlock } from '../VideoBlock';
import styles from './EditableBlock.module.less';

function getComponentByBlockType(block: LessonBlock): FC {
  if ('text' in block) {
    return TextBlock as FC;
  }

  if ('image' in block) {
    return ImageBlock as FC;
  }

  if ('video' in block) {
    return VideoBlock as FC;
  }

  return () => null;
}

export function EditableBlock(props: EditableBlockProps) {
  const { block, onDelete, onEdit } = props;
  const [, drag, preview] = useDrag({
    type: 'block',
    item: {
      ...block,
    },
  });

  const Block: FC<Omit<EditableBlockProps, 'onDelete'>> =
    getComponentByBlockType(block);

  const handleDelete = useCallback(
    () => onDelete(block.uuid),
    [block.uuid, onDelete],
  );
  const handleEdit = useCallback(
    (uuid: string, editedBlock: LessonBlockWithId) => onEdit(uuid, editedBlock),
    [onEdit],
  );

  return (
    <div ref={preview} className={styles.editableBlock}>
      <div className={styles.editableBlock__actions}>
        <Button size="small" ref={drag} icon={<DragOutlined />} />
        <Button
          danger
          size="small"
          onClick={handleDelete}
          icon={<DeleteOutlined />}
        />
      </div>
      <Block block={block} onEdit={handleEdit} />
    </div>
  );
}
