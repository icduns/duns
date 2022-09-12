import { useCallback, useEffect, useMemo, useState } from 'react';
import { ButtonProps, Modal, ModalProps } from 'antd';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
import { UpdateCourseRequest } from '~/api';
import {
  CourseModalForm,
  CourseModalFormValue,
} from '~/components/CourseModal/CourseModalForm/CourseModalForm';

export type CourseModalProps = ModalProps & {
  type: 'create' | 'edit';
  onSubmit: (e: CourseModalFormValue) => void;
  data?: UpdateCourseRequest;
};

export function CourseModal(props: CourseModalProps) {
  const { onSubmit, visible, type, data, ...restProps } = props;
  const { t } = useTranslation();
  const [enableSave, setEnableSave] = useState<boolean>();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState<CourseModalFormValue | undefined>();

  const handleValuesChange = useCallback((values: CourseModalFormValue) => {
    const result = (Object.keys(values) as Array<keyof typeof values>).every(
      (key) => {
        if (values[key] instanceof File) return true;

        return !isEmpty(values[key]);
      },
    );

    setValue(values);
    setEnableSave(result);
  }, []);

  const handleOk = useCallback(() => {
    if (!value) {
      return;
    }
    onSubmit(value);
    setLoading(true);
  }, [onSubmit, value]);

  const submitButtonProps: ButtonProps = useMemo(
    () => ({
      disabled: !enableSave,
    }),
    [enableSave],
  );

  useEffect(() => {
    if (!visible) {
      setEnableSave(false);
      setLoading(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      {...restProps}
      maskClosable={false}
      destroyOnClose
      title={
        type === 'create'
          ? t('courses.course_modal_title_new')
          : t('courses.course_modal_title_edit', { title: data?.title })
      }
      okButtonProps={submitButtonProps}
      onOk={handleOk}
      okText={t('save')}
      confirmLoading={loading}
    >
      <CourseModalForm
        data={data}
        type={type}
        onValuesChange={handleValuesChange}
      />
    </Modal>
  );
}
