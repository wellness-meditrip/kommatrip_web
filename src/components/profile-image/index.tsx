import { ImgHTMLAttributes, ReactNode, useEffect, useMemo, useState } from 'react';

interface SafeProfileImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallback: ReactNode;
}

const failedProfileImageSrcs = new Set<string>();

const normalizeProfileImageSrc = (src?: string | null) => src?.trim() ?? '';

const resolveReferrerPolicy = (
  src: string
): ImgHTMLAttributes<HTMLImageElement>['referrerPolicy'] => {
  if (!/^https?:\/\//i.test(src)) {
    return undefined;
  }

  return 'no-referrer';
};

export function SafeProfileImage({
  src,
  fallback,
  alt,
  onError,
  referrerPolicy,
  ...imgProps
}: SafeProfileImageProps) {
  const normalizedSrc = useMemo(() => normalizeProfileImageSrc(src), [src]);
  const [hasLoadError, setHasLoadError] = useState(
    () => !normalizedSrc || failedProfileImageSrcs.has(normalizedSrc)
  );

  useEffect(() => {
    setHasLoadError(!normalizedSrc || failedProfileImageSrcs.has(normalizedSrc));
  }, [normalizedSrc]);

  if (hasLoadError) {
    return <>{fallback}</>;
  }

  return (
    <img
      {...imgProps}
      src={normalizedSrc}
      alt={alt}
      referrerPolicy={referrerPolicy ?? resolveReferrerPolicy(normalizedSrc)}
      onError={(event) => {
        failedProfileImageSrcs.add(normalizedSrc);
        setHasLoadError(true);
        onError?.(event);
      }}
    />
  );
}
