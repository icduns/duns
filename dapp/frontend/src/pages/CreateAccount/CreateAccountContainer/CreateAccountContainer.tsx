import { useCallback, useState } from 'react';
import { Button, Space, Steps, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { call, UpdateUserProfileRequest } from '~/api';
import { uploadFile } from '~/files-api';
import {
  CreateAccountForm,
  CreateAccountFormProps,
} from '~/pages/CreateAccount/CreateAccountForm';
import {
  FormValue,
  profileRequestConverter,
} from '~/utils/profileRequestConverter';
import styles from './CreateAccountContainer.module.less';

const { Title } = Typography;
const { Step } = Steps;

export function CreateAccountContainer() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(0);
  const [formValue, setFormValue] = useState<Partial<FormValue>>();
  const [disabled, setDisabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [form] = useForm<FormValue>();

  const handleBack = useCallback(
    () => setCurrentStep((prevState) => prevState - 1),
    [],
  );
  const handleNext = useCallback(() => {
    const value: FormValue = { ...form.getFieldsValue(), ...formValue };
    if (currentStep === 2 && formValue) {
      let convertedValue: UpdateUserProfileRequest;
      setLoading(true);
      profileRequestConverter(value, true)
        .then((res) => {
          convertedValue = res;
          const { isTutor, lastName, firstName } = res;
          return call('registerUser', { isTutor, lastName, firstName });
        })
        .then(() =>
          value.photo ? uploadFile(value.photo) : Promise.resolve(undefined),
        )
        .then((fileId) => {
          const imageId: UpdateUserProfileRequest['imageId'] = fileId
            ? [fileId]
            : [];
          return call('updateUserProfile', { ...convertedValue, imageId });
        })
        .then(() => navigate('/'))
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
      return;
    }

    setFormValue(value);
    setCurrentStep((prevState) => prevState + 1);
  }, [currentStep, form, formValue, navigate]);
  const handleChange: CreateAccountFormProps['onChange'] = useCallback((e) => {
    setDisabled(!e.firstName || !e.lastName);
    setFormValue(e);
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
        <CreateAccountForm
          form={form}
          currentStep={currentStep}
          onChange={handleChange}
        />
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
            loading={loading}
          >
            {currentStep === 2 ? t('create_account.title') : t('continue')}
          </Button>
        </div>
      </Space>
    </div>
  );
}
