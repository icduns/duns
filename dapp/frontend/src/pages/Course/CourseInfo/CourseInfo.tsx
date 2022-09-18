import React, { PropsWithChildren, useMemo } from 'react';
import { Col, Row, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Course } from '~/api';
import { CourseImage } from '~/components/CourseImage';
import styles from './CourseInfo.module.less';

const { Title, Paragraph, Text } = Typography;

export type CourseInfoProps = {
  course: Course;
};

function CourseInfoTile(props: PropsWithChildren<{ title: string }>) {
  const { title, children } = props;

  return (
    <Space direction="vertical">
      <Title level={5}>{title}</Title>
      {children}
    </Space>
  );
}

export function CourseInfo({ course }: CourseInfoProps) {
  const { t } = useTranslation();

  const level = useMemo(() => {
    const value = Object.keys(course.level)[0];
    return t(`courses.level_${value}`);
  }, [course.level, t]);

  return (
    <Col span={24} className={styles.courseInfo}>
      <Row gutter={[16, 0]}>
        <Col xs={24} md={12} xl={10}>
          <CourseInfoTile title={t('courses.description')}>
            <Paragraph
              type="secondary"
              className={styles.courseInfo_description}
            >
              {course.description}
            </Paragraph>
          </CourseInfoTile>
        </Col>
        <Col xs={24} md={12} xl={14}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <CourseInfoTile title={t('courses.categories')}>
                <div>
                  {course.categories.map((category) => (
                    <Tag key={category}>{category}</Tag>
                  ))}
                </div>
              </CourseInfoTile>
            </Col>
            <Col span={24}>
              <CourseInfoTile title={t('courses.level')}>
                <Text type="secondary">{level}</Text>
              </CourseInfoTile>
            </Col>
            <Col span={24}>
              <CourseInfoTile title={t('courses.image')}>
                <CourseImage imageId={course.imageId} title={course.title} />
              </CourseInfoTile>
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  );
}
