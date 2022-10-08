import {
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { Dropdown, DropdownProps, Menu, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '~/providers/AuthProvider';
import styles from './HeaderActions.module.less';

const dropdownTrigger: DropdownProps['trigger'] = ['click'];
const PROFILE_PATH = '/profile';

type HeaderActionsProps = PropsWithChildren;
export function HeaderActions(props: HeaderActionsProps) {
  const { children } = props;
  const { t } = useTranslation();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>();
  const { logout } = useContext(AuthContext);

  useEffect(
    () =>
      setSelectedKeys(location.pathname === PROFILE_PATH ? ['profile'] : []),
    [location],
  );

  const handleMenuClick = useCallback<Required<MenuProps>['onClick']>(
    (e) => {
      if (e.key === 'logout' && logout) {
        logout();
      }
    },
    [logout],
  );

  const items: MenuProps['items'] = [
    {
      icon: <UserOutlined />,
      label: <Link to="profile">{t('profile')}</Link>,
      key: 'profile',
    },
    { type: 'divider' },
    {
      icon: <LogoutOutlined />,
      label: t('log_out'),
      key: 'logout',
    },
  ];
  return (
    <Dropdown
      overlayClassName={styles.headerActions}
      overlay={
        <Menu
          items={items}
          selectedKeys={selectedKeys}
          onClick={handleMenuClick}
        />
      }
      trigger={dropdownTrigger}
    >
      {children}
    </Dropdown>
  );
}
