import React, { useCallback, useState } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, DropdownProps, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { call } from '~/api';
import { CourseActionsOverlay } from '~/components/CourseActions/CourseActionsOverlay';
import { CourseModal, CourseModalProps } from '~/components/CourseModal';
import { Course } from '../../../../../declarations/dun_backend/dun_backend.did';

const { confirm } = Modal;
const dropdownTrigger: DropdownProps['trigger'] = ['click'];
type ModalData = Pick<CourseModalProps, 'type' | 'data' | 'visible'>;

export type CourseActionsProps = {
  course: Course;
  onAction: (e: string) => void;
};
export function CourseActions(props: CourseActionsProps) {
  const { course, onAction } = props;
  const [modalData, setModalData] = useState<ModalData>({
    type: 'create',
    visible: false,
  });

  const { t } = useTranslation();

  const handleAction = useCallback(
    (e: string) => {
      switch (e) {
        case 'edit':
          setModalData({ type: 'edit', data: course, visible: true });
          break;
        case 'delete':
          confirm({
            title: t('courses.delete_course_confirm', { title: course.title }),
            okButtonProps: { danger: true },
            okText: t('delete'),
            onOk: () => call('deleteCourse', course.id).then(() => onAction(e)),
          });
          break;
        default:
          break;
      }
    },
    [course, onAction, t],
  );
  const handleSubmit: CourseModalProps['onSubmit'] = useCallback(
    (e) => {
      const action =
        'id' in e ? call('updateCourse', e) : call('createCourse', e);

      action.then(() => {
        setModalData((prModalData) => ({ ...prModalData, visible: false }));
        onAction('edit');
      });
    },
    [onAction],
  );

  return (
    <>
      <Dropdown
        overlay={<CourseActionsOverlay onAction={handleAction} />}
        trigger={dropdownTrigger}
      >
        <Button icon={<MoreOutlined />} size="small" type="text" />
      </Dropdown>
      <CourseModal
        {...modalData}
        onCancel={() =>
          setModalData((prModalData) => ({ ...prModalData, visible: false }))
        }
        onSubmit={handleSubmit}
      />
    </>
  );
}
