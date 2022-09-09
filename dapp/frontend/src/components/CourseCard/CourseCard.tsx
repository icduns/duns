import { PropsWithChildren } from 'react';
import { Card, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Course } from '~/api';
import styles from './CourseCard.module.less';

const { Title } = Typography;

export type CourseCardProps = PropsWithChildren<{
  course: Course;
}>;

export function CourseCard({ course, children }: CourseCardProps) {
  const link = `/course/${course.id}`;

  return (
    <Card
      className={styles.courseCard}
      hoverable
      cover={
        <Link to={link}>
          <img
            width="320"
            height="160"
            alt="example"
            src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
          />
        </Link>
      }
    >
      <div className={styles.courseCard__body}>
        <Title level={5} ellipsis>
          {course.title}
        </Title>
        {children}
      </div>
    </Card>
  );
}
