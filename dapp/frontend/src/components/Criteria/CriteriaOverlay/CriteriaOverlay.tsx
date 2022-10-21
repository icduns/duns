import { useCallback, useEffect, useState } from 'react';
import { Checkbox, Empty, Menu, MenuProps, Space } from 'antd';
import { ItemType } from 'antd/es/menu/hooks/useItems';
import { CriteriaProps } from '~/components/Criteria';

type CriteriaOverlayProps = Pick<
  CriteriaProps,
  'options' | 'value' | 'onChange'
>;
export function CriteriaOverlay(props: CriteriaOverlayProps) {
  const { options, value, onChange } = props;
  const [items, setItems] = useState<MenuProps['items']>();

  const handleClick = useCallback<Required<MenuProps>['onClick']>(
    ({ key }) => {
      if (value) {
        const isExisted = value.includes(key);
        onChange(isExisted ? value.filter((i) => i !== key) : [...value, key]);
      }
    },
    [onChange, value],
  );

  useEffect(() => {
    const res = options.length
      ? options.map<ItemType>((option) => ({
          key: option.value,
          label: (
            <Space>
              <Checkbox checked={value?.includes(option.value)} />
              {option.label}
            </Space>
          ),
        }))
      : [{ key: 'empty', label: <Empty />, disabled: true }];
    setItems(res);
  }, [options, value]);

  return (
    <Menu
      items={items}
      onClick={handleClick}
      selectable={Boolean(options.length)}
    />
  );
}
