import { useObjectUrl } from '~/hooks/useObjectUrl';
import { ContentPayload } from '~/pages/CourseProgress/CourseProgressCurrentLesson';
import styles from './VideoContent.module.less';

type VideoContentProps = { payload: ContentPayload };
export function VideoContent(props: VideoContentProps) {
  const { payload } = props;
  const fileUrl = useObjectUrl(payload.content as Nullable<File>);

  return fileUrl ? (
    <video className={styles.videoContent} controls src={fileUrl}>
      <track kind="captions" />
    </video>
  ) : null;
}
