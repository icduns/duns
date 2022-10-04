import { useCallback, useState } from 'react';
import { Button, Space, Steps, Typography } from 'antd';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import {
  CreateAccountForm,
  CreateAccountFormProps,
} from '~/pages/CreateAccount/CreateAccountForm';
import styles from './CreateAccountContainer.module.less';

const { Title } = Typography;
const { Step } = Steps;

export function CreateAccountContainer() {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [value, setValue] = useState<Record<string, any>>();
  const [disabled, setDisabled] = useState(true);

  const handleBack = useCallback(
    () => setCurrentStep((prevState) => prevState - 1),
    [],
  );
  const handleNext = useCallback(
    () => setCurrentStep((prevState) => prevState + 1),
    [],
  );
  const handleChange: CreateAccountFormProps['onChange'] = useCallback((e) => {
    setDisabled(!e.firstName || !e.lastName);
    setValue(e);
  }, []);

  return (
    <div className={styles.createAccountContainer}>
      <Space
        direction="vertical"
        size={48}
        className={styles.createAccountContainer_formWrapper}
      >
        <Title level={2}>{t('create_account.title')}</Title>
        <Steps current={currentStep} responsive={false}>
          <Step />
          <Step />
          <Step />
        </Steps>
        <CreateAccountForm currentStep={currentStep} onChange={handleChange} />
        <div
          className={classNames(
            styles.createAccountContainer_formWrapper_buttons,
            {
              [styles.createAccountContainer_formWrapper_buttons__firstStep]:
                currentStep === 0,
            },
          )}
        >
          {currentStep > 0 && <Button onClick={handleBack}>{t('back')}</Button>}
          <Button
            type={currentStep === 2 ? 'primary' : 'default'}
            onClick={handleNext}
            disabled={disabled}
          >
            {currentStep === 2 ? t('create_account.title') : t('continue')}
          </Button>
        </div>
      </Space>
    </div>
  );
}
