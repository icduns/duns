import {
  FileImageOutlined,
  FontColorsOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { BlockList, BlockListType } from '../LessonEditor.types';

export const blocksList: BlockList = [
  {
    type: BlockListType.Text,
    name: 'blocks.text_block',
    icon: FontColorsOutlined,
  },
  {
    type: BlockListType.Image,
    name: 'blocks.image_block',
    icon: FileImageOutlined,
  },
  {
    type: BlockListType.Video,
    name: 'blocks.video_block',
    icon: VideoCameraOutlined,
  },
];
