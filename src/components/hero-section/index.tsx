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
  hiddenImage,
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
import { useHeroCarousel } from './use-hero-carousel';

interface HeroSectionProps {
  images: string[];
  title: string;
  placeholder: string;
  subtitle: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  isDesktop?: boolean;
  onBackClick?: () => void;
  onSearchBarClick?: () => void;
}

const FALLBACK_IMAGE = '/images/hero/hero1.webp';
const AUTOPLAY_DELAY = 3500;
const PROGRESS_TRANSITION_MS = 650;

export function HeroSection({
  images,
  title,
  placeholder,
  subtitle,
  onSearchChange,
  onSearch,
  isDesktop = false,
  onBackClick,
  onSearchBarClick,
}: HeroSectionProps) {
  const {
    currentImage,
    currentIndex,
    isCurrentImageReady,
    progressRatio,
    settledImage,
    shouldAnimateProgress,
    slidesList,
    handleCurrentImageLoad,
  } = useHeroCarousel(images, FALLBACK_IMAGE, AUTOPLAY_DELAY);

  return (
    <section
      css={section}
      style={settledImage ? { backgroundImage: `url("${settledImage}")` } : undefined}
    >
      <div css={slides} aria-hidden="true">
        <div key={currentImage} css={slide(true)}>
          <Image
            src={currentImage}
            alt=""
            fill
            sizes="100vw"
            priority={currentIndex === 0}
            fetchPriority={currentIndex === 0 ? 'high' : undefined}
            quality={75}
            css={[image, !isCurrentImageReady && settledImage && hiddenImage]}
            onLoadingComplete={handleCurrentImageLoad}
          />
        </div>
        <div css={overlay} />
      </div>

      <div css={content}>
        <div css={headerOverlay}>
          {isDesktop ? (
            <DesktopAppBar
              onSearchChange={onSearchChange}
              onSearch={onSearch}
              variant="transparent"
              onSearchBarClick={onSearchBarClick}
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
                  onInputClick={onSearchBarClick}
                  isReadOnly={true}
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
              <div
                css={progressFill(progressRatio, shouldAnimateProgress, PROGRESS_TRANSITION_MS)}
              />
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
