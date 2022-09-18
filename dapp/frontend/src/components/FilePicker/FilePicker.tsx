import { useCallback } from 'react';
import {
  DeleteOutlined,
  InboxOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { Button, Space, Typography, Upload } from 'antd';
import { DraggerProps } from 'antd/es/upload';
import { useTranslation } from 'react-i18next';
import styles from './FilePicker.module.less';

const { Dragger } = Upload;
const { Text } = Typography;
type DraggerOnChange = Required<DraggerProps>['onChange'];

export type FilePickerProps = {
  accept: DraggerProps['accept'];
  value?: File;
  description?: string;
  onChange?: (value: Nullable<File>) => void;
};

export function FilePicker(props: FilePickerProps) {
  const { value, onChange, description, ...restProps } = props;
  const { t } = useTranslation();

  const handleChange = useCallback<DraggerOnChange>(
    ({ file }) => {
      if (onChange) {
        onChange((file as unknown as File) || null);
      }
    },
    [onChange],
  );

  const handleDelete = useCallback(() => {
    if (!onChange) return;

    onChange(undefined);
  }, [onChange]);

  if (value) {
    return (
      <Space className={styles.filePicker_fileInfo}>
        <span className={styles.filePicker_fileInfo_nameContainer}>
          <PaperClipOutlined />
          <Text className={styles.filePicker_fileInfo_name} ellipsis>
            {value.name}
          </Text>
        </span>
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          onClick={handleDelete}
        />
      </Space>
    );
  }

  return (
    <Dragger onChange={handleChange} beforeUpload={() => false} {...restProps}>
      <Space direction="vertical" className={styles.filePicker_dragArea}>
        <InboxOutlined className={styles.filePicker_dragArea_icon} />
        <Text>{description || t('file_picker_description')}</Text>
      </Space>
    </Dragger>
  );
}
