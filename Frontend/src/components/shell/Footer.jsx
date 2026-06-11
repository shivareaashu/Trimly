import { useTranslation } from '../../hooks/useTranslation';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="flex flex-col gap-2 border-t border-border/50 px-5 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
      <span>Trimly v1.0</span>
      <div className="flex items-center gap-4">
        <a className="transition hover:text-foreground" href="/terms">{t('footer_terms')}</a>
        <a className="transition hover:text-foreground" href="/privacy">{t('footer_privacy')}</a>
        <a className="transition hover:text-foreground" href="/support">{t('footer_support')}</a>
      </div>
    </footer>
  );
}

export default Footer;
