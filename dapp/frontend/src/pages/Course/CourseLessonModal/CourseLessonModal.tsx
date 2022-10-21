import { useCallback } from 'react';
import { Modal, ModalProps } from 'antd';
import { useTranslation } from 'react-i18next';
import { UpdateLessonRequest } from '~/api';
import { useModalConfig } from '~/hooks/useModalConfig';
import {
  CourseLessonModalForm,
  CourseLessonModalFormValue,
} from '~/pages/Course/CourseLessonModal/CourseLessonModalForm';
import { truncateText } from '~/utils/truncateText';

export type CourseLessonModalProps = ModalProps & {
  type: 'create' | 'edit';
  onSubmit: (e: CourseLessonModalFormValue) => void;
  data?: UpdateLessonRequest;
};

export function CourseLessonModal(props: CourseLessonModalProps) {
  const { onSubmit, open, type, data, ...restProps } = props;
  const { t } = useTranslation();
  const { setValue, setEnableSave, handleOk, submitButtonProps } =
    useModalConfig<CourseLessonModalFormValue>({ open, onSubmit });

  const handleValuesChange = useCallback(
    (values: CourseLessonModalFormValue) => {
      const result = (Object.keys(values) as Array<keyof typeof values>).every(
        (key) => values[key],
      );

      setValue(values);
      setEnableSave(result);
    },
    [setEnableSave, setValue],
  );

  return (
    <Modal
      open={open}
      {...restProps}
      maskClosable={false}
      title={
        type === 'create'
          ? t('lessons.lesson_modal_title_new')
          : t('lessons.lesson_modal_title_edit', {
              title: truncateText(data!.title),
            })
      }
      okButtonProps={submitButtonProps}
      onOk={handleOk}
      okText={t('save')}
      destroyOnClose
    >
      <CourseLessonModalForm
        data={data}
        type={type}
        onValuesChange={handleValuesChange}
      />
    </Modal>
  );
}
