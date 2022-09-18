import { ExoticComponent } from 'react';
import { LessonBlock } from '~/api';

export enum BlockType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
}

export type BlockList = Array<BlockListItem>;

export type BlockListItem = {
  name: string;
  type: BlockType;
  icon?: ExoticComponent;
};
