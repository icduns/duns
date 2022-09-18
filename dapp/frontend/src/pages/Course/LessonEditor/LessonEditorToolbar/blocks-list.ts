import {
  FileImageOutlined,
  FontColorsOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import { BlockList, BlockType } from '../LessonEditor.types';

export const blocksList: BlockList = [
  {
    type: BlockType.Text,
    name: 'blocks.text_block',
    icon: FontColorsOutlined,
  },
  {
    type: BlockType.Image,
    name: 'blocks.image_block',
    icon: FileImageOutlined,
  },
  {
    type: BlockType.Video,
    name: 'blocks.video_block',
    icon: VideoCameraOutlined,
  },
];
