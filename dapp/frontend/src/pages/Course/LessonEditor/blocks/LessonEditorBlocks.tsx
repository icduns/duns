import { useCallback, useEffect, useState } from 'react';
import { Empty } from 'antd';
import cx from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { LessonBlock } from '~/api';
import { BlockListItem } from '../LessonEditor.types';
import {
  convertBlocksToEditorBlocks,
  convertEditorBlocksToLessonBlocks,
  createEditorBlock,
} from './blocks.helpers';
import { EditorBlock } from './blocks.types';
import { EditableBlock } from './EditableBlock';
import styles from './LessonEditorBlocks.module.less';

export type LessonEditorBlocksProps = {
  lessonBlocks: Array<LessonBlock>;
  onBlocksChange: (...args: any[]) => any;
  loading?: boolean;
};

export function LessonEditorBlocks({
  lessonBlocks,
  onBlocksChange,
  loading,
}: LessonEditorBlocksProps) {
  const { t } = useTranslation();
  const [editorBlocks, setEditorBlocks] = useState<Array<EditorBlock>>([]);
  const [, drop] = useDrop(() => ({
    accept: 'block',
    drop({ type }: BlockListItem) {
      const editorBlock = createEditorBlock(type);

      setEditorBlocks((blocks: Array<EditorBlock>) => [...blocks, editorBlock]);
    },
  }));

  useEffect(() => {
    convertBlocksToEditorBlocks(lessonBlocks).then(setEditorBlocks);
  }, []);

  useEffect(() => {
    onBlocksChange(editorBlocks);
  }, [editorBlocks, onBlocksChange]);

  const getSaveValues = useCallback(
    () => convertEditorBlocksToLessonBlocks(editorBlocks),
    [editorBlocks],
  );

  const handleEdit = useCallback(
    (uuid: string, editedBlock: Partial<EditorBlock>) => {
      const blockIndex = editorBlocks.findIndex((block) => block.uuid === uuid);
      const newBlock = {
        ...editorBlocks[blockIndex],
        ...editedBlock,
      };

      setEditorBlocks((currentBlocks) => {
        const newBlocks = cloneDeep(currentBlocks);

        newBlocks.splice(blockIndex, 1, newBlock);
        return newBlocks;
      });
    },
    [editorBlocks],
  );

  const handleDelete = useCallback(
    (uuid: string) =>
      setEditorBlocks((blocks) =>
        blocks.filter((block) => block.uuid !== uuid),
      ),
    [],
  );

  const dropAreaClasses: string = cx(styles.lessonEditorBlocks, {
    [styles.lessonEditorBlocks_empty]: !editorBlocks?.length,
    [styles.lessonEditorBlocks_loading]: loading,
  });

  return (
    <div ref={drop} className={dropAreaClasses}>
      {editorBlocks.length ? (
        editorBlocks.map((block) => (
          <EditableBlock
            key={block.uuid}
            block={block}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))
      ) : (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={t('blocks.drop_blocks_here')}
        />
      )}
    </div>
  );
}
