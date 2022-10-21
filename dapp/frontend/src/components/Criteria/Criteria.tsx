import { MouseEventHandler, useCallback, useMemo } from 'react';
import { CloseOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Dropdown, DropdownProps } from 'antd';
import classNames from 'classnames';
import { CriteriaOverlay } from '~/components/Criteria/CriteriaOverlay';
import styles from './Criteria.module.less';

const dropdownTrigger: DropdownProps['trigger'] = ['click'];

type Option = { label: string; value: string };
export type CriteriaProps = {
  value?: Array<string>;
  options: Array<Option>;
  onChange: (e: Array<string>) => void;
  label: string;
};
export function Criteria(props: CriteriaProps) {
  const { value, options, onChange, label } = props;

  const statusLabel = useMemo(
    () => (value?.length ? `${label}: ${value.length}` : label),
    [label, value?.length],
  );

  const handleClear = useCallback<MouseEventHandler>(
    (e) => {
      e.stopPropagation();
      onChange([]);
    },
    [onChange],
  );

  return (
    <Dropdown
      overlayClassName={styles.criteria_overlay}
      overlay={
        <CriteriaOverlay options={options} value={value} onChange={onChange} />
      }
      trigger={dropdownTrigger}
    >
      <Button
        size="large"
        className={classNames({ [styles.criteria__active]: value?.length })}
      >
        {statusLabel}
        {value?.length ? (
          <CloseOutlined onClick={handleClear} />
        ) : (
          <DownOutlined />
        )}
      </Button>
    </Dropdown>
  );
}
