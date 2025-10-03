import React from 'react';
import { Text } from '@/components/text';
import CompanyCard from '@/components/company/company-card';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants/commons/routes';
import { container, title, grid } from './index.styles';

interface RecommendedCompaniesProps {
  companies: Array<{
    hospital_id: number;
    hospital_name: string;
    address: string;
    rating: number;
    image_url: string;
    departments: string[];
  }>;
}

export function RecommendedCompanies({ companies }: RecommendedCompaniesProps) {
  const router = useRouter();

  return (
    <div css={container}>
      <Text typo="title_M" color="text_primary" css={title}>
        이런 한의원은 어떠세요?
      </Text>
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
  );
}
