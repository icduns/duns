import React from 'react';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Layout } from 'antd';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import logo from '~/assets/logo.png';
import { HeaderActions } from '~/components/Header/HeaderActions';
import styles from './Header.module.less';

const { Header: AntdHeader } = Layout;

export function Header() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <AntdHeader className={styles.header}>
      <Link to="/">
        <img className={styles.header__logo} src={logo} alt="DUN" />
      </Link>
      <span>
        <Button type="primary" onClick={() => navigate('create-account')}>
          {t('log_in')}
        </Button>
        <HeaderActions>
          <Avatar icon={<UserOutlined />} />
        </HeaderActions>
      </span>
    </AntdHeader>
  );
}
