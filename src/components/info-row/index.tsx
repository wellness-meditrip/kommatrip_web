import { useState } from 'react';
import { ArrowDown } from '@/icons';
import {
  container,
  rowHeader,
  iconWrapper,
  buttonWrapper,
  titleWrapper,
  detailWrapper,
} from './index.styles';

interface InfoRowProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  children?: React.ReactNode;
  expandable?: boolean;
  showToggleButton?: boolean;
}

export function InfoRow({
  icon,
  title,
  children,
  expandable = false,
  showToggleButton = false,
}: InfoRowProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    if (expandable) setIsOpen((prev) => !prev);
  };

  return (
    <div css={container}>
      <div css={rowHeader} onClick={handleToggle}>
        <div css={iconWrapper}>{icon}</div>
        <div css={titleWrapper}>{title}</div>

        {showToggleButton && (
          <div css={buttonWrapper(isOpen)}>
            <ArrowDown width={16} height={16} />
          </div>
        )}
      </div>

      {isOpen && <div css={detailWrapper}>{children}</div>}
    </div>
  );
}
