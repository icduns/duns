import { Button, Checkbox, Divider, Form, Input, Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { ProfilePhoto } from '~/components/ProfilePhoto';

const { Title } = Typography;
const { Item } = Form;
const { TextArea } = Input;

export function Profile() {
  const { t } = useTranslation();

  return (
    <>
      <Title level={3}>{t('profile')}</Title>
      <Form layout="vertical" colon={false}>
        <Item label={t('first_name')} name="firstName" required>
          <Input placeholder={t('first_name')} />
        </Item>
        <Item label={t('last_name')} name="lastName" required>
          <Input placeholder={t('last_name')} />
        </Item>
        <Item name="email" label={t('email')}>
          <Input placeholder={t('email')} type="email" />
        </Item>
        <Item name="about" label={t('about_me')}>
          <TextArea rows={4} placeholder={t('about_me')} />
        </Item>
        <Divider />
        <Item name="photo" label={t('profile_photo')}>
          <ProfilePhoto />
        </Item>
        <Divider />
        <Item
          name="tutor"
          valuePropName="checked"
          label={t('create_courses_confirmation')}
        >
          <Checkbox>{t('tutor_confirm')}</Checkbox>
        </Item>
      </Form>
      <Button type="primary">{t('save')}</Button>
    </>
  );
}
