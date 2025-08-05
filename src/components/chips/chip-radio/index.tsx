import { ChangeEvent } from 'react';
import { Text } from '../../text';
import { Size } from './index.types';
import { chipRadio } from './index.styles';
import { Service } from '../../../types';

interface Props {
  name?: string;
  label: string;
  value: unknown;
  isSelected?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  size?: Size;
  service?: Service;
}

export function ChipRadio({
  name = 'chip-radio-group',
  isSelected = false,
  label,
  value,
  onChange,
  size = 'fluid',
  service = 'daengle',
}: Props) {
  return (
    <label css={chipRadio({ isSelected, size, service })}>
      <input type="radio" name={name} value={String(value)} onChange={onChange} />
      <Text
        typo="body10"
        color={isSelected ? (service === 'partner' ? 'green200' : 'blue200') : 'gray500'}
      >
        {label}
      </Text>
    </label>
  );
}
