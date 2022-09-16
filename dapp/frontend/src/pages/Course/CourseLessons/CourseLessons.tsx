import React, { useCallback, useState } from 'react';
import {
  BuildOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Button, Col, Modal, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { call, Lesson } from '~/api';
import { CourseLesson } from '~/pages/Course/CourseLesson';
import {
  CourseLessonModal,
  CourseLessonModalProps,
} from '~/pages/Course/CourseLessonModal';
import { CourseLessonsPlaceholder } from '~/pages/Course/CourseLessons/CourseLessonsPlaceholder';

const { confirm } = Modal;
const { Title } = Typography;

type ModalData = Pick<CourseLessonModalProps, 'data' | 'visible' | 'type'>;
export type CourseLessonsProps = {
  lessons: Array<Lesson> | undefined;
  onAction: () => void;
  courseId: Lesson['courseId'];
  className?: string;
};

export function CourseLessons(props: CourseLessonsProps) {
  const { lessons, className, onAction, courseId } = props;
  const { t } = useTranslation();
  const [modalData, setModalData] = useState<ModalData>({
    type: 'create',
    visible: false,
  });

  const handleCreate = useCallback(
    () => setModalData({ visible: true, type: 'create' }),
    [],
  );

  const handleSubmit: CourseLessonModalProps['onSubmit'] = useCallback(
    (e) => {
      const action =
        'id' in e
          ? call('updateLesson', e)
          : call('createLesson', {
              ...e,
              courseId,
            });
      action.then(() => {
        onAction();
        setModalData((prModalData) => ({ ...prModalData, visible: false }));
      });
    },
    [courseId, onAction],
  );
  const handleDelete = useCallback(
    (lesson: Lesson) =>
      confirm({
        title: t('lessons.delete_lesson_confirm', { title: lesson.title }),
        okButtonProps: { danger: true },
        okText: t('delete'),
        onOk: () => call('deleteLesson', lesson.id).then(() => onAction()),
      }),
    [onAction, t],
  );

  return (
    <>
      <Col className={className} span={24}>
        <Row justify="space-between">
          <Col>
            <Title level={3}>{t('lessons.title')}</Title>
          </Col>
          {Boolean(lessons?.length) && (
            <Col>
              <Button
                type="text"
                icon={<PlusOutlined />}
                color="primary"
                onClick={handleCreate}
              >
                {t('lessons.new_lesson')}
              </Button>
            </Col>
          )}
        </Row>

        {lessons &&
          (lessons.length ? (
            <>
              {lessons.map((lesson) => (
                <CourseLesson key={lesson.id} lesson={lesson}>
                  <Button
                    type="text"
                    shape="circle"
                    onClick={() =>
                      setModalData({
                        visible: true,
                        type: 'edit',
                        data: lesson,
                      })
                    }
                  >
                    <EditOutlined />
                  </Button>
                  <Link to={`lesson/${lesson.id}`}>
                    <BuildOutlined />
                  </Link>
                  <Button
                    type="text"
                    shape="circle"
                    onClick={() => handleDelete(lesson)}
                  >
                    <DeleteOutlined />
                  </Button>
                </CourseLesson>
              ))}
            </>
          ) : (
            <CourseLessonsPlaceholder>
              <Button type="primary" onClick={handleCreate}>
                {t('lessons.new_lesson')}
              </Button>
            </CourseLessonsPlaceholder>
          ))}
      </Col>
      <CourseLessonModal
        {...modalData}
        onCancel={() =>
          setModalData((prModalData) => ({ ...prModalData, visible: false }))
        }
        onSubmit={handleSubmit}
      />
    </>
  );
}
