import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Space, Typography } from 'antd';
import { Lesson } from '~/api';
import { Editor } from '~/components/Editor';
import {
  ContentPayload,
  convertBlocksToContent,
} from '~/pages/CourseProgress/CourseProgressCurrentLesson';
import { ImageContent } from '~/pages/CourseProgress/ImageContent';
import { VideoContent } from '~/pages/CourseProgress/VideoContent';
import styles from './CourseProgressCurrentLesson.module.less';

const { Title } = Typography;

type CourseProgressCurrentLessonProps = {
  lesson: Lesson;
  title?: ReactNode;
  action?: ReactNode;
};
export function CourseProgressCurrentLesson(
  props: CourseProgressCurrentLessonProps,
) {
  const { lesson, title, action } = props;
  const [content, setContent] = useState<Array<ContentPayload>>();

  useEffect(() => {
    convertBlocksToContent(lesson.blocks).then(setContent);
  }, [lesson.blocks]);

  const renderContent = useCallback(
    () =>
      content?.map((item, index) => {
        switch (item.type) {
          case 'TEXT':
            return (
              <Editor readonly key={index} content={item.content as string} />
            );
          case 'IMAGE':
            return <ImageContent key={index} payload={item} />;
          case 'VIDEO':
            return <VideoContent key={index} payload={item} />;
          default:
            return null;
        }
      }),
    [content],
  );

  return (
    <>
      <span className={styles.courseProgressCurrentLesson}>
        <Title level={3} ellipsis>
          {title}
        </Title>
        {action}
      </span>

      <Space direction="vertical" size="large">
        {renderContent()}
      </Space>
    </>
  );
}
