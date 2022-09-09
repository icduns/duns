import React from 'react';
import { Empty } from 'antd';
import styles from './NotFound.module.less';

export function NotFound() {
  return (
    <div className={styles.not_found}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Page not found"
      />
    </div>
  );
}
