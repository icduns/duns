import { useCallback, useEffect, useState } from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { Button, Divider, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { call, Lesson, LessonBlock } from '~/api';
import { useNotification } from '~/hooks/useNotification';
import { truncateText } from '~/utils/truncateText';
import { convertEditorBlocksToLessonBlocks } from './blocks/blocks.helpers';
import { EditorBlock } from './blocks/blocks.types';
import { LessonEditorBlocks } from './blocks/LessonEditorBlocks';
import styles from './LessonEditor.module.less';
import { LessonEditorToolbar } from './LessonEditorToolbar';

const { Title } = Typography;

export function LessonEditor() {
  const { t } = useTranslation();
  const { lessonId, courseId } = useParams();
  const [lesson, setLesson] = useState<Lesson>();
  const [lessonBlocks, setLessonBlocks] = useState<Array<LessonBlock>>([]);
  const [editorBlocks, setEditorBlocks] = useState<Array<EditorBlock>>([]);
  const [lessonUpdating, setLessonUpdating] = useState<boolean>();
  const { open } = useNotification();

  useEffect(() => {
    if (!lessonId) return;

    call('getLessonForTutor', lessonId).then((response) => {
      setLesson(response);
      setLessonBlocks(response.blocks);
    });
  }, [lessonId]);

  const handleSave = useCallback(async () => {
    if (!lesson) return;

    const title = truncateText(lesson.title);
    const key = open({
      message: t('saving', { title }),
      state: 'inProgress',
    });

    setLessonUpdating(true);

    const blocks: Array<LessonBlock> = await convertEditorBlocksToLessonBlocks(
      editorBlocks,
    );

    call('updateLesson', {
      ...lesson,
      blocks,
    })
      .then(() =>
        open({
          message: t('saved', { title }),
          key,
          state: 'finished',
        }),
      )
      .finally(() => {
        setLessonUpdating(false);
      });
  }, [lesson, open, t, editorBlocks]);

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

        <LessonEditorBlocks
          lessonBlocks={lessonBlocks}
          onBlocksChange={setEditorBlocks}
        />
      </div>
    </div>
  );
}
