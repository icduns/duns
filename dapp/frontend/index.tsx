import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '~/App';
import './theme.less';
import '~/i18n';
import { dropOldCache } from '~/files-db';

async function bootstrap() {
  await dropOldCache();

  const container = document.getElementById('root');

  if (container) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
}

void bootstrap();
