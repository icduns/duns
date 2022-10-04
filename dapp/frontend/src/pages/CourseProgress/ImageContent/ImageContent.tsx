import { useObjectUrl } from '~/hooks/useObjectUrl';
import { ContentPayload } from '~/pages/CourseProgress/CourseProgressCurrentLesson';
import styles from './ImageContent.module.less';

type ImageContentProps = { payload: ContentPayload };
export function ImageContent(props: ImageContentProps) {
  const { payload } = props;
  const fileUrl = useObjectUrl(payload.content as Nullable<File>);

  return fileUrl ? (
    <img className={styles.imageContent} src={fileUrl} alt="" />
  ) : null;
}
