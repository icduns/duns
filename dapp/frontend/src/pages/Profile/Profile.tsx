import { useCallback, useContext, useEffect, useState } from 'react';
import { Button, Checkbox, Divider, Form, Input, Typography } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useTranslation } from 'react-i18next';
import { call, User } from '~/api';
import { ProfilePhoto } from '~/components/ProfilePhoto';
import { convertUserRequestToForm } from '~/pages/Profile/Profile.utils';
import { AuthContext } from '~/providers/AuthProvider';
import {
  FormValue,
  profileRequestConverter,
} from '~/utils/profileRequestConverter';

const { Title } = Typography;
const { Item } = Form;
const { TextArea } = Input;

export function Profile() {
  const { t } = useTranslation();
  const [form] = useForm<FormValue>();
  const { setUser: setUserContext } = useContext(AuthContext);

  const [hasRoleTutor, setHasRoleTutor] = useState(false);
  const [enableSave, setEnableSave] = useState(false);
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    call('getUser').then(setUser);
  }, [form]);

  const handleValuesChange = useCallback(
    (changedValues: Partial<FormValue>, values: FormValue) =>
      setEnableSave(!!(values.firstName && values.lastName)),
    [setEnableSave],
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    convertUserRequestToForm(user).then((res) => {
      const hasRoleTutorInner = user.roles.includes('TUTOR');
      setHasRoleTutor(hasRoleTutorInner);
      form.setFieldsValue({ ...res, isTutor: hasRoleTutorInner });
    });
  }, [form, user]);

  const handleSave = useCallback(async () => {
    setLoading(true);
    const params = await profileRequestConverter(form.getFieldsValue());
    const res = await call('updateUserProfile', params);
    setUser(res);
    if (setUserContext) {
      setUserContext(res);
    }
    setLoading(false);
  }, [form, setUserContext]);

  return (
    <>
      <Title level={3}>{t('profile')}</Title>
      <Form
        layout="vertical"
        colon={false}
        form={form}
        onValuesChange={handleValuesChange}
      >
        <Item label={t('first_name')} name="firstName" required>
          <Input placeholder={t('first_name')} />
        </Item>
        <Item label={t('last_name')} name="lastName" required>
          <Input placeholder={t('last_name')} />
        </Item>
        <Item name="email" label={t('email')}>
          <Input placeholder={t('email')} type="email" />
        </Item>
        <Item name="aboutMe" label={t('about_me')}>
          <TextArea rows={4} placeholder={t('about_me')} />
        </Item>
        <Divider />
        <Item name="photo" label={t('profile_photo')}>
          <ProfilePhoto />
        </Item>
        <Divider />
        <Item
          name="isTutor"
          valuePropName="checked"
          label={t('create_courses_confirmation')}
        >
          <Checkbox disabled={hasRoleTutor}>{t('tutor_confirm')}</Checkbox>
        </Item>
      </Form>
      <Button
        type="primary"
        disabled={!enableSave}
        onClick={handleSave}
        loading={loading}
      >
        {t('save')}
      </Button>
    </>
  );
}
