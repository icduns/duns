import { useCallback, useContext, useEffect, useState } from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
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
        'http://localhost:8000?canisterId=rkp4c-7iaaa-aaaaa-aaaca-cai',
    });
  }, [authClient, checkAuthentication, navigate, setUser]);

  useEffect(() => {
    if (user) {
      const { profile } = user;
      if (profile.imageId[0]) {
        getFile(profile.imageId[0]).then(setProfilePhoto);
        return;
      }
    }
    setProfilePhoto(undefined);
  }, [user]);

  const actionsRender = useCallback(() => {
    if (isAuthenticated === undefined) {
      return null;
    }
    return isAuthenticated ? (
      <HeaderActions>
        <Avatar icon={fileUrl ? undefined : <UserOutlined />} src={fileUrl} />
      </HeaderActions>
    ) : (
      <Button type="primary" onClick={handleLogIn}>
        {t('log_in')}
      </Button>
    );
  }, [fileUrl, handleLogIn, isAuthenticated, t]);

  return (
    <AntdHeader className={styles.header}>
      <Link to="/">
        <img className={styles.header__logo} src={logo} alt="DUN" />
      </Link>
      {actionsRender()}
    </AntdHeader>
  );
}
