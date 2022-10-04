import { PropsWithChildren, useCallback, useMemo } from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Course } from '~/api';
import { CourseImage } from '~/components/CourseImage';
import { useCourseLevel } from '~/hooks/useCourseLevel';
import styles from './CourseCard.module.less';

const { Title, Text } = Typography;

export type CourseCardProps = PropsWithChildren<{
  course: Course;
  isTutor: boolean;
  onOpenCourseInfo: (e: Course) => void;
}>;

export function CourseCard(props: CourseCardProps) {
  const { course, children, isTutor, onOpenCourseInfo } = props;

  const link = `/course/${course.id}`;
  const level = useCourseLevel(course.level);

  const handleClick = useCallback(
    () => onOpenCourseInfo(course),
    [course, onOpenCourseInfo],
  );

  const image = useMemo(
    () => <CourseImage imageId={course.imageId} title={course.title} />,
    [course.imageId, course.title],
  );
  const cover = useMemo(
    () =>
      isTutor ? (
        <Link to={link}>{image}</Link>
      ) : (
        <div onClick={handleClick}>{image}</div>
      ),
    [handleClick, image, isTutor, link],
  );

  return (
    <Card className={styles.courseCard} hoverable cover={cover}>
      <div className={styles.courseCard_body}>
        <div className={styles.courseCard_body_header}>
          <Title level={5} ellipsis>
            {course.title}
          </Title>
          {isTutor && children}
        </div>
        <Text type="secondary">{level}</Text>
      </div>
    </Card>
  );
}
