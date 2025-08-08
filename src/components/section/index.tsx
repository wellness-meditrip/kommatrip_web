import React from 'react';
import { Text } from '@/components';
import { wrapper } from './index.styles';

interface Props {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: Props): JSX.Element {
  return (
    <section css={wrapper}>
      <Text typo="subtitle3" color="gray700">
        {title}
      </Text>

      {children}
    </section>
  );
}
