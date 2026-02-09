import { useTranslations } from 'next-intl';
import { Empty } from '@/components/empty';
import { normalizeError } from '@/utils/error-handler';

interface PageErrorEmptyProps {
  error?: unknown;
  fallbackMessage: string;
  statusOverride?: number;
  messageOverride?: string;
}

export function PageErrorEmpty({
  error,
  fallbackMessage,
  statusOverride,
  messageOverride,
}: PageErrorEmptyProps) {
  const tCommon = useTranslations('common');
  const normalized = normalizeError(error);
  const status = statusOverride ?? normalized.status;

  const title =
    messageOverride ??
    (status === 404
      ? tCommon('error.notFound')
      : status && status >= 500
        ? tCommon('error.serverError')
        : fallbackMessage);

  return <Empty title={title} />;
}
