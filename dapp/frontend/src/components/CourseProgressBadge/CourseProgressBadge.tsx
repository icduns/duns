import { CheckCircleOutlined } from '@ant-design/icons';
import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import styles from './CourseProgressBadge.module.less';

const { Text } = Typography;

type CourseProgressBadgeProps = { completed: boolean };
export function CourseProgressBadge(props: CourseProgressBadgeProps) {
  const { completed } = props;

  const { t } = useTranslation();

  return completed ? (
    <Space className={styles.courseProgressBadge__completed}>
      <CheckCircleOutlined />
      <Text>{t('courses.my_learning.completed')}</Text>
    </Space>
  ) : (
    <Space className={styles.courseProgressBadge__inProgress}>
      <CheckCircleOutlined />
      <Text type="warning">{t('courses.my_learning.in_progress')}</Text>
    </Space>
  );
}
