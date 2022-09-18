declare module '*.ico';
declare module '*.png';
declare module '*.svg';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.ico';

declare module '*.less' {
  const classes: { [key: string]: string };
  export default classes;
}

declare type Nullable<T> = T | undefined;
