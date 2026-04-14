/** @jsxImportSource @emotion/react */
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Text } from '@/components/text';
import { wrapper, inner, linkRow, linkItem, infoList, copyright } from './index.styles';

export function Footer() {
  const t = useTranslations('footer');
  const links = [
    {
      label: t('links.terms'),
      href: t('links.termsUrl'),
    },
    {
      label: t('links.privacy'),
      href: t('links.privacyUrl'),
    },
    {
      label: t('links.refund'),
      href: t('links.refundUrl'),
    },
  ];

  const infoKeys = [
    'businessName',
    'ceo',
    'address',
    'phone',
    'businessNumber',
    'mailOrderSalesRegistrationNumber',
    'foreignPatient',
    'venture',
    'email',
  ];
  const infoLines = infoKeys
    .map((key) => t(`info.${key}`))
    .filter((line) => line && line.trim().length > 0);

  return (
    <footer css={wrapper}>
      <div css={inner}>
        <nav css={linkRow} aria-label="Footer">
          {links.map((link) =>
            link.href ? (
              <Link
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                css={linkItem}
              >
                <Text typo="body_S" color="inherit">
                  {link.label}
                </Text>
              </Link>
            ) : (
              <span key={link.label} css={linkItem}>
                <Text typo="body_S" color="inherit">
                  {link.label}
                </Text>
              </span>
            )
          )}
        </nav>
        <div css={infoList}>
          {infoLines.map((line) => (
            <Text key={line} typo="body_S" color="text_tertiary">
              {line}
            </Text>
          ))}
        </div>
        <Text typo="button_S" color="text_secondary" css={copyright}>
          {t('copyright')}
        </Text>
      </div>
    </footer>
  );
}
