import { useEffect, useState } from 'react';
import { Button, Drawer, DrawerProps, Space, Tag, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { call, Course } from '~/api';
import { CourseField } from '~/components/CourseField';
import { useCourseLevel } from '~/hooks/useCourseLevel';
import { truncateText } from '~/utils/truncateText';
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

  useEffect(() => {
    if (!course?.id || isCourseProgress) {
      return;
    }
    call('getLessonTitlesByCourse', course.id).then(setLessonsTitle);
  }, [course, isCourseProgress]);

  const handleStartCourse = () => navigate(`course/${course?.id}/progress`);

  return (
    <Drawer
      {...restProps}
      bodyStyle={bodyStyle}
      onClose={onClose}
      title={
        course ? (
          <Title className={styles.courseDrawer_title} level={3}>
            {truncateText(course?.title)}
          </Title>
        ) : undefined
      }
      mask={false}
      width={613}
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
                <Button type="primary" onClick={handleStartCourse}>
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
