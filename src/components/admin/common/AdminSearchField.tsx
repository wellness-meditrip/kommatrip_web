import type { InputHTMLAttributes, ReactNode } from 'react';
import type { Interpolation, Theme } from '@emotion/react';
import { css } from '@emotion/react';
import {
  adminConsolePalette,
  adminSearchBox,
  adminSearchIcon,
  adminSearchInput,
} from '@/components/admin/admin-console.styles';

type AdminSearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  icon?: ReactNode;
  containerCss?: Interpolation<Theme>;
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'placeholder'>;
};

export function AdminSearchField({
  value,
  onChange,
  placeholder,
  label,
  icon = '⌕',
  containerCss,
  inputProps,
}: AdminSearchFieldProps) {
  return (
    <label css={[adminSearchBox, containerCss]}>
      {label ? <span css={fieldLabel}>{label}</span> : null}
      {icon ? <span css={adminSearchIcon}>{icon}</span> : null}
      <input
        {...inputProps}
        css={adminSearchInput}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

const fieldLabel = css`
  color: ${adminConsolePalette.textSubtle};
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
`;
