import React, { useEffect, useState } from 'react';
import { call, Course, ErrorResponse } from '~/api';
import { CourseCard } from '~/components/CourseCard';

export function Courses() {
  const [courses, setCourses] = useState<Array<Course>>([]);

  useEffect(() => {
    call('getCourses')
      .then(setCourses)
      .catch((err: ErrorResponse) => {
        global.console.log('# Error', err);
      });
  }, []);

  return (
    <>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </>
  );
}
