import { useCallback, useEffect, useMemo, useState } from 'react';
import { ButtonProps, ModalProps } from 'antd';

type UseModalConfigProps<T> = {
  open: ModalProps['open'];
  onSubmit: (e: T) => void;
};

export function useModalConfig<T>(props: UseModalConfigProps<T>) {
  const { open, onSubmit } = props;
  const [enableSave, setEnableSave] = useState(false);
  const [value, setValue] = useState<T | undefined>();

  const handleOk: ModalProps['onOk'] = useCallback(() => {
    if (!value) {
      return;
    }
    onSubmit(value);
  }, [onSubmit, value]);

  const submitButtonProps: ButtonProps = useMemo(
    () => ({
      disabled: !enableSave,
    }),
    [enableSave],
  );

  useEffect(() => {
    if (!open) {
      setEnableSave(false);
    }
  }, [open]);

  return { setEnableSave, setValue, submitButtonProps, handleOk };
}
