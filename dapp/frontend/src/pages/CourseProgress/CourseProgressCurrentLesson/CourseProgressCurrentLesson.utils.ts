import { LessonBlock } from '~/api';
import { getFile } from '~/files-api';

export enum ContentType {
  Text = 'TEXT',
  Image = 'IMAGE',
  Video = 'VIDEO',
}
export type ContentPayload = {
  content: string | Nullable<File>;
  type: ContentType;
};
export const convertBlocksToContent = (blocks: Array<LessonBlock>) =>
  Promise.all(
    blocks.map(async (block) => {
      if ('text' in block) {
        const { text: textBlock } = block;
        return { content: textBlock.content, type: ContentType.Text };
      }
      const isImage = 'image' in block;
      const blockData = isImage ? block.image : block.video;

      const content: Nullable<File> = blockData.fileId
        ? await getFile(blockData.fileId)
        : undefined;

      return { content, type: isImage ? ContentType.Image : ContentType.Video };
    }),
  );
