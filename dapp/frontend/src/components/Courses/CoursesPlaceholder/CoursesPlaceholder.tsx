import { PropsWithChildren, useMemo } from 'react';
import { Empty, Typography } from 'antd';

const { Text } = Typography;

export type CoursesPlaceholderProps = PropsWithChildren<{
  text?: string;
}>;
export function CoursesPlaceholder(props: CoursesPlaceholderProps) {
  const { children, text } = props;

  const description = useMemo(
    () => (text ? <Text>{text}</Text> : undefined),
    [text],
  );

  return (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      description={description}
    >
      {children}
    </Empty>
  );
}
