import { CSSProperties } from 'react';
import { Space, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import background from '~/assets/background.png';
import icBanner from '~/assets/ic_banner.png';
import logo from '~/assets/logo.png';
import styles from './CreateAccountBanner.module.less';

const { Title, Text } = Typography;
// FIXME: workaround for issue less-loader + css modules (https://github.com/webpack-contrib/less-loader/issues/109)
const style: CSSProperties = {
  background: `url(${background}) left top/cover`,
};
export function CreateAccountBanner() {
  const { t } = useTranslation();

  return (
    <div className={styles.createAccountBanner} style={style}>
      <Space
        className={styles.createAccountBanner_description}
        direction="vertical"
      >
        <Title level={3}>{t('banner.welcome_to')}</Title>
        <Title level={2}>{t('banner.decentralized_universities')}</Title>
        <div className={styles.createAccountBanner_description_logoContainer}>
          <img src={logo} alt="DUN" />
        </div>
        <Text className={styles.createAccountBanner_description_text}>
          {t('banner.description')}
        </Text>
      </Space>
      <img
        className={styles.createAccountBanner_icBanner}
        src={icBanner}
        alt="IC"
      />
    </div>
  );
}
