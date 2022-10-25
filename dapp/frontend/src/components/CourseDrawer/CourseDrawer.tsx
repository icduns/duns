import { useEffect, useState } from 'react';
import { Button, Drawer, DrawerProps, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { call, Course, CourseProgress } from '~/api';
import { CourseField } from '~/components/CourseField';
import { CourseProgressBadge } from '~/components/CourseProgressBadge';
import { useCourseLevel } from '~/hooks/useCourseLevel';
import styles from './CourseDrawer.module.less';

const { Paragraph, Title, Text } = Typography;
const bodyStyle: DrawerProps['bodyStyle'] = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
};

type CourseDrawerProps = DrawerProps & {
  course?: Course;
  isCourseProgress?: boolean;
  enableStartCourse?: boolean;
};
export function CourseDrawer(props: CourseDrawerProps) {
  const { course, onClose, isCourseProgress, enableStartCourse, ...restProps } =
    props;
  const { t } = useTranslation();
  const navigate = useNavigate();
  const level = useCourseLevel(course?.level);

  const [lessonsTitle, setLessonsTitle] = useState<Array<string>>();
  const [startCourseLoading, setStartCourseLoading] = useState(false);
  const [courseProgress, setCourseProgress] = useState<CourseProgress>();

  useEffect(() => {
    if (!course?.id || isCourseProgress) {
      return;
    }
    call('getLessonTitlesByCourse', course.id).then(setLessonsTitle);
    call('getCourseProgress', course.id)
      .then(setCourseProgress)
      .catch(() => setCourseProgress(undefined));
  }, [course, isCourseProgress]);

  const handleStartCourse = () => {
    if (course?.id) {
      setStartCourseLoading(true);
      call('startCourse', course.id)
        .then(() => navigate(`course/${course.id}/progress`))
        .catch(() => setStartCourseLoading(false));
    }
  };

  return (
    <Drawer
      {...restProps}
      bodyStyle={bodyStyle}
      onClose={onClose}
      title={
        course ? (
          <Space size="large">
            <Title className={styles.courseDrawer_title} level={3} ellipsis>
              {course?.title}
            </Title>
            {courseProgress && (
              <CourseProgressBadge completed={courseProgress.completed} />
            )}
          </Space>
        ) : undefined
      }
      mask={false}
      width={613}
      className={styles.courseDrawer}
    >
      {course && (
        <>
          <Space
            className={styles.courseDrawer_content}
            direction="vertical"
            size={16}
          >
            <CourseField title={t('courses.about')}>
              <Paragraph
                type="secondary"
                className={styles.courseDrawer_content_description}
              >
                {course.description}
              </Paragraph>
            </CourseField>
            <CourseField title={t('courses.categories')}>
              <div>
                {course.categories.map((category) => (
                  <Tag key={category}>{category}</Tag>
                ))}
              </div>
            </CourseField>
            <CourseField title={t('courses.level')}>
              <Text type="secondary">{level}</Text>
            </CourseField>
            {lessonsTitle && (
              <CourseField title={t('courses.content')}>
                <Space
                  className={styles.courseDrawer_content_lessons}
                  direction="vertical"
                  size={12}
                >
                  {lessonsTitle.map((title, index) => (
                    <Text key={index} type="secondary" ellipsis>{`${
                      index + 1
                    }. ${title}`}</Text>
                  ))}
                </Space>
              </CourseField>
            )}
          </Space>
          {!isCourseProgress && (
            <Space className={styles.courseDrawer_buttons} size="middle">
              <Button onClick={onClose}>{t('close')}</Button>
              {enableStartCourse && (
                <Button
                  type="primary"
                  onClick={handleStartCourse}
                  loading={startCourseLoading}
                  disabled={Boolean(courseProgress)}
                >
                  {t('courses.start')}
                </Button>
              )}
            </Space>
          )}
        </>
      )}
    </Drawer>
  );
}
