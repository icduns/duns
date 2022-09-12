import { ExoticComponent } from 'react';
import { LessonBlock } from '~/api';

export enum BlockListType {
  Text = 'text',
  Image = 'image',
  Video = 'video',
}

export type LessonBlockWithId = LessonBlock & { uuid: string };

export type BlockList = Array<BlockListItem>;

export type BlockListItem = {
  name: string;
  type: BlockListType;
  icon?: ExoticComponent;
};

export type EditableBlockProps = {
  block: LessonBlockWithId;
  onEdit: (uuid: string, block: LessonBlockWithId) => void;
  onDelete: (uuid: string) => void;
};
