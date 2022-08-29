import React from 'react';
import { CourseCard } from '~/components/CourseCard';
import { useActorCall } from '~/hooks/useActorCall';

export function Courses() {
  const [courses] = useActorCall('getCourses');

  if (!courses) return null;

  return (
    <>
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} />
      ))}
    </>
  );
}
