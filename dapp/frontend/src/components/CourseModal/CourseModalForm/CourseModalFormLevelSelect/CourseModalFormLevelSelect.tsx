import { forwardRef, useCallback, useEffect, useState } from 'react';
import { Select, SelectProps } from 'antd';
import { DefaultOptionType, RefSelectProps } from 'antd/es/select';

const CourseModalFormLevelSelect = forwardRef<RefSelectProps, SelectProps>(
  function CourseModalFormLevelSelect(forwardProps, ref) {
    const { onChange, value, ...restForwardProps } = forwardProps;

    const [formattedValue, setFormattedValue] = useState<string | undefined>();

    const handleChange: SelectProps['onChange'] = useCallback(
      (newValue: string, option: DefaultOptionType | DefaultOptionType[]) => {
        if (onChange) {
          onChange({ [newValue]: null }, option);
        }
      },
      [onChange],
    );

    useEffect(() => {
      if (value) {
        const result = Object.keys(value)[0];
        setFormattedValue(result);
      }
    }, [value]);

    return (
      <Select
        ref={ref}
        {...restForwardProps}
        onChange={handleChange}
        value={formattedValue}
      />
    );
  },
);

export { CourseModalFormLevelSelect };
