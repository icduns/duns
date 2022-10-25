import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { call, Course, CourseProgress } from '~/api';
import { Courses, CoursesProps } from '~/components/Courses';
import { CoursesPlaceholder } from '~/components/Courses/CoursesPlaceholder';
import styles from '~/pages/MyLearning/MyLearning.module.less';

const { Title } = Typography;
export default function MyLearning() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Array<Course> | undefined>();
  const [learningCourses, setLearningCourses] = useState<
    Array<CourseProgress> | undefined
  >();
  const [initialCourses, setInitialCourses] = useState<
    Array<Course> | undefined
  >();
  const [currentTab, setCurrentTab] = useState<string>('inProgress');
  const [shouldGetCourses, setShouldGetCourses] = useState(true);

  useEffect(() => {
    if (shouldGetCourses) {
      setShouldGetCourses(false);
      Promise.all([call('getCourses'), call('getStudentCourses')]).then(
        ([coursesRes, learningCoursesRes]) => {
          setInitialCourses(coursesRes);
          setLearningCourses(learningCoursesRes);
        },
      );
    }
  }, [shouldGetCourses]);
  useEffect(() => {
    if (learningCourses && initialCourses) {
      const isInProgressTab = currentTab === 'inProgress';
      const res = learningCourses.filter(({ completed }) =>
        isInProgressTab ? !completed : completed,
      );
      setCourses(
        initialCourses.filter(({ id }) =>
          res.find((item) => item.id.courseId === id),
        ),
      );
    }
  }, [currentTab, initialCourses, learningCourses]);

  const header = useMemo(
    () => (
      <Title className={styles.myLearning_title} level={3}>
        {t('courses.my_learning.title')}
      </Title>
    ),
    [t],
  );
  const tabsItems = useMemo<CoursesProps['tabs']>(
    () => [
      { label: t('courses.my_learning.in_progress'), key: 'inProgress' },
      { label: t('courses.my_learning.completed'), key: 'completed' },
    ],
    [t],
  );
  const handleExploreNow = useCallback(() => navigate('/'), [navigate]);
  const placeholder = useMemo(() => {
    const isInProgress = currentTab === 'inProgress';
    return (
      <CoursesPlaceholder
        text={
          isInProgress
            ? t('courses.my_learning.in_progress_placeholder')
            : t('courses.my_learning.completed_placeholder')
        }
      >
        {isInProgress && (
          <Button type="primary" onClick={handleExploreNow}>
            {t('courses.my_learning.explore_now')}
          </Button>
        )}
      </CoursesPlaceholder>
    );
  }, [currentTab, handleExploreNow, t]);

  const handleTabChange = useCallback<Required<CoursesProps>['onTabChange']>(
    (e) => setCurrentTab(e),
    [],
  );
  const handleUpdate = useCallback(() => setShouldGetCourses(true), []);

  return (
    <Courses
      header={header}
      courses={courses}
      placeholder={placeholder}
      tabs={tabsItems}
      onTabChange={handleTabChange}
      onUpdate={handleUpdate}
    />
  );
}
