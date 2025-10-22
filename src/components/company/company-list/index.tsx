import React, { useRef } from 'react';
import { Text } from '@/components/text';
import { CompanyCard } from '@/components';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants/commons/routes';
import { container, header, title, button, scrollContainer, grid } from './index.styles';
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
    </div>
  );
}
