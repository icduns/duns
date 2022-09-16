import { useEffect, useState } from 'react';
import { Skeleton } from 'antd';
import { useTranslation } from 'react-i18next';
import { getFileUrl } from '~/files-api';
import styles from './CourseImage.module.less';

const { Image: SkeletonImage } = Skeleton;

type CourseImageProps = { imageId: string; title: string };
export function CourseImage(props: CourseImageProps) {
  const { imageId, title } = props;
  const { t } = useTranslation();

  const [imageUrl, setImageUrl] = useState<string>();

  useEffect(() => {
    getFileUrl(imageId).then(setImageUrl);
  }, [imageId]);

  useEffect(
    () => () => {
      if (!imageUrl) {
        return;
      }

      URL.revokeObjectURL(imageUrl);
    },
    [imageUrl],
  );

  return imageUrl ? (
    <img
      className={styles.courseImage_img}
      src={imageUrl}
      width="320"
      height="160"
      alt={t('courses.image_description', { title })}
    />
  ) : (
    <SkeletonImage className={styles.courseImage_skeleton} active />
  );
}
