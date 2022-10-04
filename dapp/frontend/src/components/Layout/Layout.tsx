import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Layout as AntdLayout } from 'antd';
import classNames from 'classnames';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '../Header';
import styles from './Layout.module.less';

const { Content } = AntdLayout;
const PROFILE_PATH = '/profile';

export type LayoutProps = PropsWithChildren;

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [narrow, setNarrow] = useState(false);

  useEffect(() => setNarrow(location.pathname === PROFILE_PATH), [location]);

  return (
    <AntdLayout className={styles.layout}>
      <Header />
      <Content className={styles.layout_content}>
        <div
          className={classNames(
            styles.layout_content_wrapper,
            narrow && styles.layout_content_wrapper__narrow,
          )}
        >
          {children || <Outlet />}
        </div>
      </Content>
    </AntdLayout>
  );
}
