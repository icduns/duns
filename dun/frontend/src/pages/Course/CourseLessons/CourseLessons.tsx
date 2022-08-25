import React from 'react';
import { Lesson } from '~/api';
import { useTranslation } from 'react-i18next';

export type CourseLessonsProps = {
  lessons: Array<Lesson>;
  className?: string;
};

export function CourseLessons({ lessons, className }: CourseLessonsProps) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div>{t('lessons')}</div>

      {lessons.map((lesson) => (
        <div key={lesson.id}>{lesson.title}</div>
      ))}
    </div>
  );
}
