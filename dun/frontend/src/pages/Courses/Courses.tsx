import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Modal, Row, Spin, Typography } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import { useTranslation } from 'react-i18next';
import { call, Course, ErrorResponse } from '~/api';
import { CourseCard, CourseCardProps } from '~/components/CourseCard';
import { CourseModal, CourseModalProps } from '~/components/CourseModal';
import { CoursesPlaceholder } from '~/pages/Courses/CoursesPlaceholder';
import styles from './Courses.module.less';

const { Title } = Typography;
const { confirm } = Modal;
type ModalData = Pick<CourseModalProps, 'type' | 'data' | 'visible'>;
const gridGutter: [Gutter, Gutter] = [24, 24];

export function Courses() {
  const [courses, setCourses] = useState<Array<Course> | undefined>();
  const [shouldGetCourses, setShouldGetCourses] = useState(true);
  const [modalData, setModalData] = useState<ModalData>({
    type: 'create',
    visible: false,
  });

  const { t } = useTranslation();

  const handleModalCreate = useCallback(
    () => setModalData({ type: 'create', visible: true }),
    [],
  );
  const handleSubmit: CourseModalProps['onSubmit'] = useCallback((e) => {
    const action =
      'id' in e
        ? // TODO: Should remove `subtitle` after changing api
          call('updateCourse', { ...e, subtitle: 'TEST' })
        : call('createCourse', { ...e, subtitle: 'TEST' });
    action.then(() => {
      setModalData((prModalData) => ({ ...prModalData, visible: false }));
      setShouldGetCourses(true);
    });
  }, []);
  const handleAction: CourseCardProps['onAction'] = useCallback(
    ({ course, type }) => {
      switch (type) {
        case 'edit':
          setModalData({ type: 'edit', data: course, visible: true });
          break;
        case 'delete':
          confirm({
            title: t('courses.delete_course_confirm', { title: course.title }),
            okButtonProps: { danger: true },
            okText: t('delete'),
            onOk: () =>
              call('deleteCourse', course.id).then(() =>
                setShouldGetCourses(true),
              ),
          });
          break;
        default:
          break;
      }
    },
    [t],
  );

  const newCourseAction = (
    <Button type="primary" onClick={handleModalCreate}>
      {t('courses.new_course')}
    </Button>
  );

  useEffect(() => {
    if (shouldGetCourses) {
      setShouldGetCourses(false);
      call('getCourses')
        .then(setCourses)
        .catch((err: ErrorResponse) => {
          global.console.log('# Error', err);
        });
    }
  }, [shouldGetCourses]);

  if (!courses) {
    return <Spin size="large" />;
  }

  return (
    <>
      <div className={styles.courses__header}>
        <Title level={3}>{t('courses.title')}</Title> {newCourseAction}
      </div>
      {courses.length ? (
        <Row gutter={gridGutter}>
          {courses.map((course) => (
            <Col key={course.id}>
              <CourseCard course={course} onAction={handleAction} />
            </Col>
          ))}
        </Row>
      ) : (
        <CoursesPlaceholder>{newCourseAction}</CoursesPlaceholder>
      )}
      <CourseModal
        {...modalData}
        onCancel={() =>
          setModalData((prModalData) => ({ ...prModalData, visible: false }))
        }
        onSubmit={handleSubmit}
      />
    </>
  );
}
