import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const ONBOARDING_KEY = 'png-grid-onboarding-completed';

interface TourStep {
  target: string;
  title: string;
  text: string;
}

interface OnboardingTourProps {
  open: boolean;
  onClose: () => void;
}

function getTargetRect(target: string): DOMRect | null {
  return document.querySelector<HTMLElement>(`[data-tour="${target}"]`)?.getBoundingClientRect() ?? null;
}

export function OnboardingTour({ open, onClose }: OnboardingTourProps) {
  const { t } = useTranslation();
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const steps = useMemo<TourStep[]>(
    () => [
      { target: 'open-file', title: t('tour.steps.open.title'), text: t('tour.steps.open.text') },
      { target: 'canvas-editor', title: t('tour.steps.crop.title'), text: t('tour.steps.crop.text') },
      { target: 'grid-detector', title: t('tour.steps.grid.title'), text: t('tour.steps.grid.text') },
      { target: 'cell-selection', title: t('tour.steps.selection.title'), text: t('tour.steps.selection.text') },
      { target: 'export-png', title: t('tour.steps.export.title'), text: t('tour.steps.export.text') }
    ],
    [t]
  );
  const step = steps[stepIndex];

  useEffect(() => {
    if (!open) {
      return;
    }

    const update = () => setRect(getTargetRect(step.target));
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [open, step.target]);

  useEffect(() => {
    if (open) {
      setStepIndex(0);
    }
  }, [open]);

  function finish() {
    localStorage.setItem(ONBOARDING_KEY, 'completed');
    onClose();
  }

  if (!open) {
    return null;
  }

  const highlightStyle = rect
    ? {
        left: rect.left - 8,
        top: rect.top - 8,
        width: rect.width + 16,
        height: rect.height + 16
      }
    : { left: 16, top: 76, width: 280, height: 80 };
  const tooltipStyle = rect
    ? {
        left: Math.min(Math.max(16, rect.left), window.innerWidth - 380),
        top: Math.min(rect.bottom + 18, window.innerHeight - 250)
      }
    : { left: 16, top: 176 };

  return (
    <div className="tour-overlay" role="dialog" aria-modal="true" aria-label={t('tour.title')}>
      <div className="tour-highlight" style={highlightStyle} />
      <section className="tour-card editor-panel" style={tooltipStyle}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
            {t('tour.progress', { current: stepIndex + 1, total: steps.length })}
          </p>
          <button type="button" className="editor-button" onClick={finish}>
            {t('tour.skip')}
          </button>
        </div>
        <h2 className="font-display text-base font-bold">{step.title}</h2>
        <p className="mt-2 text-sm leading-6" style={{ color: 'var(--muted)' }}>
          {step.text}
        </p>
        <div className="mt-4 flex justify-between gap-2">
          <button
            type="button"
            className="editor-button"
            disabled={stepIndex === 0}
            onClick={() => setStepIndex((value) => Math.max(0, value - 1))}
          >
            {t('tour.back')}
          </button>
          {stepIndex === steps.length - 1 ? (
            <button type="button" className="editor-button editor-button-primary" onClick={finish}>
              {t('tour.done')}
            </button>
          ) : (
            <button
              type="button"
              className="editor-button editor-button-primary"
              onClick={() => setStepIndex((value) => Math.min(steps.length - 1, value + 1))}
            >
              {t('tour.next')}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
