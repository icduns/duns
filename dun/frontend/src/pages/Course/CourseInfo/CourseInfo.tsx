import React from 'react';
import { Course } from '~/api';

export type CourseInfoProps = {
  course: Course;
  className?: string;
};

export function CourseInfo({ course, className }: CourseInfoProps) {
  return <div className={className}>{course.description}</div>;
}
