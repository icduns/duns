import { ReactNode, useCallback } from 'react';
import { Col, Row, Spin, Tabs, TabsProps } from 'antd';
import { Gutter } from 'antd/es/grid/row';
import { useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { Course } from '~/api';
import { CourseActions } from '~/components/CourseActions';
import { CourseCard, CourseCardProps } from '~/components/CourseCard';
import styles from './Courses.module.less';

const gridGutter: [Gutter, Gutter] = [24, 24];
const containerGutter: [Gutter, Gutter] = [0, 16];

export type CoursesProps = {
  header: ReactNode;
  placeholder: ReactNode;
  courses?: Array<Course>;
  enableActions?: boolean;
  onOpenCourseInfo?: CourseCardProps['onOpenCourseInfo'];
  tabs?: TabsProps['items'];
  onTabChange?: TabsProps['onChange'];
  onUpdate?: () => void;
  loading?: boolean;
};
export function Courses(props: CoursesProps) {
  const {
    courses,
    header,
    placeholder,
    onOpenCourseInfo,
    tabs,
    enableActions,
    onTabChange,
    onUpdate,
    loading,
  } = props;

  const { pathname } = useLocation();

  const createLink = useCallback(
    (course: Course) => {
      switch (pathname) {
        case '/teacher-dashboard':
          return `/course/${course.id}`;
        case '/my-learning':
          return `/course/${course.id}/progress`;
      }
    },
    [pathname],
  );

  if (!courses) {
    return (
      <div className={styles.courses_spinContainer}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <Row gutter={containerGutter}>
      <Col span={24}>{header}</Col>
      <Col span={24}>
        {Boolean(tabs?.length) && <Tabs items={tabs} onChange={onTabChange} />}
        <Spin spinning={Boolean(loading)}>
          {courses.length ? (
            <Row gutter={gridGutter}>
              <TransitionGroup component={null}>
                {courses.map((course, index) => (
                  <CSSTransition
                    key={course.id}
                    classNames={{
                      appear: styles.courses_item__appear,
                      appearActive: styles.courses_item__active,
                    }}
                    timeout={index * 200}
                    appear
                  >
                    <Col>
                      <CourseCard
                        link={createLink(course)}
                        course={course}
                        onOpenCourseInfo={onOpenCourseInfo}
                      >
                        {enableActions && (
                          <CourseActions course={course} onAction={onUpdate} />
                        )}
                      </CourseCard>
                    </Col>
                  </CSSTransition>
                ))}
              </TransitionGroup>
            </Row>
          ) : (
            placeholder
          )}
        </Spin>
      </Col>
    </Row>
  );
}
