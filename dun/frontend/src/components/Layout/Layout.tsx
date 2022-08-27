import React, { PropsWithChildren } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import styles from './Layout.module.less';

export type LayoutProps = PropsWithChildren & {};

export function Layout({ children }: LayoutProps) {
  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.layout__main}>
        <div className={styles.layout__main_content}>
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
}
