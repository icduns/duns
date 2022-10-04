import React from 'react';
import { Col, Row, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Course } from '~/api';
import { CourseField } from '~/components/CourseField';
import { CourseImage } from '~/components/CourseImage';
import { useCourseLevel } from '~/hooks/useCourseLevel';
import styles from './CourseInfo.module.less';

const { Paragraph, Text } = Typography;

export type CourseInfoProps = {
  course: Course;
};

export function CourseInfo({ course }: CourseInfoProps) {
  const { t } = useTranslation();
  const level = useCourseLevel(course.level);

  return (
    <Col span={24} className={styles.courseInfo}>
      <Row gutter={[16, 0]}>
        <Col xs={24} md={12} xl={10}>
          <CourseField title={t('courses.description')}>
            <Paragraph
              type="secondary"
              className={styles.courseInfo_description}
            >
              {course.description}
            </Paragraph>
          </CourseField>
        </Col>
        <Col xs={24} md={12} xl={14}>
          <Row gutter={[0, 16]}>
            <Col span={24}>
              <CourseField title={t('courses.categories')}>
                <div>
                  {course.categories.map((category) => (
                    <Tag key={category}>{category}</Tag>
                  ))}
                </div>
              </CourseField>
            </Col>
            <Col span={24}>
              <CourseField title={t('courses.level')}>
                <Text type="secondary">{level}</Text>
              </CourseField>
            </Col>
            <Col span={24}>
              <CourseField title={t('courses.image')}>
                <CourseImage imageId={course.imageId} title={course.title} />
              </CourseField>
            </Col>
          </Row>
        </Col>
      </Row>
    </Col>
  );
}
