import React from 'react';
import { dun } from '@dun/decl';

export function App() {
  const playground = async () => {
    global.console.log(await dun.testUUID());
  };

  playground();
  return <>1</>;
}
