import { useCallback } from 'react';
import { CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { notification } from 'antd';
import { ArgsProps } from 'antd/es/notification';
import { v4 as uuidV4 } from 'uuid';
import styles from './useNotification.module.less';

type OpenNotificationProps = ArgsProps & {
  state: 'inProgress' | 'finished';
};
export function useNotification() {
  const open = useCallback((props: OpenNotificationProps) => {
    const { state, key: keyProp, ...restProps } = props;
    const key = keyProp || uuidV4();
    notification.open({
      ...restProps,
      key,
      placement: 'bottomLeft',
      duration: null,
      icon:
        state === 'inProgress' ? (
          <LoadingOutlined
            className={styles.useNotification_icon__inProgress}
          />
        ) : (
          <CheckCircleOutlined
            className={styles.useNotification_icon__finished}
          />
        ),
      style: { marginLeft: '24px' },
    });

    return key;
  }, []);

  return { open };
}
