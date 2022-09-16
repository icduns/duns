import { PropsWithChildren, useMemo } from 'react';
import { Card, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Course } from '~/api';
import { CourseImage } from '~/components/CourseImage';
import styles from './CourseCard.module.less';

const { Title, Text } = Typography;

export type CourseCardProps = PropsWithChildren<{
  course: Course;
}>;

export function CourseCard({ course, children }: CourseCardProps) {
  const { t } = useTranslation();

  const link = `/course/${course.id}`;
  const level = useMemo(() => {
    const key = Object.keys(course.level)[0];
    return t(`courses.level_${key}`);
  }, [course.level, t]);

  return (
    <Card
      className={styles.courseCard}
      hoverable
      cover={
        <Link to={link}>
          <CourseImage imageId={course.imageId} title={course.title} />
        </Link>
      }
    >
      <div className={styles.courseCard_body}>
        <div className={styles.courseCard_body_header}>
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
