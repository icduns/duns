import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '~/App';
import favicon from './assets/favicon.ico';

import 'antd/dist/antd.css';

function setFavicon() {
  const faviconElement = document.createElement('link');
  faviconElement.rel = 'icon';
  faviconElement.href = favicon;
  document.head.appendChild(faviconElement);
}

function bootstrap() {
  setFavicon();

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
