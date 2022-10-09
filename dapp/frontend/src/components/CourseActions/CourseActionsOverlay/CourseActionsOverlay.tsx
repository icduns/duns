import { useEffect, useMemo, useState } from 'react';
import {
  DeleteOutlined,
  EditOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Menu, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';

export type CourseActionsOverlayProps = {
  hiddenKeys?: Array<string>;
  onAction: (e: string) => void;
};
export function CourseActionsOverlay(props: CourseActionsOverlayProps) {
  const { onAction, hiddenKeys } = props;
  const { t } = useTranslation();

  const [items, setItems] = useState<MenuProps['items']>();

  const onClick: MenuProps['onClick'] = ({ key }) => onAction(key);

  const defaultItems: MenuProps['items'] = useMemo(
    () => [
      {
        icon: <EditOutlined />,
        label: t('courses.edit_course_info'),
        key: 'edit',
      },
      {
        icon: <UploadOutlined />,
        label: t('courses.publish_course'),
        key: 'publish',
      },
      { type: 'divider' },
      {
        icon: <DeleteOutlined />,
        label: t('courses.delete_course'),
        key: 'delete',
      },
    ],
    [t],
  );

  useEffect(() => {
    const res = hiddenKeys?.length
      ? defaultItems.filter(
          (item) => item && !hiddenKeys.includes(item.key as string),
        )
      : defaultItems;
    setItems(res);
  }, [defaultItems, hiddenKeys]);

  return <Menu selectable={false} items={items} onClick={onClick} />;
}
