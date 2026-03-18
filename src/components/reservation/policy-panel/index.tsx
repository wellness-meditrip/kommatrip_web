import { css } from '@emotion/react';
import { ChevronRight } from '@/icons';
import { theme } from '@/styles';
import { Text } from '@/components';

interface ReservationPolicyPanelProps {
  title: string;
  intro?: string;
  items?: string[];
  notice?: string;
  actionLabel?: string;
  onActionClick?: () => void;
  acceptLabel?: string;
  accepted?: boolean;
  onAcceptedChange?: (accepted: boolean) => void;
}

export function ReservationPolicyPanel({
  title,
  intro,
  items = [],
  notice,
  actionLabel,
  onActionClick,
  acceptLabel,
  accepted = false,
  onAcceptedChange,
}: ReservationPolicyPanelProps) {
  const hasPolicyBody = Boolean(intro) || items.length > 0;
  const hasAcceptance = Boolean(acceptLabel && onAcceptedChange);

  return (
    <div css={root}>
      <Text typo="title_M" color="text_primary">
        {title}
      </Text>

      {hasPolicyBody && (
        <div css={bodyBox}>
          {intro && (
            <Text typo="body_M" color="text_secondary">
              {intro}
            </Text>
          )}
          {items.length > 0 && (
            <ul css={ruleList}>
              {items.map((item, index) => (
                <li key={`${index}-${item}`}>
                  <Text typo="body_M" color="text_secondary">
                    {item}
                  </Text>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {notice && (
        <div css={noticeBox}>
          <Text typo="body_M" color="text_secondary">
            {notice}
          </Text>
        </div>
      )}

      {actionLabel && onActionClick && (
        <button type="button" css={actionButton} onClick={onActionClick}>
          <Text typo="body_M" color="text_primary">
            {actionLabel}
          </Text>
          <ChevronRight width={20} height={20} />
        </button>
      )}

      {hasAcceptance && (
        <label css={acceptRow}>
          <input
            type="checkbox"
            checked={accepted}
            onChange={(event) => onAcceptedChange?.(event.target.checked)}
            css={acceptCheckbox}
          />
          <Text typo="body_M" color="text_primary">
            {acceptLabel}
          </Text>
        </label>
      )}
    </div>
  );
}

const root = css`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

const bodyBox = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  padding: 14px 16px;
  border-radius: 14px;

  background: ${theme.colors.bg_surface2};
`;

const noticeBox = css`
  padding: 14px 16px;
  border-radius: 14px;

  background: ${theme.colors.bg_surface2};
  line-height: 1.5;
`;

const ruleList = css`
  display: flex;
  flex-direction: column;
  gap: 6px;

  margin: 0;
  padding-left: 18px;
`;

const actionButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 14px;

  background: ${theme.colors.primary10Opacity40};

  transition: background-color 0.2s ease;

  cursor: pointer;

  &:hover {
    background: ${theme.colors.primary10Opacity60};
  }
`;

const acceptRow = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const acceptCheckbox = css`
  width: 18px;
  height: 18px;
  margin: 0;
  accent-color: ${theme.colors.primary50};
`;
