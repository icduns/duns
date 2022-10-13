import { useCallback, useEffect, useState } from 'react';
import { Button, Row, Space } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { call, Course as CourseModel, Lesson } from '~/api';
import { CourseActions, CourseActionsProps } from '~/components/CourseActions';
import { CourseHeader } from './CourseHeader';
import { CourseInfo } from './CourseInfo';
import { CourseLessons, CourseLessonsProps } from './CourseLessons';

export function Course() {
  const { id: courseId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [shouldGetCourse, setShouldGetCourse] = useState(true);
  const [shouldGetCourseLesson, setShouldGetCourseLessons] = useState(true);
  const [course, setCourse] = useState<CourseModel | undefined>();
  const [lessons, setLessons] = useState<Array<Lesson> | undefined>();
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (shouldGetCourse && courseId) {
      setShouldGetCourse(false);
      call('getCourseForTutor', courseId).then(setCourse);
    }
  }, [courseId, shouldGetCourse]);

  useEffect(() => {
    if (shouldGetCourseLesson && courseId) {
      setShouldGetCourseLessons(false);
      call('getLessonsForTutor', courseId).then(setLessons);
    }
  }, [courseId, shouldGetCourse, shouldGetCourseLesson]);

  const handleCourseAction = useCallback<
    Required<CourseActionsProps>['onAction']
  >(
    (e) => {
      if (e === 'delete') {
        navigate('/');
      } else if (e === 'edit') {
        setShouldGetCourse(true);
      }
    },
    [navigate],
  );
  const handleCourseLessonAction: CourseLessonsProps['onAction'] = useCallback(
    () => setShouldGetCourseLessons(true),
    [],
  );
  const handlePublish = useCallback(() => {
    if (courseId) {
      setPublishing(true);
      call('publishCourse', courseId)
        .then(setCourse)
        .finally(() => setPublishing(false));
    }
  }, [courseId]);

  if (!course) return null;

  return (
    <Row gutter={[0, 16]}>
      <CourseHeader course={course}>
        <Space>
          {!course.published && (
            <Button
              disabled={!lessons?.length}
              onClick={handlePublish}
              loading={publishing}
            >
              {t('courses.publish_course')}
            </Button>
          )}
          <CourseActions course={course} onAction={handleCourseAction} />
        </Space>
      </CourseHeader>
      <CourseInfo course={course} />
      {courseId && (
        <CourseLessons
          courseId={courseId}
          lessons={lessons}
          onAction={handleCourseLessonAction}
        />
      )}
    </Row>
  );
}
