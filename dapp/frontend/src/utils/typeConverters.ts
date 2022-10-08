export const fromNullable = <T>(value: [] | [T]): T | undefined => value?.[0];
export const toNullable = <T>(value: T | undefined): [] | [T] =>
  value ? [value] : [];
