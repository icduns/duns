import React from 'react';
import { useParams } from 'react-router-dom';
import { useActorCall } from '~/hooks/useActorCall';
import styles from './Course.module.less';
import { CourseHeader } from './CourseHeader';
import { CourseInfo } from './CourseInfo';
import { CourseLessons } from './CourseLessons';

export function Course() {
  const { id: courseId } = useParams();

  const [course] = useActorCall('getCourse', courseId);
  const [lessons] = useActorCall('getLessonsByCourse', course?.id);

  if (!course) return null;

  return (
    <div className={styles.course}>
      <CourseHeader course={course} />
      <CourseInfo course={course} className={styles.course__block} />
      <CourseLessons lessons={lessons} />
    </div>
  );
}
