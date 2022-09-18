export const truncateText = (value: string, maxLength = 32) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
