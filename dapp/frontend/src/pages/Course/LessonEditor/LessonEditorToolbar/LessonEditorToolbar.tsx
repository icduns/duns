import { blocksList } from './blocks-list';
import styles from './LessonEditorToolbar.module.less';
import { LessonToolbarItem } from './LessonToolbarItem';

export function LessonEditorToolbar() {
  return (
    <div className={styles.lesson_editor_toolbar}>
      {blocksList.map((block, index) => (
        <LessonToolbarItem key={index} block={block} />
      ))}
    </div>
  );
}
