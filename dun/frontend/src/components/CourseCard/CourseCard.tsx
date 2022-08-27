import React from 'react';
import { Link } from 'react-router-dom';
import { Course } from '~/api';

export type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  const link = `/course/${course.id}`;

  return <Link to={link}>{course.title}</Link>;
}
