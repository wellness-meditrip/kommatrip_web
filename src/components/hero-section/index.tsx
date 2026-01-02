import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { AppBar } from '@/components/app-bar';
import { DesktopAppBar } from '@/components/desktop-app-bar';
import { SearchBar } from '@/components/search-bar';
import { Text } from '@/components/text';
import {
  section,
  slides,
  slide,
  image,
  overlay,
  content,
  headerOverlay,
  searchBarWrapper,
  heroContent,
  heroTitle,
  heroSubtitle,
  progressRow,
  progressTrack,
  progressFill,
  progressCount,
} from './index.styles';

interface HeroSectionProps {
  images: string[];
  title: string;
  placeholder: string;
  subtitle: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  isDesktop?: boolean;
  onBackClick?: () => void;
}

const FALLBACK_IMAGE = '/images/hero/hero1.webp';
const AUTOPLAY_DELAY = 3500;

export function HeroSection({
  images,
  title,
  placeholder,
  subtitle,
  onSearchChange,
  onSearch,
  isDesktop = false,
  onBackClick,
}: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const slidesList = useMemo(() => (images.length > 0 ? images : [FALLBACK_IMAGE]), [images]);

  useEffect(() => {
    if (slidesList.length < 2) return;
    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slidesList.length);
    }, AUTOPLAY_DELAY);
    return () => window.clearInterval(interval);
  }, [slidesList.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [slidesList]);

  const backgroundImage = slidesList[0] || FALLBACK_IMAGE;

  return (
    <section css={section} style={{ backgroundImage: `url("${backgroundImage}")` }}>
      <div css={slides} aria-hidden="true">
        {slidesList.map((src, idx) => (
          <div key={src} css={slide(idx === currentIndex)}>
            <Image src={src} alt="" fill sizes="100vw" priority={idx === 0} css={image} />
          </div>
        ))}
        <div css={overlay} />
      </div>

      <div css={content}>
        <div css={headerOverlay}>
          {isDesktop ? (
            <DesktopAppBar
              onSearchChange={onSearchChange}
              onSearch={onSearch}
              variant="transparent"
            />
          ) : (
            <>
              <AppBar onBackClick={onBackClick} logo="light" />
              <div css={searchBarWrapper}>
                <SearchBar
                  onValueChange={onSearchChange}
                  onSearch={onSearch}
                  placeholder={placeholder}
                  isLeft={true}
                />
              </div>
            </>
          )}
        </div>

        <div css={heroContent}>
          <Text typo="body_L" color="white" css={heroSubtitle}>
            {subtitle}
          </Text>
          <Text typo="title_L" color="white" css={heroTitle}>
            {title}
          </Text>
          <div css={progressRow}>
            <div css={progressTrack}>
              <div css={progressFill((currentIndex + 1) / slidesList.length)} />
            </div>
            {!isDesktop && (
              <span css={progressCount}>
                {String(currentIndex + 1).padStart(2, '0')} /{' '}
                {String(slidesList.length).padStart(2, '0')}
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
