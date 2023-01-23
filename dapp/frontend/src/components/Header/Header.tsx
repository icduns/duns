import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout, Menu, MenuProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Usergeek } from 'usergeek-ic-js';
import { call, setIdentity } from '~/api';
import logo from '~/assets/logo.png';
import { HeaderActions } from '~/components/Header/HeaderActions';
import { Role } from '~/enums/role';
import { getFile } from '~/files-api';
import { useIdentityProvider } from '~/hooks/useIdentityProvider';
import { useObjectUrl } from '~/hooks/useObjectUrl';
import { AuthContext } from '~/providers/AuthProvider';
import styles from './Header.module.less';

const { Header: AntdHeader } = Layout;

Usergeek.init({
  apiKey: "018B0201738E8C6C468E9132FED1C069",
  host: "https://hba4l-mqaaa-aaaam-aarwq-cai.ic0.app/"
});

export function Header() {
  const { t } = useTranslation();
  const [profilePhoto, setProfilePhoto] = useState<File | undefined>();
  const fileUrl = useObjectUrl(profilePhoto);
  const { authClient, isAuthenticated, checkAuthentication, user, setUser } =
    useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const identityProvider = useIdentityProvider();
  const [selectedKeys, setSelectedKeys] = useState<MenuProps['selectedKeys']>();

  useEffect(() => {
    const res = location.pathname.split('/')[1];
    switch (res) {
      case '':
        setSelectedKeys(['explore']);
        break;
      case 'teacher-dashboard':
      case 'my-learning':
        setSelectedKeys([res]);
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
      identityProvider,
    });
  }, [authClient, checkAuthentication, identityProvider, navigate, setUser]);

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
      ...(user?.roles.includes(Role.Tutor)
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
      ...(user
        ? [
            {
              label: (
                <Link to="/my-learning">{t('courses.my_learning.title')}</Link>
              ),
              key: 'my-learning',
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
