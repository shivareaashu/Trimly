'use client';

import { useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import './Modal.css';

export function Modal({
  open,
  onClose,
  title,
  subtitle,
  description,
  topLabel,
  icon: Icon,
  children,
  width = 'acczite-modal-width-lg',
  contentPadding = 'acczite-modal-body-padding',
  hideHeader = false,
  scrollable = true,
}) {
  const actualWidth = width.startsWith('modal-') ? `acczite-${width}` : width;
  const actualPadding = contentPadding.startsWith('modal-') ? `acczite-${contentPadding}` : contentPadding;

  useLayoutEffect(() => {
    if (!open) return undefined;

    const scrollY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const onEsc = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onEsc);

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      window.scrollTo(0, scrollY);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div className="acczite-modal-overlay">
      <div className="acczite-modal-backdrop" onClick={onClose} />

      <div
        className={`acczite-modal-container ${actualWidth}`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {!hideHeader && (
          <div className="acczite-modal-header">
            <div className="acczite-modal-header-left">
              {Icon ? (
                <div className="acczite-modal-icon-box">
                  <Icon size={22} />
                </div>
              ) : null}
              <div className="acczite-modal-title-group">
                {topLabel ? <span className="acczite-modal-top-label">{topLabel}</span> : null}
                <h2 className="acczite-modal-title" title={title}>
                  {title}
                </h2>
                {(subtitle || description) ? (
                  <p className="acczite-modal-subtitle">{subtitle || description}</p>
                ) : null}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="acczite-modal-dismiss-btn"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div
          className={`acczite-modal-body ${actualPadding}`}
          style={{
            overflowY: scrollable ? 'auto' : 'visible',
            overflowX: 'visible',
          }}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}

export default Modal;
