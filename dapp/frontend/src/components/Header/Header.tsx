import React from 'react';
import { Layout } from 'antd';
import { Link } from 'react-router-dom';
import logo from '~/assets/logo.png';
import styles from './Header.module.less';

const { Header: AntdHeader } = Layout;

export function Header() {
  return (
    <AntdHeader className={styles.header}>
      <Link to="/">
        <img className={styles.header__logo} src={logo} alt="DUN" />
      </Link>
    </AntdHeader>
  );
}
