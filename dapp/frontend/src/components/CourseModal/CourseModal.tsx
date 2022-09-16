import { useCallback } from 'react';
import { Modal, ModalProps } from 'antd';
import isEmpty from 'lodash/isEmpty';
import { useTranslation } from 'react-i18next';
import { UpdateCourseRequest } from '~/api';
import {
  CourseModalForm,
  CourseModalFormValue,
} from '~/components/CourseModal/CourseModalForm/CourseModalForm';
import { useModalConfig } from '~/hooks/useModalConfig';

export type CourseModalProps = ModalProps & {
  type: 'create' | 'edit';
  onSubmit: (e: CourseModalFormValue) => void;
  data?: UpdateCourseRequest;
};

export function CourseModal(props: CourseModalProps) {
  const { onSubmit, visible, type, data, ...restProps } = props;
  const { t } = useTranslation();
  const { setValue, setEnableSave, handleOk, submitButtonProps, loading } =
    useModalConfig<CourseModalFormValue>({ visible, onSubmit });

  const handleValuesChange = useCallback(
    (values: CourseModalFormValue) => {
      const result = (Object.keys(values) as Array<keyof typeof values>).every(
        (key) => {
          if (values[key] instanceof File) return true;

          return !isEmpty(values[key]);
        },
      );

      setValue(values);
      setEnableSave(result);
    },
    [setEnableSave, setValue],
  );

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
