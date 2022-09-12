import { PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Course } from '~/api';
import { getFileUrl } from '~/files-api';
import styles from './CourseCard.module.less';

const { Title, Text } = Typography;

export type CourseCardProps = PropsWithChildren<{
  course: Course;
}>;

export function CourseCard({ course, children }: CourseCardProps) {
  const { t } = useTranslation();
  const [imageUrl, setImageUrl] = useState<string>();
  const [imageLoading, setImageLoading] = useState<boolean>(false);

  const link = `/course/${course.id}`;
  const level = useMemo(() => {
    const key = Object.keys(course.level)[0];
    return t(`courses.level_${key}`);
  }, [course.level, t]);

  useEffect(() => {
    setImageLoading(true);

    getFileUrl(course.imageId)
      .then(setImageUrl)
      .finally(() => setImageLoading(false));
  }, [course.imageId]);

  useEffect(
    () => () => {
      if (!imageUrl) return;
      URL.revokeObjectURL(imageUrl);
    },
    [imageUrl],
  );

  // TODO Loader for image
  return (
    <Card
      className={styles.courseCard}
      hoverable
      cover={
        <Link to={link}>
          <img
            className={styles.courseCardImage}
            width="320"
            height="160"
            alt={t('courses.image_description', { title: course.title })}
            src={imageUrl}
          />
        </Link>
      }
    >
      <div className={styles.courseCardBody}>
        <div className={styles.courseCardBodyHeader}>
          <Title level={5} ellipsis>
            {course.title}
          </Title>
          {children}
        </div>
        <Text type="secondary">{level}</Text>
      </div>
    </Card>
  );
}
