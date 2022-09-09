import React, { PropsWithChildren } from 'react';
import { Layout as AntdLayout } from 'antd';
import { Outlet } from 'react-router-dom';
import { Header } from '../Header';
import styles from './Layout.module.less';

const { Content } = AntdLayout;

export type LayoutProps = PropsWithChildren & {};

export function Layout({ children }: LayoutProps) {
  return (
    <AntdLayout className={styles.layout}>
      <Header />
      <Content className={styles.layout_content}>
        <div className={styles.layout_content__wrapper}>
          {children || <Outlet />}
        </div>
      </Content>
    </AntdLayout>
  );
}
