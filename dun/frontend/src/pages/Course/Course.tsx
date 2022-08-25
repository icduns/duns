import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { call, Course as CourseType, Lesson } from '~/api';
import styles from './Course.module.less';
import { CourseHeader } from './CourseHeader';
import { CourseInfo } from './CourseInfo';
import { CourseLessons } from './CourseLessons';

export function Course() {
  const { id: courseId } = useParams();
  const [course, setCourse] = useState<CourseType>();
  const [lessons, setLessons] = useState<Array<Lesson>>([]);

  useEffect(() => {
    if (!courseId) return;

    call('getCourse', courseId)
      .then((response) => {
        setCourse(response);

        return call('getLessonsByCourse', response.id);
      })
      .then(setLessons);
  }, [courseId]);

  if (!course) return null;

  return (
    <div className={styles.course}>
      <CourseHeader course={course} />
      <CourseInfo course={course} className={styles.course__block} />
      <CourseLessons lessons={lessons} className={styles.course__block} />
    </div>
  );
}
