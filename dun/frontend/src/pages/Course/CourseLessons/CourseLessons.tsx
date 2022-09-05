import React from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Col, Row, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { Lesson } from '~/api';
import { CourseLesson } from '~/pages/Course/CourseLesson';
import { CourseLessonsPlaceholder } from '~/pages/Course/CourseLessons/CourseLessonsPlaceholder';

const { Title } = Typography;

export type CourseLessonsProps = {
  lessons: Array<Lesson> | undefined;
  className?: string;
};

export function CourseLessons({ lessons, className }: CourseLessonsProps) {
  const { t } = useTranslation();

  return (
    <Col className={className} span={24}>
      <Row justify="space-between">
        <Col>
          <Title level={3}>{t('lessons.title')}</Title>
        </Col>
        <Col>
          <Button type="text" icon={<PlusOutlined />} color="primary">
            {t('lessons.new_lesson')}
          </Button>
        </Col>
      </Row>

      {lessons &&
        (lessons.length ? (
          <>
            {lessons.map((lesson) => (
              <CourseLesson key={lesson.id} lesson={lesson}>
                <Button type="text" shape="circle">
                  <EditOutlined />
                </Button>
                <Button type="text" shape="circle">
                  <DeleteOutlined />
                </Button>
              </CourseLesson>
            ))}
          </>
        ) : (
          <CourseLessonsPlaceholder>
            <Button type="primary">{t('lessons.new_lesson')}</Button>
          </CourseLessonsPlaceholder>
        ))}
    </Col>
  );
}
