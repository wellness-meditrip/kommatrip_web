import { css } from '@emotion/react';
import { ADMIN_BACKEND_TARGET_LABELS, type AdminBackendTarget } from '@/constants/admin-backend';
import { adminConsolePalette } from './admin-console.styles';

interface AdminBackendTargetSelectorProps {
  value: AdminBackendTarget;
  onChange: (target: AdminBackendTarget) => void;
  isTestEnabled: boolean;
  disabled?: boolean;
  compact?: boolean;
}

const BACKEND_TARGETS: AdminBackendTarget[] = ['prod', 'test'];

export function AdminBackendTargetSelector({
  value,
  onChange,
  isTestEnabled,
  disabled = false,
  compact = false,
}: AdminBackendTargetSelectorProps) {
  return (
    <div css={selectorShell(compact)}>
      <div css={buttonRow}>
        {BACKEND_TARGETS.map((target) => {
          const isActive = target === value;
          const isTargetDisabled = disabled || (target === 'test' && !isTestEnabled);

          return (
            <button
              key={target}
              type="button"
              css={targetButton(isActive)}
              disabled={isTargetDisabled}
              onClick={() => onChange(target)}
            >
              {ADMIN_BACKEND_TARGET_LABELS[target]}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const selectorShell = (compact: boolean) => css`
  width: 100%;
  min-width: ${compact ? '240px' : '100%'};
`;

const buttonRow = css`
  display: flex;
  width: 100%;
  gap: 8px;
  flex-wrap: nowrap;
`;

const targetButton = (isActive: boolean) => css`
  flex: 1 1 0;
  min-width: 0;
  min-height: 42px;
  padding: 0 14px;
  border-radius: 14px;
  border: 1px solid ${isActive ? adminConsolePalette.accent : adminConsolePalette.borderSoft};
  background: ${isActive ? 'rgba(132, 155, 130, 0.18)' : 'rgba(255, 255, 255, 0.03)'};
  color: ${isActive ? adminConsolePalette.textStrong : adminConsolePalette.textSubtle};
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    color 0.2s ease;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;
