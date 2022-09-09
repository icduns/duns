import { PropsWithChildren } from 'react';
import { Empty, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export function CoursesPlaceholder(props: PropsWithChildren) {
  const { children } = props;
  const { t } = useTranslation();
  const description = <Text>{t('courses.course_placeholder')}</Text>;

  return (
    <Empty
      image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
      description={description}
    >
      {children}
    </Empty>
  );
}
