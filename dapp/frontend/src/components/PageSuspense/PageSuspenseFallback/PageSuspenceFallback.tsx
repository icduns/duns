import { Spin } from 'antd';
import styles from './PageSuspenseFallback.module.less';

export function PageSuspenseFallback() {
  return (
    <div className={styles.pageSuspenseFallback}>
      <Spin size="large" />
    </div>
  );
}
