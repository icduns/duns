import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Row, Spin, Typography } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import { useTranslation } from 'react-i18next';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { call, Course } from '~/api';
import { CourseActions, CourseActionsProps } from '~/components/CourseActions';
import { CourseCard } from '~/components/CourseCard';
import { CourseDrawer } from '~/components/CourseDrawer';
import { CourseModal, CourseModalProps } from '~/components/CourseModal';
import { uploadFile } from '~/files-api';
import { CoursesPlaceholder } from '~/pages/Courses/CoursesPlaceholder';
import styles from './Courses.module.less';

const { Title } = Typography;
type ModalData = Pick<CourseModalProps, 'type' | 'data' | 'open'>;
const gridGutter: [Gutter, Gutter] = [24, 24];
const containerGutter: [Gutter, Gutter] = [0, 16];

export function Courses() {
  const [courses, setCourses] = useState<Array<Course> | undefined>();
  const [shouldGetCourses, setShouldGetCourses] = useState(true);
  const [modalData, setModalData] = useState<ModalData>({
    type: 'create',
    open: false,
  });
  const [courseInfo, setCourseInfo] = useState<Course>();

  const { t } = useTranslation();

  const handleModalCreate = useCallback(
    () => setModalData({ type: 'create', open: true }),
    [],
  );

  const handleSubmit: CourseModalProps['onSubmit'] = useCallback(async (e) => {
    if ('id' in e) {
      return;
    }

    let imageId = '';

    if (e.image) {
      imageId = await uploadFile(e.image);
    }

    const { image, ...restParams } = e;

    call('createCourse', { ...restParams, imageId }).then(() => {
      setModalData((prModalData) => ({ ...prModalData, open: false }));
      setShouldGetCourses(true);
    });
  }, []);

  const handleAction: CourseActionsProps['onAction'] = useCallback(
    () => setShouldGetCourses(true),
    [],
  );
  const handleCloseCourseInfo = useCallback(() => setCourseInfo(undefined), []);

  const newCourseAction = (
    <Button type="primary" onClick={handleModalCreate}>
      {t('courses.new_course')}
    </Button>
  );

  useEffect(() => {
    if (shouldGetCourses) {
      setShouldGetCourses(false);
      call('getCourses').then(setCourses);
    }
  }, [shouldGetCourses]);

  if (!courses) {
    return (
      <div className={styles.courses_spinContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={containerGutter}>
      <Col span={24}>
        <Row className={styles.courses_header} justify="space-between">
          <Col>
            <Title level={3}>{t('courses.title')}</Title>
          </Col>
          {Boolean(courses.length) && <Col>{newCourseAction}</Col>}
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
                    appear: styles.courses_item__appear,
                    appearActive: styles.courses_item__active,
                  }}
                  timeout={index * 200}
                  appear
                >
                  <Col>
                    <CourseCard
                      course={course}
                      isTutor
                      onOpenCourseInfo={setCourseInfo}
                    >
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
          setModalData((prModalData) => ({ ...prModalData, open: false }))
        }
        onSubmit={handleSubmit}
      />
      <CourseDrawer
        open={Boolean(courseInfo)}
        course={courseInfo}
        onClose={handleCloseCourseInfo}
      />
    </Row>
  );
}
