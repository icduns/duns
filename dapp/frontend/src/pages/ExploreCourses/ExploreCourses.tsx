import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { call, Course } from '~/api';
import { CourseDrawer } from '~/components/CourseDrawer';
import { Courses } from '~/components/Courses';
import { CoursesPlaceholder } from '~/components/Courses/CoursesPlaceholder';
import { AuthContext } from '~/providers/AuthProvider';
import styles from './ExploreCourses.module.less';

const { Title } = Typography;

export function ExploreCourses() {
  const { t } = useTranslation();
  const { isAuthenticated } = useContext(AuthContext);

  const [courses, setCourses] = useState<Array<Course> | undefined>();
  const [shouldGetCourses, setShouldGetCourses] = useState(true);
  const [courseInfo, setCourseInfo] = useState<Course>();

  const header = useMemo(
    () => (
      <Title className={styles.exploreCourses_title} level={3}>
        {t('courses.explore')}
      </Title>
    ),
    [t],
  );

  const handleCloseCourseInfo = useCallback(() => setCourseInfo(undefined), []);

  useEffect(() => {
    if (shouldGetCourses) {
      setShouldGetCourses(false);
      call('getCourses').then(setCourses);
    }
  }, [shouldGetCourses]);

  return (
    <>
      <Courses
        enableCourseInfo
        onOpenCourseInfo={setCourseInfo}
        header={header}
        courses={courses}
        placeholder={<CoursesPlaceholder />}
      />
      <CourseDrawer
        enableStartCourse={isAuthenticated}
        open={Boolean(courseInfo)}
        course={courseInfo}
        onClose={handleCloseCourseInfo}
      />
    </>
  );
}
