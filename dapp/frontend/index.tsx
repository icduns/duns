import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '~/App';
import './theme.less';

import './i18n';

function bootstrap() {
  const container = document.getElementById('root');

  if (container) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

bootstrap();
