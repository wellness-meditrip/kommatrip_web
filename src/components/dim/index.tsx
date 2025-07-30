import { wrapper } from './index.styles';

interface DimProps {
  fullScreen?: boolean;
  onClick?: () => void;
}

export function Dim({ fullScreen = false, onClick }: DimProps) {
  return <div css={wrapper({ fullScreen })} onClick={onClick} />;
}
