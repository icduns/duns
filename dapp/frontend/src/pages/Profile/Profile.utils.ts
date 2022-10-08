import { UserProfile } from '~/api';
import { getFile } from '~/files-api';
import { FormValue } from '~/utils/profileRequestConverter';
import { fromNullable } from '~/utils/typeConverters';

export const convertUserRequestToForm = (
  value: UserProfile,
): Promise<FormValue> =>
  (Object.keys(value) as Array<keyof typeof value>).reduce(async (acc, key) => {
    const res = await acc;
    if (key === 'imageId' && value[key][0]) {
      const photo = await getFile(value[key][0] as string);
      return { ...res, photo };
    }
    if (value[key] instanceof Array) {
      // @ts-ignore
      return { ...res, [key]: fromNullable(value[key]) };
    }
    return { ...res, [key]: value[key] };
  }, Promise.resolve({} as FormValue));
