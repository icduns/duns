import { useCallback, useState } from 'react';
import { MoreOutlined } from '@ant-design/icons';
import { Button, Dropdown, DropdownProps, Modal } from 'antd';
import { useTranslation } from 'react-i18next';
import { call, Course } from '~/api';
import {
  CourseActionsOverlay,
  CourseActionsOverlayProps,
} from '~/components/CourseActions/CourseActionsOverlay';
import { CourseModal, CourseModalProps } from '~/components/CourseModal';
import { uploadFile } from '~/files-api';
import { removeFileFromDb } from '~/files-db';
import { truncateText } from '~/utils/truncateText';

const { confirm } = Modal;
const dropdownTrigger: DropdownProps['trigger'] = ['click'];
type ModalData = Pick<CourseModalProps, 'type' | 'data' | 'open'>;

export type CourseActionsProps = {
  course: Course;
  onAction?: (e: string) => void;
  hiddenKeys?: CourseActionsOverlayProps['hiddenKeys'];
};

export function CourseActions(props: CourseActionsProps) {
  const { course, onAction, hiddenKeys } = props;
  const [modalData, setModalData] = useState<ModalData>({
    type: 'create',
    open: false,
  });

  const { t } = useTranslation();

  const handleAction = useCallback(
    (e: string) => {
      switch (e) {
        case 'edit':
          setModalData({ type: 'edit', data: course, open: true });
          break;
        case 'publish':
          call('publishCourse', course.id).then(() => {
            if (onAction) {
              onAction(e);
            }
          });
          break;
        case 'delete':
          confirm({
            title: t('courses.delete_course_confirm', {
              title: truncateText(course.title),
            }),
            okButtonProps: { danger: true },
            okText: t('delete'),
            onOk: () =>
              call('deleteCourse', course.id)
                .then(() => removeFileFromDb(course.imageId))
                .then(() => {
                  if (onAction) {
                    onAction(e);
                  }
                }),
          });
          break;
        default:
          break;
      }
    },
    [course, onAction, t],
  );
  const handleSubmit: CourseModalProps['onSubmit'] = useCallback(
    async (e) => {
      if (!('id' in e)) {
        return;
      }

      let imageId = '';
      // TODO: We don't need to upload a non-updated image
      if (e.image) {
        imageId = await uploadFile(e.image);
      }

      const { image, ...restParams } = e;

      call('updateCourse', { ...restParams, imageId }).then(() => {
        setModalData((prModalData) => ({ ...prModalData, open: false }));
        if (onAction) {
          onAction('edit');
        }
      });
    },
    [onAction],
  );

  return (
    <>
      <Dropdown
        overlay={
          <CourseActionsOverlay
            hiddenKeys={hiddenKeys}
            onAction={handleAction}
          />
        }
        trigger={dropdownTrigger}
      >
        <Button icon={<MoreOutlined />} size="small" type="text" />
      </Dropdown>
      <CourseModal
        {...modalData}
        onCancel={() =>
          setModalData((prModalData) => ({ ...prModalData, open: false }))
        }
        onSubmit={handleSubmit}
      />
    </>
  );
}
