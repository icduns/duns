import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row, Spin, Typography } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import { useTranslation } from 'react-i18next';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { call, Course, ErrorResponse } from '~/api';
import { CourseActions, CourseActionsProps } from '~/components/CourseActions';
import { CourseCard } from '~/components/CourseCard';
import { CourseModal, CourseModalProps } from '~/components/CourseModal';
import { CoursesPlaceholder } from '~/pages/Courses/CoursesPlaceholder';
import styles from './Courses.module.less';

const { Title } = Typography;
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
      'id' in e ? call('updateCourse', e) : call('createCourse', e);

    action.then(() => {
      setModalData((prModalData) => ({ ...prModalData, visible: false }));
      setShouldGetCourses(true);
    });
  }, []);
  const handleAction: CourseActionsProps['onAction'] = useCallback(
    () => setShouldGetCourses(true),
    [],
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
    <Row gutter={[0, 16]}>
      <Col span={24}>
        <Row className={styles.courses__header} justify="space-between">
          <Col>
            <Title level={3}>{t('courses.title')}</Title>
          </Col>
          <Col>{newCourseAction}</Col>
        </Row>
      </Col>
      <Col span={24}>
        {courses.length ? (
          <Row gutter={gridGutter}>
            <TransitionGroup component={null}>
              {courses.map((course, index) => (
                <CSSTransition
                  key={course.id}
                  classNames={{
                    appear: styles.coursesItemAppear,
                    appearActive: styles.coursesItemActive,
                  }}
                  timeout={index * 200}
                  appear
                >
                  <Col>
                    <CourseCard course={course}>
                      <CourseActions course={course} onAction={handleAction} />
                    </CourseCard>
                  </Col>
                </CSSTransition>
              ))}
            </TransitionGroup>
          </Row>
        ) : (
          <CoursesPlaceholder>{newCourseAction}</CoursesPlaceholder>
        )}
      </Col>
      <CourseModal
        {...modalData}
        onCancel={() =>
          setModalData((prModalData) => ({ ...prModalData, visible: false }))
        }
        onSubmit={handleSubmit}
      />
    </Row>
  );
}
