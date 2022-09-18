import { PropsWithChildren, useRef } from 'react';
import { Space, Typography } from 'antd';
import classNames from 'classnames';
import type { Identifier, XYCoord } from 'dnd-core';
import { DropTargetHookSpec, useDrag, useDrop } from 'react-dnd';
import { Lesson } from '~/api';
import styles from './CourseLesson.module.less';

const { Title } = Typography;
const DND_TYPE = 'LESSON';

export type CourseLessonProps = PropsWithChildren<{
  lesson: Lesson;
  index: number;
  moveLesson: (dragIndex: number, hoverIndex: number) => void;
}>;
type DragItem = { index: number };
type DragCollectedProps = { isDragging: boolean };
type DropCollectedProps = { handlerId: Identifier | null };

export function CourseLesson(props: CourseLessonProps) {
  const { lesson, children, moveLesson, index } = props;
  const ref = useRef<HTMLDivElement>(null);
  const title = `${index + 1}. ${lesson.title}`;

  const [{ isDragging }, drag] = useDrag<DragItem, void, DragCollectedProps>({
    type: DND_TYPE,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    item: () => ({ index }),
  });

  const dropFn: DropTargetHookSpec<
    DragItem,
    void,
    DropCollectedProps
  >['drop'] = (item, monitor) => {
    if (!ref.current) {
      return;
    }

    const dragIndex = item.index;
    const dropIndex = index;

    // Don't replace items with themselves
    if (dragIndex === dropIndex) {
      return;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = ref.current?.getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < dropIndex && hoverClientY < hoverMiddleY) {
      return;
    }

    // Dragging upwards
    if (dragIndex > dropIndex && hoverClientY > hoverMiddleY) {
      return;
    }

    // Time to actually perform the action
    moveLesson(dragIndex, dropIndex);
  };

  const [{ handlerId }, drop] = useDrop<DragItem, void, DropCollectedProps>({
    accept: DND_TYPE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    drop: dropFn,
  });

  drop(drag(ref));

  return (
    <div
      ref={ref}
      className={classNames(
        styles.courseLesson,
        isDragging && styles.courseLesson__dragging,
      )}
      data-handler-id={handlerId}
    >
      <Title ellipsis level={5} style={{ margin: 0 }}>
        {title}
      </Title>
      <Space>{children}</Space>
    </div>
  );
}
