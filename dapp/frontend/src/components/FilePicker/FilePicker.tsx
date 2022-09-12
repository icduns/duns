import { ChangeEvent, useCallback, useRef } from 'react';
import { DeleteOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import isNil from 'lodash/isNil';
import styles from './FilePicker.module.less';

export type FilePickerProps = {
  value?: File;
  onChange?: (value: Nullable<File>) => void;
};

export function FilePicker({ value, onChange }: FilePickerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;

      onChange(event.target.files?.length ? event.target.files[0] : null);
    },
    [onChange],
  );

  const handleDelete = useCallback(() => {
    if (!onChange) return;

    onChange(null);
  }, [onChange]);

  const handleOpenFileSelector = () => {
    if (!fileInputRef.current) return;

    fileInputRef.current.click();
  };

  // TODO Prettify file picker
  return (
    <>
      <input hidden type="file" ref={fileInputRef} onChange={handleChange} />
      <div className={styles.filePicker}>
        {isNil(value) ? (
          <Button onClick={handleOpenFileSelector}>Select file</Button>
        ) : (
          <>
            <span>{value.name}</span>
            <Button
              size="small"
              icon={<DeleteOutlined />}
              onClick={handleDelete}
            />
          </>
        )}
      </div>
    </>
  );
}
