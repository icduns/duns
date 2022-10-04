import { MouseEventHandler, useCallback, useEffect, useState } from 'react';
import {
  CameraOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { Avatar, Upload, UploadProps } from 'antd';
import styles from './ProfilePhoto.module.less';

type ProfilePhotoProps = {
  value?: File;
  onChange?: (value: Nullable<File>) => void;
};
export function ProfilePhoto(props: ProfilePhotoProps) {
  const { value, onChange } = props;
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (value && !imageUrl) {
      setImageUrl(URL.createObjectURL(value));
    }
  }, [imageUrl, value]);

  const handleChange: UploadProps<File>['onChange'] = useCallback(
    // @ts-ignore
    ({ file }) => {
      if (onChange) {
        setImageUrl(URL.createObjectURL(file as unknown as File));
        onChange(file as unknown as File);
      }
    },
    [onChange],
  );

  const handleOverlayClick: MouseEventHandler<HTMLDivElement> = useCallback(
    (e) => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
        setImageUrl(null);
        e.preventDefault();
        e.stopPropagation();
        if (onChange) {
          onChange(undefined);
        }
      }
    },
    [imageUrl, onChange],
  );
  const handleBeforeUpload = useCallback(() => false, []);

  return (
    <Upload
      className={styles.profilePhoto}
      accept="image/*"
      listType="picture-card"
      showUploadList={false}
      beforeUpload={handleBeforeUpload}
      onChange={handleChange}
    >
      {imageUrl ? <Avatar size={100} src={imageUrl} /> : <CameraOutlined />}
      <div className={styles.profilePhoto_overlay} onClick={handleOverlayClick}>
        {imageUrl ? <DeleteOutlined /> : <PlusOutlined />}
      </div>
    </Upload>
  );
}
