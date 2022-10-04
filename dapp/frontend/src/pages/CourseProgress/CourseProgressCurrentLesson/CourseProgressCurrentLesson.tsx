import { ReactNode, useCallback, useEffect, useState } from 'react';
import { Space, Typography } from 'antd';
import { sanitize } from 'dompurify';
import { Lesson } from '~/api';
import {
  ContentPayload,
  convertBlocksToContent,
} from '~/pages/CourseProgress/CourseProgressCurrentLesson';
import { ImageContent } from '~/pages/CourseProgress/ImageContent';
import { VideoContent } from '~/pages/CourseProgress/VideoContent';

const { Title } = Typography;

type CourseProgressCurrentLessonProps = { lesson: Lesson; title: ReactNode };
export function CourseProgressCurrentLesson(
  props: CourseProgressCurrentLessonProps,
) {
  const { lesson, title } = props;
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
              <div
                key={index}
                dangerouslySetInnerHTML={{
                  __html: sanitize(item.content as string),
                }}
              />
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
      <Title level={3} ellipsis>
        {title}
      </Title>
      <Space direction="vertical" size="large">
        {renderContent()}
      </Space>
    </>
  );
}
