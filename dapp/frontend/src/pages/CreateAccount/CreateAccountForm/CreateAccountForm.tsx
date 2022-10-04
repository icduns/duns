import { useCallback, useEffect, useRef, useState } from 'react';
import { Checkbox, Form, FormProps, Input, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { ProfilePhoto } from '~/components/ProfilePhoto';

const { Item } = Form;
const { TextArea } = Input;
const { Title, Text } = Typography;

export type CreateAccountFormProps = {
  currentStep: number;
  onChange: (e: Record<string, any>) => void;
};
export function CreateAccountForm(props: CreateAccountFormProps) {
  const { currentStep, onChange } = props;
  const { t } = useTranslation();
  const [value, setValue] = useState({});

  useEffect(() => onChange(value), [onChange, value]);

  const handleChange = useCallback<
    // @ts-ignore
    FormProps<Record<string, any>>['onValuesChange']
  >((_, e) => setValue((prevState) => ({ ...prevState, ...e })), []);
  const renderFields = useCallback(() => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Item name="firstName" label={t('first_name')} required>
              <Input placeholder={t('first_name')} />
            </Item>
            <Item name="lastName" label={t('last_name')} required>
              <Input placeholder={t('last_name')} />
            </Item>
            <Item name="email" label={t('email')}>
              <Input placeholder={t('email')} type="email" />
            </Item>
          </>
        );
      case 1:
        return (
          <>
            <Item name="photo" label={t('profile_photo')}>
              <ProfilePhoto />
            </Item>
            <Item name="about" label={t('about_me')}>
              <TextArea rows={4} placeholder={t('about_me')} />
            </Item>
          </>
        );
      case 2:
        return (
          <>
            <Item>
              <Title level={4}>{t('create_courses_confirmation')}</Title>
              <Text type="secondary">{t('create_courses_description')}</Text>
            </Item>
            <Item name="tutor" valuePropName="checked">
              <Checkbox>{t('tutor_confirm')}</Checkbox>
            </Item>
          </>
        );
    }
  }, [currentStep, t]);

  return (
    <Form layout="vertical" onValuesChange={handleChange}>
      {renderFields()}
    </Form>
  );
}
