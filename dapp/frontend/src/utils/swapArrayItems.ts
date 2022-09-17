export const swapArrayItems = <T, _>(a: T[], i: number, j: number): T[] => {
  const isDesc = i > j;
  const start = isDesc ? j : i;
  const end = isDesc ? i : j;

  return (
    (a[start] &&
      a[end] && [
        ...a.slice(0, start),
        a[end],
        ...a.slice(start + 1, end),
        a[start],
        ...a.slice(end + 1),
      ]) ||
    a
  );
};
