import { motion } from 'framer-motion';
import { bar, wrapper } from './index.styles';
import { Text } from '../../text';

interface Props {
  id: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export function Tab({ label, isActive, onClick }: Props) {
  return (
    <div css={wrapper} onClick={onClick}>
      <Text tag="h2" typo="title_S" color={isActive ? 'primary50' : 'text_disabled'}>
        {label}
      </Text>
      {isActive && <motion.div layoutId="underline" css={bar} />}
    </div>
  );
}
