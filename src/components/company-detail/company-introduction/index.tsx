import { useState } from 'react';
import { ArrowDown } from '@/icons';
import { Text } from '@/components/text';
import { container, header, arrow, content } from './index.styles';

interface Props {
  title: string;
  children: React.ReactNode;
  showToggle?: boolean;
}

export function CompanyIntroduction({ title, children, showToggle = true }: Props) {
  const [isOpen, setIsOpen] = useState(showToggle ? false : true);

  const handleToggle = () => {
    if (!showToggle) return;
    setIsOpen((prev) => !prev);
  };

  return (
    <div css={container}>
      <div css={header(showToggle)} {...(showToggle && { onClick: handleToggle })}>
        <Text typo="title_S" color="text_primary">
          {title}
        </Text>
        {showToggle && (
          <div css={arrow(isOpen)}>
            <ArrowDown width={16} height={16} />
          </div>
        )}
      </div>

      {isOpen && <div css={content}>{children}</div>}
    </div>
  );
}
