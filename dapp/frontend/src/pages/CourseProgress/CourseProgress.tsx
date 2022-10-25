import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Menu, MenuProps, Row, Typography } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  call,
  Course,
  Lesson,
  CourseProgress as CourseProgressModel,
} from '~/api';
import { CourseDrawer } from '~/components/CourseDrawer';
import { CourseProgressBadge } from '~/components/CourseProgressBadge';
import { CourseProgressCurrentLesson } from '~/pages/CourseProgress/CourseProgressCurrentLesson';
import styles from './CourseProgress.module.less';

const { Title } = Typography;

export default function CourseProgress() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [course, setCourse] = useState<Course>();
  const [lessons, setLessons] = useState<Array<Lesson>>();
  const [items, setItems] = useState<MenuProps['items']>();
  const [openCourseInfo, setOpenCourseInfo] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson>();
  const [selectedKeys, setSelectedKeys] = useState<MenuProps['selectedKeys']>();
  const [courseProgress, setCourseProgress] = useState<CourseProgressModel>();
  const [proceedingComplete, setProceedingComplete] = useState(false);

  const handleOpenCourseInfo = useCallback(() => setOpenCourseInfo(true), []);
  const handleChangeLesson = useCallback<Required<MenuProps>['onSelect']>(
    (e) => {
      const newLesson = lessons?.find(({ id: lessonId }) => lessonId === e.key);
      if (newLesson) {
        setCurrentLesson(newLesson);
        setSelectedKeys([newLesson.id]);
      }
    },
    [lessons],
  );
  const handleMarkAsCompleted = useCallback(() => {
    if (currentLesson && course) {
      setProceedingComplete(true);
      call('completeLesson', {
        courseId: course.id,
        lessonId: currentLesson.id,
      })
        .then(setCourseProgress)
        .finally(() => setProceedingComplete(false));
    }
  }, [course, currentLesson]);
  const handleCloseDrawer = useCallback(() => setOpenCourseInfo(false), []);

  const title = useMemo(() => {
    if (items) {
      const res = items.find((item) => item?.key === currentLesson?.id);

      return res && 'label' in res ? res.label : '';
    }

    return undefined;
  }, [currentLesson?.id, items]);
  const action = useMemo(() => {
    if (courseProgress && currentLesson) {
      return courseProgress.lessonIds.includes(currentLesson.id) ? (
        <CourseProgressBadge completed />
      ) : (
        <Button
          type="primary"
          loading={proceedingComplete}
          onClick={handleMarkAsCompleted}
        >
          {t('courses.mark_as_completed')}
        </Button>
      );
    }
  }, [
    courseProgress,
    currentLesson,
    handleMarkAsCompleted,
    proceedingComplete,
    t,
  ]);

  useEffect(() => {
    if (id) {
      call('getCourse', id).then(setCourse);
      Promise.all([
        call('getLessonsByCourse', id),
        call('getCourseProgress', id),
      ]).then(([lessonsRes, courseProgressRes]) => {
        const crLesson =
          lessonsRes.find(
            (lesson) => !courseProgressRes.lessonIds.includes(lesson.id),
          ) || lessonsRes[lessonsRes.length - 1];
        setCourseProgress(courseProgressRes);
        setLessons(lessonsRes);
        setCurrentLesson(crLesson);
        setSelectedKeys([crLesson.id]);
      });
    }
  }, [id]);
  useEffect(() => {
    if (lessons && courseProgress) {
      const mappedItems = lessons.map<ItemType>((item, index) => ({
        key: item.id,
        label: `${index + 1}. ${item.title}`,
        icon: (
          <CheckCircleOutlined
            className={classNames({
              [styles.courseProgress_lesson__completed]:
                courseProgress.lessonIds.includes(item.id),
            })}
          />
        ),
      }));
      setItems(mappedItems);
    }
  }, [courseProgress, lessons]);

  if (!course) {
    return null;
  }

  return (
    <>
      <Row gutter={[24, 8]}>
        <Col xs={24} lg={8} xl={6}>
          <span className={styles.courseProgress_header}>
            <span className={styles.courseProgress_header_titleBlock}>
              <Title level={3} ellipsis>
                {course.title}
              </Title>
              <Button
                className={styles.courseProgress_header_titleBlock_infoButton}
                type="text"
                shape="circle"
                onClick={handleOpenCourseInfo}
              >
                <InfoCircleOutlined />
              </Button>
            </span>
            {courseProgress?.completed && <CourseProgressBadge completed />}
          </span>
          <Title level={4}>{t('lessons.title')}</Title>
          <Menu
            selectedKeys={selectedKeys}
            items={items}
            onSelect={handleChangeLesson}
          />
        </Col>
        <Col xs={24} lg={16} xl={18}>
          {currentLesson && (
            <CourseProgressCurrentLesson
              title={title}
              action={action}
              lesson={currentLesson}
            />
          )}
        </Col>
      </Row>
      <CourseDrawer
        open={openCourseInfo}
        course={course}
        onClose={handleCloseDrawer}
        isCourseProgress
      />
    </>
  );
}
