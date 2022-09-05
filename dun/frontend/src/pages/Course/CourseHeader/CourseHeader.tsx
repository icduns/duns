import React, { PropsWithChildren } from 'react';
import { Col, Row, Space, Tag, Typography } from 'antd';
import { Course } from '~/api';

const { Title } = Typography;

export type CourseHeaderProps = PropsWithChildren<{
  course: Course;
}>;

export function CourseHeader({ course, children }: CourseHeaderProps) {
  return (
    <Col span={24}>
      <Row justify="space-between">
        <Col>
          <Space size={20}>
            <Title level={3} style={{ margin: 'unset' }}>
              {course.title}
            </Title>
            {course.published ? (
              <Tag color="green">Published</Tag>
            ) : (
              <Tag>Draft</Tag>
            )}
          </Space>
        </Col>
        <Col>{children}</Col>
      </Row>
    </Col>
  );
}
