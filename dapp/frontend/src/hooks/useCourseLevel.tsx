import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CourseLevel } from '~/api';

export function useCourseLevel(level?: CourseLevel) {
  const { t } = useTranslation();

  return useMemo(() => {
    if (!level) {
      return '';
    }
    const value = Object.keys(level)[0];
    return t(`courses.level_${value}`);
  }, [level, t]);
}
