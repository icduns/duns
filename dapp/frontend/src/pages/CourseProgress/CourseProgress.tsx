import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Button, Col, Menu, MenuProps, Row, Typography } from 'antd';
import { ItemType } from 'antd/lib/menu/hooks/useItems';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { call, Course, Lesson } from '~/api';
import { CourseDrawer } from '~/components/CourseDrawer';
import { CourseProgressCurrentLesson } from '~/pages/CourseProgress/CourseProgressCurrentLesson';
import styles from './CourseProgress.module.less';

const { Title } = Typography;

export function CourseProgress() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [course, setCourse] = useState<Course>();
  const [lessons, setLessons] = useState<Array<Lesson>>();
  const [items, setItems] = useState<MenuProps['items']>();
  const [openCourseInfo, setOpenCourseInfo] = useState(false);
  const [currentLesson, setCurrentLesson] = useState<Lesson>();
  const [selectedKeys, setSelectedKeys] = useState<MenuProps['selectedKeys']>();

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

  const title = useMemo(() => {
    if (items) {
      const res = items.find((item) => item?.key === currentLesson?.id);

      return res && 'label' in res ? res.label : '';
    }

    return undefined;
  }, [currentLesson?.id, items]);

  useEffect(() => {
    if (id) {
      call('getCourse', id).then(setCourse);
      call('getLessonsByCourse', id).then((res) => {
        setLessons(res);
        setCurrentLesson(res[0]);
        setSelectedKeys([res[0].id]);
        const mappedItems = res.map<ItemType>((item, index) => ({
          key: item.id,
          label: `${index + 1}. ${item.title}`,
          icon: <CheckCircleOutlined />,
        }));
        setItems(mappedItems);
      });
    }
  }, [id]);

  if (!course) {
    return null;
  }

  return (
    <>
      <Row gutter={[24, 8]}>
        <Col xs={24} lg={8} xl={6}>
          <span className={styles.courseProgress_header}>
            <Title level={3} ellipsis>
              {course.title}
            </Title>
            <Button type="text" shape="circle" onClick={handleOpenCourseInfo}>
              <InfoCircleOutlined />
            </Button>
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
            <CourseProgressCurrentLesson title={title} lesson={currentLesson} />
          )}
        </Col>
      </Row>
      <CourseDrawer
        open={openCourseInfo}
        course={course}
        onClose={() => setOpenCourseInfo(false)}
        isCourseProgress
      />
    </>
  );
}
