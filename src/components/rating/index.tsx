import { ReviewStarFilled, ReviewStarUnfilled } from '../../icons';
import { wrapper } from './index.styles';

interface Props {
  rate: 1 | 2 | 3 | 4 | 5;
  size?: 'S' | 'L';
}

export function Rating({ rate, size = 'S' }: Props) {
  return (
    <div css={wrapper({ size })}>
      {size === 'S'
        ? Array.from({ length: 5 }, (_, index) => (
            <span key={index}>
              {index < rate ? (
                <ReviewStarFilled width={12} height={11} />
              ) : (
                <ReviewStarUnfilled width={12} height={11} />
              )}
            </span>
          ))
        : Array.from({ length: 5 }, (_, index) => (
            <span key={index}>
              {index < rate ? (
                <ReviewStarFilled width={26} height={25} />
              ) : (
                <ReviewStarUnfilled width={26} height={25} />
              )}
            </span>
          ))}
    </div>
  );
}
