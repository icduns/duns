import { Col, Row } from 'antd';
import { CreateAccountBanner } from '~/pages/CreateAccount/CreateAccountBanner';
import { CreateAccountContainer } from '~/pages/CreateAccount/CreateAccountContainer';
import styles from './CreateAccount.module.less';

export default function CreateAccount() {
  return (
    <Row className={styles.createAccount}>
      <Col xs={24} lg={12} xl={8}>
        <CreateAccountBanner />
      </Col>
      <Col xs={24} lg={12} xl={16}>
        <CreateAccountContainer />
      </Col>
    </Row>
  );
}
