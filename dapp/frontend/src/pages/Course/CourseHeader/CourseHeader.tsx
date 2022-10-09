import React, { PropsWithChildren } from 'react';
import { Col, Row, Space, Tag, Typography } from 'antd';
import { RowProps } from 'antd/es/grid/row';
import { useTranslation } from 'react-i18next';
import { Course } from '~/api';
import styles from './CourseHeader.module.less';

const { Title } = Typography;
const gutter: RowProps['gutter'] = [0, { xs: 8, sm: 8, md: 0 }];

export type CourseHeaderProps = PropsWithChildren<{
  course: Course;
}>;

export function CourseHeader({ course, children }: CourseHeaderProps) {
  const { t } = useTranslation();

  return (
    <Col span={24} className={styles.courseHeader}>
      <Row justify="space-between" gutter={gutter}>
        <Col>
          <Space size={20} className={styles.courseHeader_titleContainer}>
            <Title level={3} ellipsis>
              {course.title}
            </Title>
            <Tag color={course.published ? 'green' : 'warning'}>
              {course.published
                ? t('courses.published_status')
                : t('courses.unpublished_status')}
            </Tag>
          </Space>
        </Col>
        <Col>{children}</Col>
      </Row>
    </Col>
  );
}
