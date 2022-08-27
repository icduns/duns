import React from 'react';
import { Tag, Typography } from 'antd';
import cx from 'classnames';
import { Course } from '~/api';
import styles from './CourseHeader.module.less';

export type CourseHeaderProps = {
  course: Course;
  className?: string;
};

export function CourseHeader({ course, className }: CourseHeaderProps) {
  return (
    <div className={cx(className, styles.course_header)}>
      <Typography.Title level={3} style={{ margin: 'unset' }}>
        {course.title}
      </Typography.Title>

      <div className={styles.course_header__status}>
        {course.published ? (
          <Tag color="green">Published</Tag>
        ) : (
          <Tag>Draft</Tag>
        )}
      </div>
    </div>
  );
}
