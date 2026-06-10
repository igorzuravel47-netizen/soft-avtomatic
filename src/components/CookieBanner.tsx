import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const CONSENT_KEY = 'png-grid-local-info-consent';

interface CookieBannerProps {
  onShowTour: () => void;
}

export function CookieBanner({ onShowTour }: CookieBannerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem(CONSENT_KEY) !== 'accepted');
  }, []);

  function accept() {
    localStorage.setItem(CONSENT_KEY, 'accepted');
    setVisible(false);
  }

  function showTour() {
    accept();
    onShowTour();
  }

  if (!visible) {
    return null;
  }

  return (
    <aside className="cookie-banner editor-panel" role="dialog" aria-label={t('firstVisit.title')}>
      <div>
        <h2 className="font-display text-sm font-bold">{t('firstVisit.title')}</h2>
        <p className="mt-1 text-xs leading-5" style={{ color: 'var(--muted)' }}>
          {t('firstVisit.message')}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="editor-button editor-button-primary" onClick={accept}>
          {t('firstVisit.gotIt')}
        </button>
        <button type="button" className="editor-button" onClick={showTour}>
          {t('firstVisit.showTour')}
        </button>
      </div>
    </aside>
  );
}
