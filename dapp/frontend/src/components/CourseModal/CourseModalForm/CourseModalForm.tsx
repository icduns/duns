import { useCallback, useEffect, useMemo, useState } from 'react';
import { Form, Input, Select, SelectProps } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useTranslation } from 'react-i18next';
import { call, CreateCourseRequest, UpdateCourseRequest } from '~/api';
import { CourseModalProps } from '~/components/CourseModal';
import { CourseModalFormLevelSelect } from '~/components/CourseModal/CourseModalForm/CourseModalFormLevelSelect';
import { FilePicker } from '~/components/FilePicker';
import { getFile } from '~/files-api';

const { Item } = Form;
const { TextArea } = Input;

export type CourseModalFormValue = (
  | CreateCourseRequest
  | UpdateCourseRequest
) & {
  image: File;
};

type CourseModalFormProps = Pick<CourseModalProps, 'type' | 'data'> & {
  onValuesChange: (e: CourseModalFormValue) => void;
};

export function CourseModalForm(props: CourseModalFormProps) {
  const { type, data, onValuesChange: onValuesChangeProp } = props;
  const [form] = useForm<CourseModalFormValue>();
  const { t } = useTranslation();

  const [categories, setCategories] = useState<SelectProps['options']>();

  const levels = useMemo<SelectProps['options']>(
    () => [
      {
        label: t('courses.level_beginner'),
        value: 'beginner',
      },
      {
        label: t('courses.level_intermediate'),
        value: 'intermediate',
      },
      {
        label: t('courses.level_advanced'),
        value: 'advanced',
      },
      {
        label: t('courses.level_all'),
        value: 'all',
      },
    ],
    [t],
  );

  const onValuesChange = useCallback(
    (i: Partial<CourseModalFormValue>, values: CourseModalFormValue) =>
      onValuesChangeProp(values),
    [onValuesChangeProp],
  );

  useEffect(() => {
    if (type === 'edit' && data) {
      getFile(data.imageId).then((image) => {
        const { imageId, ...restData } = data;
        form.setFieldsValue({ ...restData, image });
      });
    }
  }, [data, form, type]);

  useEffect(() => {
    call('getAllCourseCategories').then((res) =>
      setCategories(res.map((item) => ({ label: item, value: item }))),
    );
  }, []);

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
      <Item required label={t('courses.categories')} name="categories">
        <Select
          mode="tags"
          placeholder="Add or select categories"
          showArrow
          options={categories}
        />
      </Item>
      <Item required label={t('courses.level')} name="level">
        <CourseModalFormLevelSelect
          placeholder="Select level"
          showArrow
          options={levels}
        />
      </Item>
      <Item required label={t('Description')} name="description">
        <TextArea placeholder={t('Description')} rows={4} />
      </Item>
      <Item required label={t('courses.image')} name="image">
        <FilePicker accept="image/*" />
      </Item>
    </Form>
  );
}
