import React, { PropsWithChildren } from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

type CourseFieldProps = PropsWithChildren<{ title: string }>;
export function CourseField(props: CourseFieldProps) {
  const { title, children } = props;

  return (
    <div>
      <Title level={5}>{title}</Title>
      {children}
    </div>
  );
}
