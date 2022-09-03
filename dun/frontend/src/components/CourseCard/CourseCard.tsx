import { useCallback } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Card, Dropdown, DropdownProps, Typography } from 'antd';
import { Link } from 'react-router-dom';
import { Course } from '~/api';
import {
  CourseCardActionsOverlay,
  CourseCardActionsOverlayProps,
} from '~/components/CourseCard/CourseCardActionsOverlay';
import styles from './CourseCard.module.less';

const { Title } = Typography;
const dropdownTrigger: DropdownProps['trigger'] = ['click'];

export type CourseCardProps = {
  course: Course;
  onAction: (e: { course: Course; type: string }) => void;
};

export function CourseCard({ course, onAction }: CourseCardProps) {
  const link = `/course/${course.id}`;
  const handleAction: CourseCardActionsOverlayProps['onAction'] = useCallback(
    (type) => onAction({ course, type }),
    [course, onAction],
  );

  return (
    <Card
      className={styles.courseCard}
      hoverable
      cover={
        <Link to={link}>
          <img
            width="320"
            height="160"
            alt="example"
            src="https://os.alipayobjects.com/rmsportal/QBnOOoLaAfKPirc.png"
          />
        </Link>
      }
    >
      <div className={styles.courseCard__body}>
        <Title level={5} ellipsis>
          {course.title}
        </Title>
        <Dropdown
          overlay={<CourseCardActionsOverlay onAction={handleAction} />}
          trigger={dropdownTrigger}
        >
          <Button icon={<MoreOutlined />} size="small" type="text" />
        </Dropdown>
      </div>
    </Card>
  );
}
