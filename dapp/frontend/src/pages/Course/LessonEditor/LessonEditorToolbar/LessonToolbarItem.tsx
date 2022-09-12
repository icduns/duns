import { CSSProperties } from 'react';
import { Card } from 'antd';
import { useDrag } from 'react-dnd';
import { useTranslation } from 'react-i18next';
import { BlockListItem } from '../LessonEditor.types';

export type LessonToolbarItemProps = {
  block: BlockListItem;
};

const cardBodyStyles: CSSProperties = {
  padding: '12px',
  cursor: 'pointer',
  boxShadow: 'var(--lt-shadowDefault)',
  display: 'flex',
};

export function LessonToolbarItem({ block }: LessonToolbarItemProps) {
  const { t } = useTranslation();
  const [, drag] = useDrag<BlockListItem, BlockListItem, unknown>(() => ({
    type: 'block',
    item: {
      ...block,
    },
  }));

  return (
    <Card
      ref={drag}
      bodyStyle={cardBodyStyles}
      style={{ marginBottom: '12px' }}
    >
      {block.icon && (
        <div style={{ paddingRight: '12px' }}>
          <block.icon />
        </div>
      )}
      <span>{t(block.name)}</span>
    </Card>
  );
}
