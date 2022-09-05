import { PropsWithChildren } from 'react';
import { Col, Row, Space, Typography } from 'antd';
import { Lesson } from '../../../../../../declarations/dun_backend/dun_backend.did';
import styles from './CourseLesson.module.less';

const { Title } = Typography;
type CourseLessonProps = PropsWithChildren<{ lesson: Lesson }>;

export function CourseLesson(props: CourseLessonProps) {
  const { lesson, children } = props;
  return (
    <Row justify="space-between" align="middle" className={styles.CourseLesson}>
      <Col>
        <Title ellipsis level={5} style={{ margin: 0 }}>
          {lesson.title}
        </Title>
      </Col>
      <Col>
        <Space>{children}</Space>
      </Col>
    </Row>
  );
}
