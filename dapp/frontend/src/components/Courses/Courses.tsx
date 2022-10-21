import { ReactNode } from 'react';
import { Col, Row, Spin, Tabs, TabsProps } from 'antd';
import { Gutter } from 'antd/es/grid/row';
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
  enableCourseInfo?: CourseCardProps['enableCourseInfo'];
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
    onTabChange,
    enableCourseInfo,
    onUpdate,
    loading,
  } = props;

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
                        course={course}
                        enableCourseInfo={Boolean(enableCourseInfo)}
                        onOpenCourseInfo={onOpenCourseInfo}
                      >
                        {!enableCourseInfo && (
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
