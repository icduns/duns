import { useCallback, useEffect, useState } from 'react';
import { FilePicker } from '~/components/FilePicker';
import { useObjectUrl } from '~/hooks/useObjectUrl';
import { EditorImageBlock } from '../blocks.types';
import styles from './ImageBlock.module.less';

export type ImageBlockProps = {
  block: EditorImageBlock;
  onEdit: (blockUuid: string, value: Partial<EditorImageBlock>) => void;
};

const allowedMimeTypes = [
  'image/bmp',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
].join(',');

export function ImageBlock({ block, onEdit }: ImageBlockProps) {
  const fileUrl = useObjectUrl(block?.file);
  const handleFileChange = useCallback(
    (file: Nullable<File>) => {
      onEdit(block.uuid, {
        file,
        uploadedUuid: undefined,
      });
    },
    [block.uuid, onEdit],
  );

  return (
    <div>
      <FilePicker
        value={block.file}
        accept={allowedMimeTypes}
        onChange={handleFileChange}
      />

      {fileUrl && (
        <img
          style={{ maxWidth: '100%' }}
          alt={block.file?.name}
          src={fileUrl}
        />
      )}
    </div>
  );
}
