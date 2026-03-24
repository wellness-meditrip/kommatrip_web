import { useEffect, useMemo, useReducer, useRef } from 'react';

const PROGRESS_RESET_DELAY_MS = 32;

interface HeroCarouselState {
  currentIndex: number;
  settledImage: string;
  isCurrentImageReady: boolean;
  progressRatio: number;
  shouldAnimateProgress: boolean;
}

type HeroCarouselAction =
  | {
      type: 'reset';
      image: string;
      isReady: boolean;
      slidesLength: number;
    }
  | {
      type: 'setCurrent';
      index: number;
      isReady: boolean;
    }
  | {
      type: 'markReady';
      image: string;
    }
  | {
      type: 'setProgress';
      ratio: number;
      shouldAnimate: boolean;
    };

const INITIAL_STATE: HeroCarouselState = {
  currentIndex: 0,
  settledImage: '',
  isCurrentImageReady: false,
  progressRatio: 0,
  shouldAnimateProgress: false,
};

const heroCarouselReducer = (
  state: HeroCarouselState,
  action: HeroCarouselAction
): HeroCarouselState => {
  switch (action.type) {
    case 'reset': {
      const nextProgressRatio = action.slidesLength <= 1 ? 1 : 0;
      const nextSettledImage = action.isReady ? action.image : state.settledImage;

      if (
        state.currentIndex === 0 &&
        state.settledImage === nextSettledImage &&
        state.isCurrentImageReady === action.isReady &&
        state.progressRatio === nextProgressRatio &&
        state.shouldAnimateProgress === false
      ) {
        return state;
      }

      return {
        currentIndex: 0,
        settledImage: nextSettledImage,
        isCurrentImageReady: action.isReady,
        progressRatio: nextProgressRatio,
        shouldAnimateProgress: false,
      };
    }

    case 'setCurrent':
      if (state.currentIndex === action.index && state.isCurrentImageReady === action.isReady) {
        return state;
      }

      return {
        ...state,
        currentIndex: action.index,
        isCurrentImageReady: action.isReady,
      };

    case 'markReady':
      if (state.isCurrentImageReady && state.settledImage === action.image) {
        return state;
      }

      return {
        ...state,
        settledImage: action.image,
        isCurrentImageReady: true,
      };

    case 'setProgress':
      if (
        state.progressRatio === action.ratio &&
        state.shouldAnimateProgress === action.shouldAnimate
      ) {
        return state;
      }

      return {
        ...state,
        progressRatio: action.ratio,
        shouldAnimateProgress: action.shouldAnimate,
      };

    default:
      return state;
  }
};

export const useHeroCarousel = (images: string[], fallbackImage: string, autoplayDelay: number) => {
  const loadedImagesRef = useRef<Set<string>>(new Set());
  const [state, dispatch] = useReducer(heroCarouselReducer, INITIAL_STATE);
  const slidesKey = useMemo(
    () => JSON.stringify(images.length > 0 ? images : [fallbackImage]),
    [fallbackImage, images]
  );
  const slidesList = useMemo(() => JSON.parse(slidesKey) as string[], [slidesKey]);
  const safeCurrentIndex = state.currentIndex < slidesList.length ? state.currentIndex : 0;
  const currentImage = slidesList[safeCurrentIndex] || fallbackImage;

  useEffect(() => {
    const initialImage = slidesList[0] || fallbackImage;
    dispatch({
      type: 'reset',
      image: initialImage,
      isReady: loadedImagesRef.current.has(initialImage),
      slidesLength: slidesList.length,
    });
  }, [fallbackImage, slidesKey, slidesList]);

  useEffect(() => {
    if (slidesList.length > 1) {
      const nextImage = slidesList[(safeCurrentIndex + 1) % slidesList.length];

      if (nextImage && !loadedImagesRef.current.has(nextImage)) {
        const preloadImage = new window.Image();
        preloadImage.onload = () => {
          loadedImagesRef.current.add(nextImage);
        };
        preloadImage.src = nextImage;
      }
    }

    if (!state.isCurrentImageReady) return;

    const nextProgressRatio =
      slidesList.length <= 1 ? 1 : (safeCurrentIndex + 1) / slidesList.length;
    let progressTimeoutId: number | null = null;
    let autoplayTimeoutId: number | null = null;

    if (slidesList.length <= 1) {
      dispatch({ type: 'setProgress', ratio: 1, shouldAnimate: false });
    } else if (safeCurrentIndex === 0) {
      dispatch({ type: 'setProgress', ratio: 0, shouldAnimate: false });
      progressTimeoutId = window.setTimeout(() => {
        dispatch({ type: 'setProgress', ratio: nextProgressRatio, shouldAnimate: true });
      }, PROGRESS_RESET_DELAY_MS);
    } else {
      dispatch({ type: 'setProgress', ratio: nextProgressRatio, shouldAnimate: true });
    }

    if (slidesList.length > 1) {
      autoplayTimeoutId = window.setTimeout(() => {
        const nextIndex = (safeCurrentIndex + 1) % slidesList.length;
        const nextImage = slidesList[nextIndex] || fallbackImage;

        dispatch({
          type: 'setCurrent',
          index: nextIndex,
          isReady: loadedImagesRef.current.has(nextImage),
        });
      }, autoplayDelay);
    }

    return () => {
      if (progressTimeoutId !== null) {
        window.clearTimeout(progressTimeoutId);
      }

      if (autoplayTimeoutId !== null) {
        window.clearTimeout(autoplayTimeoutId);
      }
    };
  }, [autoplayDelay, fallbackImage, slidesList, safeCurrentIndex, state.isCurrentImageReady]);

  const handleCurrentImageLoad = () => {
    loadedImagesRef.current.add(currentImage);
    dispatch({ type: 'markReady', image: currentImage });
  };

  return {
    currentImage,
    currentIndex: safeCurrentIndex,
    isCurrentImageReady: state.isCurrentImageReady,
    progressRatio: state.progressRatio,
    settledImage: state.settledImage,
    shouldAnimateProgress: state.shouldAnimateProgress,
    slidesList,
    handleCurrentImageLoad,
  };
};
