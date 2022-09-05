import React, { useCallback, useEffect, useState } from 'react';
import { Button, Row, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { call, Course as CourseModel } from '~/api';
import { CourseActions, CourseActionsProps } from '~/components/CourseActions';
import { useActorCall } from '~/hooks/useActorCall';
import { CourseHeader } from './CourseHeader';
import { CourseInfo } from './CourseInfo';
import { CourseLessons } from './CourseLessons';

export function Course() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [shouldGetCourse, setShouldGetCourse] = useState(true);
  const [course, setCourse] = useState<CourseModel | undefined>();

  const [lessons] = useActorCall('getLessonsByCourse', course?.id);

  useEffect(() => {
    if (shouldGetCourse && courseId) {
      setShouldGetCourse(false);
      call('getCourse', courseId).then(setCourse);
    }
  }, [courseId, shouldGetCourse]);

  const handleAction: CourseActionsProps['onAction'] = useCallback(
    (e) => {
      if (e === 'delete') {
        navigate('/');
      } else if (e === 'edit') {
        setShouldGetCourse(true);
      }
    },
    [navigate],
  );

  if (!course) return null;

  return (
    <Row gutter={[0, 16]}>
      <CourseHeader course={course}>
        <Space>
          <Button disabled={!lessons?.length}>
            {t('courses.publish_course')}
          </Button>
          <CourseActions course={course} onAction={handleAction} />
        </Space>
      </CourseHeader>
      <CourseInfo course={course} />
      <CourseLessons lessons={lessons} />
    </Row>
  );
}
