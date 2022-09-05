import { PropsWithChildren } from 'react';
import { Empty, Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';

const { Text } = Typography;

export function CourseLessonsPlaceholder(props: PropsWithChildren) {
  const { children } = props;
  const { t } = useTranslation();

  const description = (
    <Space direction="vertical">
      <Text strong>{t('lessons.placeholder_title')}</Text>
      <Text type="secondary">{t('lessons.placeholder_description')}</Text>
    </Space>
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
