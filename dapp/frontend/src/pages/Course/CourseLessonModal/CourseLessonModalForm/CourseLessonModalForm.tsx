import { useCallback, useEffect } from 'react';
import { Form, Input } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { useTranslation } from 'react-i18next';
import { CreateLessonRequest, UpdateLessonRequest } from '~/api';
import { CourseLessonModalProps } from '~/pages/Course/CourseLessonModal';

const { Item } = Form;

type CourseLessonModalFormProps = Pick<
  CourseLessonModalProps,
  'data' | 'type'
> & { onValuesChange: (e: CourseLessonModalFormValue) => void };

export type CourseLessonModalFormValue =
  | CreateLessonRequest
  | UpdateLessonRequest;
export function CourseLessonModalForm(props: CourseLessonModalFormProps) {
  const { type, data, onValuesChange: onValuesChangeProp } = props;
  const [form] = useForm<CourseLessonModalFormValue>();
  const { t } = useTranslation();

  const onValuesChange = useCallback(
    (
      i: Partial<CourseLessonModalFormValue>,
      values: CourseLessonModalFormValue,
    ) => onValuesChangeProp(values),
    [onValuesChangeProp],
  );

  useEffect(() => {
    if (type === 'create') {
      form.setFieldValue('blocks', []);
      return;
    }
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
      <Item name="blocks" hidden>
        <Input />
      </Item>
      <Item required label={t('Title')} name="title">
        <Input placeholder={t('Title')} />
      </Item>
    </Form>
  );
}
