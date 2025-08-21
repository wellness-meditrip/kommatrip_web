import React from 'react';
import { Text } from '@/components/text';
import ClinicCard from '@/components/clinic/clinic-card';
import { useRouter } from 'next/router';
import { ROUTES } from '@/constants/commons/routes';
import { container, title, grid } from './index.styles';

interface RecommendedClinicsProps {
  clinics: Array<{
    hospital_id: number;
    hospital_name: string;
    address: string;
    rating: number;
    image_url: string;
    departments: string[];
  }>;
}

export function RecommendedClinics({ clinics }: RecommendedClinicsProps) {
  const router = useRouter();

  return (
    <div css={container}>
      <Text typo="title_M" color="text_primary" css={title}>
        이런 한의원은 어떠세요?
      </Text>
      <div css={grid}>
        {clinics.map((clinic) => (
          <ClinicCard
            key={clinic.hospital_id}
            clinicId={clinic.hospital_id}
            badges={clinic.departments}
            onClick={(clinicId: number) => {
              router.push(ROUTES.CLINICS_DETAIL(clinicId));
            }}
            clinicImage={clinic.image_url}
            clinicName={clinic.hospital_name}
            clinicAddress={clinic.address}
            rating={clinic.rating}
            fixedHeight={true}
          />
        ))}
      </div>
    </div>
  );
}
