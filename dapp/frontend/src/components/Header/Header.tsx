import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { call, setIdentity } from '~/api';
import logo from '~/assets/logo.png';
import { HeaderActions } from '~/components/Header/HeaderActions';
import { getFile } from '~/files-api';
import { useObjectUrl } from '~/hooks/useObjectUrl';
import { AuthContext } from '~/providers/AuthProvider';
import styles from './Header.module.less';

const { Header: AntdHeader } = Layout;

export function Header() {
  const { t } = useTranslation();
  const [profilePhoto, setProfilePhoto] = useState<File | undefined>();
  const fileUrl = useObjectUrl(profilePhoto);
  const { authClient, isAuthenticated, checkAuthentication, user, setUser } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedKeys, setSelectedKeys] = useState<MenuProps['selectedKeys']>();

  useEffect(() => {
    switch (location.pathname) {
      case '/':
        setSelectedKeys(['explore']);
        break;
      case '/teacher-dashboard':
        setSelectedKeys(['teacher-dashboard']);
        break;
      default:
        setSelectedKeys([]);
        break;
    }
  }, [location.pathname]);

  const handleLogIn = useCallback(() => {
    authClient?.login({
      onSuccess: () => {
        setIdentity(authClient);
        if (checkAuthentication) {
          call('getUser')
            .then((res) => {
              checkAuthentication();
              if (setUser) {
                setUser(res);
              }
            })
            .catch(() => navigate('create-account'));
        }
      },
      identityProvider:
        // TODO: Handle environment
        `http://${window.location.hostname}:8000?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`,
    });
  }, [authClient, checkAuthentication, navigate, setUser]);

  useEffect(() => {
    if (user?.imageId[0]) {
      getFile(user.imageId[0]).then(setProfilePhoto);
      return;
    }
    setProfilePhoto(undefined);
  }, [user]);

  const actionsRender = useCallback(() => {
    if (isAuthenticated === undefined) {
      return null;
    }
    return isAuthenticated ? (
      <HeaderActions>
        <Avatar
          className={styles.header_avatar}
          icon={fileUrl ? undefined : <UserOutlined />}
          src={fileUrl}
        />
      </HeaderActions>
    ) : (
      <Button type="primary" onClick={handleLogIn}>
        {t('log_in')}
      </Button>
    );
  }, [fileUrl, handleLogIn, isAuthenticated, t]);

  const menuItems = useMemo<MenuProps['items']>(
    () => [
      { label: <Link to="/">{t('courses.explore')}</Link>, key: 'explore' },
      ...(user?.roles.includes('TUTOR')
        ? [
            {
              label: (
                <Link to="/teacher-dashboard">
                  {t('courses.teacher_dashboard')}
                </Link>
              ),
              key: 'teacher-dashboard',
            },
          ]
        : []),
    ],
    [t, user],
  );

  return (
    <AntdHeader className={styles.header}>
      <Link to="/">
        <img className={styles.header__logo} src={logo} alt="DUN" />
      </Link>
      <Menu
        className={styles.header_menu}
        theme="dark"
        mode="horizontal"
        items={menuItems}
        selectedKeys={selectedKeys}
      />
      {actionsRender()}
    </AntdHeader>
  );
}
