import React from 'react';
import { useTranslation } from 'react-i18next';
import { Lesson } from '~/api';

export type CourseLessonsProps = {
  lessons: Array<Lesson> | undefined;
  className?: string;
};

export function CourseLessons({ lessons, className }: CourseLessonsProps) {
  const { t } = useTranslation();

  return (
    <div className={className}>
      <div>{t('lessons')}</div>

      {lessons ? (
        <>
          {lessons.map((lesson) => (
            <div key={lesson.id}>{lesson.title}</div>
          ))}
        </>
      ) : (
        <div>Empty todo</div>
      )}
    </div>
  );
}
