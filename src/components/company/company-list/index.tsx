import { useRef, useState, useEffect } from 'react';
import { Text } from '@/components/text';
import { CompanyCard } from '@/components';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants/commons/routes';
import {
  container,
  wrapper,
  header,
  button,
  scrollContainer,
  grid,
  leftButton,
  rightButton,
} from './index.styles';
import { ChevronRight } from '@/icons';

interface CompanyListProps {
  title: string;
  companies: Array<{
    hospital_id: number;
    hospital_name: string;
    address: string;
    rating: number;
    image_url: string;
    departments: string[];
  }>;
}

export function CompanyList({ title, companies }: CompanyListProps) {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth);
    }
  };

  useEffect(() => {
    checkScrollButtons();
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', checkScrollButtons);
      return () => scrollElement.removeEventListener('scroll', checkScrollButtons);
    }
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      const currentScroll = scrollRef.current.scrollLeft;
      const targetScroll =
        direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

      scrollRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div css={container}>
      <div css={header}>
        <Text typo="title_M" color="text_primary" css={title}>
          {title}
        </Text>
        <button css={button}>
          <ChevronRight width={24} height={24} />
        </button>
      </div>
      <div css={wrapper}>
        {canScrollLeft && (
          <button css={leftButton} onClick={() => handleScroll('left')}>
            <ChevronRight width={24} height={24} style={{ transform: 'rotate(180deg)' }} />
          </button>
        )}
        <div css={scrollContainer} ref={scrollRef}>
          <div css={grid}>
            {companies.map((company) => (
              <CompanyCard
                key={company.hospital_id}
                clinicId={company.hospital_id}
                badges={company.departments}
                onClick={(companyId: number) => {
                  router.push(ROUTES.COMPANY_DETAIL(companyId));
                }}
                clinicImage={company.image_url}
                clinicName={company.hospital_name}
                clinicAddress={company.address}
                rating={company.rating}
                fixedHeight={true}
              />
            ))}
          </div>
        </div>
        {canScrollRight && (
          <button css={rightButton} onClick={() => handleScroll('right')}>
            <ChevronRight width={24} height={24} />
          </button>
        )}
      </div>
    </div>
  );
}
