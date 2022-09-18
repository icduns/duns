import { useEffect, useState } from 'react';

export function useObjectUrl(file: Nullable<File>): Nullable<string> | null {
  const [objectUrl, setObjectUrl] = useState<string | null>();

  useEffect(() => {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }

    if (file) {
      setObjectUrl(URL.createObjectURL(file));
    }
  }, [file]);

  useEffect(
    () => () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    },
    [objectUrl],
  );

  return objectUrl;
}
