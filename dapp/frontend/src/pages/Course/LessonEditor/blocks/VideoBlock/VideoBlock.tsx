import { useCallback } from 'react';
import { FilePicker } from '~/components/FilePicker';
import { useObjectUrl } from '~/hooks/useObjectUrl';
import { EditorVideoBlock } from '../blocks.types';
import styles from './VideoBlock.module.less';

export type VideoBlockProps = {
  block: EditorVideoBlock;
  onEdit: (blockUuid: string, value: Partial<EditorVideoBlock>) => void;
};

const allowedMimeTypes = [
  'video/mp4',
  'video/mpeg',
  'video/x-msvideo',
  'video/x-ms-wmv',
].join(',');

export function VideoBlock({ block, onEdit }: VideoBlockProps) {
  const fileUrl = useObjectUrl(block.file);
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
        <video style={{ maxWidth: '100%' }} controls src={fileUrl}>
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}
