import { v4 as uuidV4 } from 'uuid';
import { LessonBlock } from '~/api';
import { getFile, uploadFile } from '~/files-api';
import { BlockType } from '../LessonEditor.types';
import { EditorBlock, EditorFileBlock, EditorTextBlock } from './blocks.types';

export function createEditorBlock(blockType: BlockType): EditorBlock {
  switch (blockType) {
    case BlockType.Text:
      return createTextBlock();
    case BlockType.Image:
    case BlockType.Video:
      return createFileBlock(blockType);
  }
}

export function createTextBlock(): EditorTextBlock {
  return {
    uuid: uuidV4(),
    type: BlockType.Text,
    text: '',
    viewSettings: {},
  };
}

export function createFileBlock(blockType: BlockType): EditorFileBlock {
  return {
    uuid: uuidV4(),
    type: blockType,
    viewSettings: {},
    file: undefined,
    uploadedUuid: undefined,
  };
}

export function convertEditorBlocksToLessonBlocks(
  editorBlocks: Array<EditorBlock>,
): Promise<Array<LessonBlock>> {
  return Promise.all<LessonBlock>(
    editorBlocks.map<Promise<LessonBlock>>(
      async (editorBlock): Promise<LessonBlock> => {
        switch (editorBlock.type) {
          case BlockType.Text: {
            const textBlock = editorBlock as EditorTextBlock;

            return {
              text: {
                content: textBlock.text,
                viewSettings: JSON.stringify(textBlock.viewSettings),
              },
            };
          }
          case BlockType.Video:
          case BlockType.Image: {
            const fileBlock = editorBlock as EditorFileBlock;
            let fileId = fileBlock.uploadedUuid ?? '';

            if (fileBlock.file && !fileId) {
              fileId = await uploadFile(fileBlock.file);
            }

            const key: 'image' | 'video' =
              fileBlock.type === BlockType.Image ? 'image' : 'video';

            // @ts-ignore ts cant extract type correctly from "key" variable
            return {
              [key]: {
                fileId,
                viewSettings: JSON.stringify(fileBlock.viewSettings),
              },
            };
          }
        }

        throw new Error('Undefined block type');
      },
    ),
  );
}

export function convertBlocksToEditorBlocks(
  blocks: Array<LessonBlock>,
): Promise<Array<EditorBlock>> {
  return Promise.all<EditorBlock>(
    blocks.map(async (block: LessonBlock) => {
      if ('text' in block) {
        const { text: textBlock } = block;
        const editorTextBlock: EditorTextBlock = {
          uuid: uuidV4(),
          text: textBlock.content || '',
          type: BlockType.Text,
          viewSettings: JSON.parse(textBlock.viewSettings),
        };

        return editorTextBlock;
      }

      if ('image' in block || 'video' in block) {
        const isImage = 'image' in block;
        const blockData = isImage ? block.image : block.video;

        const file: Nullable<File> = blockData.fileId
          ? await getFile(blockData.fileId)
          : undefined;

        const editorFileBlock: EditorFileBlock = {
          file,
          uuid: uuidV4(),
          type: isImage ? BlockType.Image : BlockType.Video,
          viewSettings: JSON.parse(blockData.viewSettings),
          uploadedUuid: blockData.fileId ?? undefined,
        };

        return editorFileBlock;
      }

      throw new Error('Undefined block type');
    }),
  );
}
