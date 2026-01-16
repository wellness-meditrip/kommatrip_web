import { css } from '@emotion/react';
import { theme } from '@/styles';

export const floatingButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: ${theme.zIndex.fab};

  width: 56px;
  height: 56px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 50%;

  background: ${theme.colors.primary10};
  box-shadow: 0 8px 20px ${theme.colors.shadow_default};

  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;

  cursor: pointer;

  &:hover {
    transform: translateY(-2px);

    box-shadow: 0 10px 24px ${theme.colors.shadow_default};
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: ${theme.breakpoints.tablet}) {
    right: 16px;
    bottom: calc(${theme.size.gnbHeight} + 16px);
  }
`;

export const modalWrapper = css`
  display: flex;
  flex-direction: column;
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: ${theme.zIndex.dialog};
  overflow: hidden;

  width: 380px;
  height: 640px;
  border-radius: 24px;

  background: ${theme.colors.bg_surface1};
  box-shadow: 0 20px 40px rgb(0 0 0 / 20%);

  @media (max-width: ${theme.breakpoints.tablet}) {
    right: 0;
    bottom: 0;

    width: 100%;
    height: 100%;
    border-radius: 0;
  }
`;

export const modalHeader = css`
  display: grid;
  grid-template-columns: 40px 1fr 40px;

  align-items: center;

  padding: 16px;
  border-bottom: 1px solid ${theme.colors.border_default};

  background: ${theme.colors.bg_surface1};
`;

export const headerButton = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;

  background: ${theme.colors.white};

  transition: background-color 0.2s ease;

  cursor: pointer;

  &:hover {
    background: ${theme.colors.bg_default};
  }

  &:disabled {
    opacity: 0;

    cursor: default;
  }
`;

export const headerTitle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const modalBody = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

export const scrollArea = css`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 16px;
  overflow-y: auto;

  padding: 16px;
`;

export const startNewChatButton = css`
  display: flex;
  align-items: center;
  gap: 12px;

  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.primary30};
  border-radius: 16px;

  background: ${theme.colors.primary10};

  transition: background-color 0.2s ease;

  cursor: pointer;

  &:hover {
    background: ${theme.colors.primary10Opacity60};
  }
`;

export const sectionTitle = css`
  display: flex;
  align-items: center;
  gap: 8px;

  margin-top: 8px;
`;

export const sessionList = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const sessionItem = css`
  display: block;
  position: relative;

  &[data-reveal='true'] .chat-session-delete {
    opacity: 1;

    transform: translate(0, -50%);
    pointer-events: auto;
  }

  &[data-reveal='true'] .chat-session-button {
    width: calc(100% - 52px);
    padding-right: 56px;
  }
`;

export const sessionButton = css`
  display: block;

  width: 100%;
  padding: 14px 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 14px;

  background: ${theme.colors.white};
  text-align: left;

  transition:
    padding-right 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;

  cursor: pointer;
  box-sizing: border-box;

  &:hover {
    background: ${theme.colors.bg_default};
    border-color: ${theme.colors.primary10};
  }
`;

export const sessionRevealZone = css`
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;

  width: 30%;
  height: 100%;
`;

export const sessionDeleteButton = css`
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translate(16px, -50%);
  z-index: 2;

  width: 36px;
  height: 36px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 10px;

  background: ${theme.colors.white};

  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    background-color 0.2s ease,
    border-color 0.2s ease;

  cursor: pointer;
  opacity: 0;
  pointer-events: none;

  &:hover {
    background: ${theme.colors.bg_default};
    border-color: ${theme.colors.primary10};
  }
`;

export const messageRow = (role: 'assistant' | 'user') => css`
  display: flex;
  align-items: flex-end;
  justify-content: ${role === 'user' ? 'flex-end' : 'flex-start'};
  gap: 8px;
`;

export const messageContentRow = css`
  display: inline-flex;
  align-items: flex-end;
`;

export const messageBubble = (role: 'assistant' | 'user') => css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  max-width: 78%;
  padding: 12px 14px;
  border: 1px solid ${role === 'user' ? theme.colors.primary10 : theme.colors.border_default};
  border-radius: 16px;

  background: ${role === 'user' ? theme.colors.primary10 : theme.colors.white};
  box-shadow: 0 6px 12px rgb(0 0 0 / 5%);
`;

export const assistantHeader = css`
  display: flex;
  align-items: center;
  gap: 8px;

  margin-bottom: 6px;
`;

export const assistantAvatar = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 28px;
  height: 28px;
  border-radius: 50%;

  background: ${theme.colors.primary10};
  color: ${theme.colors.primary50};
`;

export const assistantName = css`
  font-weight: 600;
`;

export const messageTime = (role: 'assistant' | 'user') => css`
  align-self: flex-end;

  color: ${theme.colors.text_tertiary};
  white-space: nowrap;
  ${role === 'user' ? 'margin-right: 4px;' : 'margin-left: 4px;'}
`;

export const optionBubble = css`
  width: 100%;
  max-width: 100%;
`;

export const assistantLabel = css`
  display: inline-flex;

  padding: 4px 8px;
  border-radius: 999px;

  background: ${theme.colors.primary10};
  align-self: flex-start;
`;

export const optionCard = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  padding: 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 18px;

  background: ${theme.colors.white};
`;

export const optionGrid = (columns: number, mobileColumns = columns) => css`
  display: grid;
  align-items: start;
  gap: 10px;
  grid-template-columns: repeat(${columns}, minmax(0, 1fr));

  @media (max-width: ${theme.breakpoints.tablet}) {
    grid-template-columns: repeat(${mobileColumns}, minmax(0, 1fr));
  }
`;

export const optionButton = css`
  display: flex;
  align-items: center;
  justify-content: center;

  height: auto;
  padding: 8px 10px;
  border: 1px solid ${theme.colors.primary30};
  border-radius: 8px;

  background: ${theme.colors.white};
  color: ${theme.colors.text_secondary};
  line-height: 1.2;
  text-align: center;
  white-space: normal;

  transition:
    background-color 0.2s ease,
    color 0.2s ease;

  cursor: pointer;
  align-self: start;

  &[data-selected='true'] {
    background: ${theme.colors.primary10};
    color: ${theme.colors.text_primary};
    font-weight: 600;
  }
`;

export const suggestionList = css`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const suggestionButton = css`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${theme.colors.primary30};
  border-radius: 14px;

  background: ${theme.colors.white};
  color: ${theme.colors.text_primary};
  text-align: left;

  transition: background-color 0.2s ease;

  cursor: pointer;

  &[data-active='true'] {
    background: ${theme.colors.primary10};
  }
`;

export const dateHeader = css`
  display: flex;
  justify-content: center;

  margin-bottom: 12px;
`;

export const loadingLottie = css`
  width: 48px;
  height: 24px;
`;

export const inputArea = css`
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding: 12px 16px 16px;

  background: ${theme.colors.bg_surface1};
  border-top: 1px solid ${theme.colors.border_default};
`;

export const inputRow = css`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const inputField = css`
  flex: 1;

  padding: 10px 12px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 14px;

  background: ${theme.colors.white};
  color: ${theme.colors.text_primary};
  font-size: 14px;

  &:disabled {
    background: ${theme.colors.bg_default};
    color: ${theme.colors.text_disabled};
  }
`;

export const sendButton = css`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;
  border: 1px solid ${theme.colors.primary30};
  border-radius: 50%;

  background: ${theme.colors.primary10};

  transition: background-color 0.2s ease;

  cursor: pointer;

  & svg {
    transform: rotate(-90deg);
  }

  &:disabled {
    background: ${theme.colors.gray200};
    border-color: ${theme.colors.gray300};

    cursor: not-allowed;
  }
`;

export const limitNotice = css`
  text-align: center;
`;
