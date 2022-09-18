import omit from 'lodash/omit';
import { v4 } from 'uuid';
import { ImageBlock, LessonBlock, TextBlock, VideoBlock } from '~/api';
import { BlockType } from './LessonEditor.types';

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
