import { useEffect } from 'react';
import { Form, Input } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useTranslation } from 'react-i18next';
import { CourseModalProps } from '~/components/CourseModal';
import {
  CreateCourseRequest,
  UpdateCourseRequest,
} from '../../../../../../declarations/dun_backend/dun_backend.did';

const { Item } = Form;
const { TextArea } = Input;

export type CourseModalFormValue = CreateCourseRequest | UpdateCourseRequest;
type CourseModalFormProps = Pick<CourseModalProps, 'type' | 'data'> & {
  onValuesChange: (e: CourseModalFormValue) => void;
};

export function CourseModalForm(props: CourseModalFormProps) {
  const { type, data, onValuesChange: onValuesChangeProp } = props;
  const [form] = useForm<CourseModalFormValue>();
  const { t } = useTranslation();
  const onValuesChange = (
    i: Partial<CourseModalFormValue>,
    values: CourseModalFormValue,
  ) => {
    onValuesChangeProp(values);
  };

  useEffect(() => {
    if (type === 'edit' && data) {
      form.setFieldsValue({ ...data });
    }
  }, [data, form, type]);

  return (
    <Form
      form={form}
      layout="vertical"
      onValuesChange={onValuesChange}
      preserve={false}
    >
      {type === 'edit' && (
        <Item name="id" hidden>
          <Input />
        </Item>
      )}
      <Item required label={t('Title')} name="title">
        <Input placeholder={t('Title')} />
      </Item>
      <Item required label={t('Description')} name="description">
        <TextArea placeholder={t('Description')} />
      </Item>
    </Form>
  );
}
