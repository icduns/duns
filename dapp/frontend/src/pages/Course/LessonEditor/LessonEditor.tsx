import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Divider, Empty, Typography } from 'antd';
import cx from 'classnames';
import cloneDeep from 'lodash/cloneDeep';
import { useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { call, Lesson } from '~/api';
import { EditableBlock } from './blocks/EditableBlock';
import styles from './LessonEditor.module.less';
import { BlockListItem, LessonBlockWithId } from './LessonEditor.types';
import {
  createLessonBlock,
  generateIdsForBlocks,
  removeIdsFromBlocks,
} from './LessonEditor.utils';
import { LessonEditorToolbar } from './LessonEditorToolbar';

const { Title } = Typography;

export function LessonEditor() {
  const { t } = useTranslation();
  const { lessonId, courseId } = useParams();
  const [lesson, setLesson] = useState<Lesson>();
  const [lessonBlocks, setLessonBlocks] = useState<Array<LessonBlockWithId>>(
    [],
  );
  const [lessonUpdating, setLessonUpdating] = useState<boolean>();

  useEffect(() => {
    if (!lessonId) return;

    call('getLesson', lessonId).then((response) => {
      setLesson(response);
      setLessonBlocks(generateIdsForBlocks(response.blocks));
    });
  }, [lessonId]);

  const handleSave = useCallback(() => {
    if (!lesson) return;

    setLessonUpdating(true);

    call('updateLesson', {
      ...lesson,
      blocks: removeIdsFromBlocks(lessonBlocks),
    }).finally(() => setLessonUpdating(false));
  }, [lesson, lessonBlocks]);

  const handleBlockEdit = useCallback(
    (uuid: string, editedBlock: LessonBlockWithId) => {
      setLessonBlocks((blocks) => {
        const blockId = blocks.findIndex((block) => block.uuid === uuid);
        const updatedBlocks = cloneDeep(blocks);

        updatedBlocks[blockId] = editedBlock;
        return updatedBlocks;
      });
    },
    [],
  );

  const handleDelete = useCallback((uuid: string) => {
    setLessonBlocks((blocks) => blocks.filter((block) => block.uuid !== uuid));
  }, []);

  const addBlock = useCallback(({ type }: BlockListItem) => {
    const block = createLessonBlock(type);

    setLessonBlocks((blocks) => [...blocks, block]);
  }, []);

  const [, drop] = useDrop(() => ({
    accept: 'block',
    drop: addBlock,
  }));

  const dropAreaClasses: string = cx(styles.lessonEditor__body__dropArea, {
    [styles.lessonEditor__body__dropArea_empty]: !lessonBlocks?.length,
    [styles.lessonEditor__body__dropArea_disabled]: lessonUpdating,
  });

  if (!lesson) return null;

  return (
    <div className={styles.lessonEditor}>
      <div className={styles.lessonEditor__header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Link to={`/course/${courseId}`}>
            <Button size="small" icon={<ArrowLeftOutlined />} />
          </Link>
          <Title className={styles.lessonEditor__header__title} level={3}>
            {lesson.title}
          </Title>
        </div>

        <Button type="primary" loading={lessonUpdating} onClick={handleSave}>
          {t('save')}
        </Button>
      </div>

      <Divider style={{ marginTop: '12px', marginBottom: '12px' }} />

      <div className={styles.lessonEditor__body}>
        <div className={styles.lessonEditor__body__toolbar}>
          <LessonEditorToolbar />
        </div>

        <div ref={drop} className={dropAreaClasses}>
          {lessonBlocks.length ? (
            lessonBlocks.map((block) => (
              <EditableBlock
                key={block.uuid}
                block={block}
                onEdit={handleBlockEdit}
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
      </div>
    </div>
  );
}
