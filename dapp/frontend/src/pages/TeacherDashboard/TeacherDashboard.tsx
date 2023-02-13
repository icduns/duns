import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Usergeek } from 'usergeek-ic-js';
import { call, Course } from '~/api';
import { CourseModal, CourseModalProps } from '~/components/CourseModal';
import { Courses, CoursesProps } from '~/components/Courses';
import { CoursesPlaceholder } from '~/components/Courses/CoursesPlaceholder';
import { uploadFile } from '~/files-api';
import { useNotification } from '~/hooks/useNotification';
import { truncateText } from '~/utils/truncateText';
import styles from './TeacherDashboard.module.less';

type ModalData = Pick<CourseModalProps, 'type' | 'data' | 'open'>;
const { Title } = Typography;
export default function TeacherDashboard() {
  const { t } = useTranslation();
  const [courses, setCourses] = useState<Array<Course> | undefined>();
  const [initialCourses, setInitialCourses] = useState<
    Array<Course> | undefined
  >();
  const [shouldGetCourses, setShouldGetCourses] = useState(true);
  const [modalData, setModalData] = useState<ModalData>({
    type: 'create',
    open: false,
  });
  const [currentTab, setCurrentTab] = useState<string>('unpublished');
  const { open } = useNotification();

  useEffect(() => {
    if (shouldGetCourses) {
      setShouldGetCourses(false);
      call('getCoursesForTutor').then(setInitialCourses);
    }
  }, [shouldGetCourses]);
  useEffect(() => {
    if (initialCourses) {
      const isPublishedTab = currentTab === 'published';
      const res = initialCourses.filter(({ published }) =>
        isPublishedTab ? published : !published,
      );
      setCourses(res);
    }
  }, [currentTab, initialCourses]);

  const handleModalCreate = useCallback(
    () => setModalData({ type: 'create', open: true }),
    [],
  );

  const newCourseAction = useMemo(
    () => (
      <Button type="primary" onClick={handleModalCreate}>
        {t('courses.new_course')}
      </Button>
    ),
    [handleModalCreate, t],
  );
  const header = useMemo(
    () => (
      <Row className={styles.teacherDashboard_header} justify="space-between">
        <Col>
          <Title level={3}>{t('courses.teacher_dashboard')}</Title>
        </Col>
        {Boolean(courses?.length) && <Col>{newCourseAction}</Col>}
      </Row>
    ),
    [courses?.length, newCourseAction, t],
  );
  const placeholder = useMemo(
    () => (
      <CoursesPlaceholder
        text={
          currentTab === 'published'
            ? t('courses.published_placeholder')
            : t('courses.unpublished_placeholder')
        }
      >
        {newCourseAction}
      </CoursesPlaceholder>
    ),
    [currentTab, newCourseAction, t],
  );
  const tabsItems = useMemo<CoursesProps['tabs']>(
    () => [
      { label: t('courses.unpublished'), key: 'unpublished' },
      { label: t('courses.published'), key: 'published' },
    ],
    [t],
  );

  const handleSubmit: CourseModalProps['onSubmit'] = useCallback(
    async (e) => {
      if ('id' in e) {
        return;
      }

      setModalData((prModalData) => ({ ...prModalData, open: false }));

      const title = truncateText(e.title);
      const key = open({
        message: t('creating', { title }),
        state: 'inProgress',
      });
      let imageId = '';

      if (e.image) {
        imageId = await uploadFile(e.image);
      }

      const { image, ...restParams } = e;

      call('createCourse', { ...restParams, imageId }).then(() => {
        open({
          message: t('created', { title }),
          key,
          state: 'finished',
        });
        setShouldGetCourses(true);
        Usergeek.trackEvent("CourseCreated");
      });
    },
    [open, t],
  );
  const handleTabChange = useCallback<Required<CoursesProps>['onTabChange']>(
    (e) => setCurrentTab(e),
    [],
  );
  const handleUpdate = useCallback(() => setShouldGetCourses(true), []);

  return (
    <>
      <Courses
        enableActions
        header={header}
        courses={courses}
        placeholder={placeholder}
        tabs={tabsItems}
        onTabChange={handleTabChange}
        onUpdate={handleUpdate}
      />
      <CourseModal
        {...modalData}
        onCancel={() =>
          setModalData((prModalData) => ({ ...prModalData, open: false }))
        }
        onSubmit={handleSubmit}
      />
    </>
  );
}
