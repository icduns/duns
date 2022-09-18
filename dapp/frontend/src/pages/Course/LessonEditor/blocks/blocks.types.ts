import type { BlockType } from '../LessonEditor.types';

export type BlockViewSettings = {};

export type EditorBlockBaseSettings = {
  uuid: string;
  type: BlockType;
  viewSettings?: BlockViewSettings;
};

export type EditorFileBlock = EditorBlockBaseSettings & {
  file: Nullable<File>;
  uploadedUuid: Nullable<string>;
};

export type EditorTextBlock = EditorBlockBaseSettings & {
  text: string;
};

export type EditorImageBlock = EditorFileBlock & {};
export type EditorVideoBlock = EditorFileBlock & {};

export type EditorBlock = EditorTextBlock | EditorImageBlock | EditorVideoBlock;
