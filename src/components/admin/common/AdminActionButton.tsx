import type { MouseEventHandler, ReactNode } from 'react';
import Link from 'next/link';
import {
  adminInlineDangerButton,
  adminInlineGhostButton,
  adminInlinePrimaryButton,
} from '@/components/admin/admin-console.styles';

type AdminActionButtonVariant = 'ghost' | 'primary' | 'danger';

type ButtonLikeProps = {
  children: ReactNode;
  variant?: AdminActionButtonVariant;
  href?: undefined;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
};

type LinkLikeProps = {
  children: ReactNode;
  variant?: AdminActionButtonVariant;
  href: string;
  prefetch?: boolean;
};

type AdminActionButtonProps = ButtonLikeProps | LinkLikeProps;

const resolveActionButtonCss = (variant: AdminActionButtonVariant) => {
  switch (variant) {
    case 'primary':
      return adminInlinePrimaryButton;
    case 'danger':
      return adminInlineDangerButton;
    case 'ghost':
    default:
      return adminInlineGhostButton;
  }
};

export function AdminActionButton(props: AdminActionButtonProps) {
  const variant = props.variant ?? 'ghost';
  const buttonCss = resolveActionButtonCss(variant);

  if ('href' in props && typeof props.href === 'string') {
    const { href, prefetch, children } = props;

    return (
      <Link href={href} prefetch={prefetch} css={buttonCss}>
        {children}
      </Link>
    );
  }

  const { children, type = 'button', onClick, disabled } = props;

  return (
    <button type={type} css={buttonCss} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
