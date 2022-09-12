import omit from 'lodash/omit';
import { v4 } from 'uuid';
import { ImageBlock, LessonBlock, TextBlock, VideoBlock } from '~/api';
import { BlockListType, LessonBlockWithId } from './LessonEditor.types';

export function generateIdsForBlocks(
  blocks: Array<LessonBlock>,
): Array<LessonBlockWithId> {
  return blocks.map((block) => ({
    ...block,
    uuid: v4(),
  }));
}

export function removeIdsFromBlocks(
  blocks: Array<LessonBlockWithId>,
): Array<LessonBlock> {
  return blocks.map((block) => omit(block, 'uuid') as LessonBlock);
}

export function createLessonBlock(blockType: BlockListType): LessonBlockWithId {
  const uuid = v4();

  switch (blockType) {
    case BlockListType.Text:
      return { uuid, text: createTextBlock() };
    case BlockListType.Image:
      return { uuid, image: createFileBlock() };
    case BlockListType.Video:
      return { uuid, video: createFileBlock() };
  }
}

export const defaultViewSettings = JSON.stringify({});

function createTextBlock(): TextBlock {
  return {
    content: '',
    viewSettings: defaultViewSettings,
  };
}

function createFileBlock(): ImageBlock {
  return {
    fileId: '',
    viewSettings: defaultViewSettings,
  };
}
