import React from 'react';
import { Link } from 'react-router-dom';
import logo from '~/assets/logo.png';
import styles from './Header.module.less';

export function Header() {
  return (
    <div className={styles.header}>
      <Link to="/">
        <img className={styles.header__logo} src={logo} alt="DUN" />
      </Link>
    </div>
  );
}
