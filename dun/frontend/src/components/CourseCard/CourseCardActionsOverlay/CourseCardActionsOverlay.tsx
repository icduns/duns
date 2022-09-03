import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

export type CourseCardActionsOverlayProps = {
  onAction: (e: string) => void;
};
export function CourseCardActionsOverlay(props: CourseCardActionsOverlayProps) {
  const { onAction } = props;
  const { t } = useTranslation();
  const onClick: MenuProps['onClick'] = ({ key }) => onAction(key);
  const items: MenuProps['items'] = [
    {
      label: (
        <>
          <EditOutlined /> {t('courses.edit_course_info')}
        </>
      ),
      key: 'edit',
    },
    { type: 'divider' },
    {
      label: (
        <>
          <DeleteOutlined /> {t('courses.delete_course')}
        </>
      ),
      key: 'delete',
    },
  ];

  return <Menu selectable={false} items={items} onClick={onClick} />;
}
