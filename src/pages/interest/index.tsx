/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Layout, Text, SelectButton, AppBar, DesktopAppBar, RoundButton } from '@/components';
import { theme } from '@/styles';
import { css } from '@emotion/react';
import { ROUTES } from '@/constants';
import {
  CategorySpa,
  CategoryHeadSpa,
  CategoryFacialCare,
  CategoryMedicine,
  CategoryMedicalBeauty,
} from '@/icons';
import { usePostInterestMutation } from '@/queries/auth';
import { useMediaQuery, useToast, useErrorHandler } from '@/hooks';
import type { Gender, AgeGroup } from '@/models/auth';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { getI18nServerSideProps } from '@/i18n/page-props';

// 관심사 옵션
const INTEREST_OPTIONS = [
  { id: 'spa-therapy', label: 'Spa & Therapy', icon: <CategorySpa width="24px" height="24px" /> },
  { id: 'head-spa', label: 'Head Spa', icon: <CategoryHeadSpa width="24px" height="24px" /> },
  {
    id: 'facial-care',
    label: 'Facial Care',
    icon: <CategoryFacialCare width="24px" height="24px" />,
  },
  {
    id: 'traditional-medicine',
    label: 'Traditional Medicine',
    icon: <CategoryMedicine width="24px" height="24px" />,
  },
  {
    id: 'medical-beauty',
    label: 'Medical Beauty',
    icon: <CategoryMedicalBeauty width="24px" height="24px" />,
  },
  { id: 'no-select', label: 'No select', icon: <span>✕</span> },
];

// 성별 옵션
const GENDER_OPTIONS: { id: Gender; label: string; icon: React.ReactNode }[] = [
  { id: 'male', label: 'Male', icon: <span>♂</span> },
  { id: 'female', label: 'Female', icon: <span>♀</span> },
  { id: 'no-select', label: 'No select', icon: <span>✕</span> },
];

// 연령대 옵션
const AGE_GROUP_OPTIONS: { id: AgeGroup; label: string }[] = [
  { id: 'Under18', label: 'Under 18' },
  { id: '18+', label: '18+' },
  { id: '30+', label: '30+' },
  { id: '40+', label: '40 +' },
  { id: '50+', label: '50 +' },
  { id: 'Over60', label: 'Over 60' },
];

export default function InterestPage() {
  const router = useRouter();
  const t = useTranslations('interest');
  const { showToast } = useToast();
  const { showErrorToast } = useErrorHandler();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const { update } = useSession();
  const [inputValue, setInputValue] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGender, setSelectedGender] = useState<Gender | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<AgeGroup | null>(null);

  const interestMutation = usePostInterestMutation();

  const handleInterestToggle = (interestId: string) => {
    if (interestId === 'no-select') {
      setSelectedInterests([]);
      return;
    }
    setSelectedInterests((prev) => {
      if (prev.includes(interestId)) {
        return prev.filter((id) => id !== interestId);
      }
      return [...prev, interestId];
    });
  };

  const handleGenderSelect = (gender: Gender) => {
    if (gender === 'no-select') {
      setSelectedGender(null);
      return;
    }
    if (gender === selectedGender) {
      setSelectedGender(null);
    } else {
      setSelectedGender(gender);
    }
  };

  const handleAgeGroupSelect = (ageGroup: AgeGroup) => {
    if (ageGroup === selectedAgeGroup) {
      setSelectedAgeGroup(null);
    } else {
      setSelectedAgeGroup(ageGroup);
    }
  };

  const handleSubmit = () => {
    // 필수 항목 검증
    const filteredInterests = selectedInterests.filter((id) => id !== 'no-select');

    if (filteredInterests.length === 0) {
      showToast({ title: t('toast.selectInterest'), icon: 'exclaim' });
      return;
    }

    if (!selectedGender || selectedGender === 'no-select') {
      showToast({ title: t('toast.selectGender'), icon: 'exclaim' });
      return;
    }

    if (!selectedAgeGroup) {
      showToast({ title: t('toast.selectAgeGroup'), icon: 'exclaim' });
      return;
    }

    interestMutation.mutate(
      {
        Gender: selectedGender,
        AgeGroup: selectedAgeGroup,
        TopicInterest: filteredInterests,
      },
      {
        onSuccess: async () => {
          showToast({ title: t('toast.saved'), icon: 'check' });
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem('interest_done', '1');
          }
          await update({ InterestSetting: true });
          router.replace(ROUTES.HOME);
        },
        onError: (error: unknown) => {
          showErrorToast(error, { fallbackMessage: t('toast.saveFailed') });
        },
      }
    );
  };

  const handleValueChange = (value: string) => {
    setInputValue(value);
  };

  const handleSearch = () => {
    const query = inputValue.trim() ? `?q=${encodeURIComponent(inputValue)}` : '';
    router.push(`${ROUTES.SEARCH}${query}`);
  };
  const isFormValid = selectedInterests.length > 0 && selectedGender && selectedAgeGroup;

  return (
    <Layout isAppBarExist={false} title={t('title')}>
      {isDesktop ? (
        <DesktopAppBar onSearchChange={handleValueChange} onSearch={handleSearch} />
      ) : (
        <AppBar leftButton={true} buttonType="dark" onBackClick={() => router.back()} logo="dark" />
      )}
      <div css={container}>
        {/* 상단 그라데이션 배경 (모바일) */}
        <div css={gradientHeader}>
          <Text typo="body_M" color="text_secondary" css={subtitle}>
            Tell us more about you 😊 We&apos;ll curate Korean wellness programs you&apos;ll love!
          </Text>
        </div>

        <div css={content}>
          {/* 관심사 등록 폼 */}
          <div css={formSection}>
            {/* Interests Section */}
            <div css={section}>
              <Text typo="title_M" color="text_primary" css={sectionTitle}>
                Interests
              </Text>
              <div css={interestGrid}>
                {INTEREST_OPTIONS.map((option) => (
                  <SelectButton
                    key={option.id}
                    label={option.label}
                    icon={option.icon}
                    isSelected={selectedInterests.includes(option.id)}
                    onClick={() => handleInterestToggle(option.id)}
                    variant="square"
                  />
                ))}
              </div>
            </div>

            {/* Gender Section */}
            <div css={section}>
              <Text typo="title_M" color="text_primary" css={sectionTitle}>
                Gender
              </Text>
              <div css={genderContainer}>
                {GENDER_OPTIONS.map((option) => (
                  <SelectButton
                    key={option.id}
                    label={option.label}
                    icon={option.icon}
                    isSelected={selectedGender === option.id}
                    onClick={() => handleGenderSelect(option.id)}
                    variant="rectangular"
                  />
                ))}
              </div>
            </div>

            {/* Age Group Section */}
            <div css={section}>
              <Text typo="title_M" color="text_primary" css={sectionTitle}>
                Select Your Age Group
              </Text>
              <div css={ageGroupContainer}>
                {AGE_GROUP_OPTIONS.map((option) => (
                  <SelectButton
                    key={option.id}
                    label={option.label}
                    isSelected={selectedAgeGroup === option.id}
                    onClick={() => handleAgeGroupSelect(option.id)}
                    variant="rounded"
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div css={submitContainer}>
              <RoundButton
                size="L"
                fullWidth
                type="button"
                onClick={handleSubmit}
                disabled={!isFormValid || interestMutation.isPending}
                css={submitButtonStyle}
              >
                <Text typo="button_L" color="white">
                  {interestMutation.isPending ? 'Submitting...' : 'Submit'}
                </Text>
              </RoundButton>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

const container = css`
  display: flex;
  flex-direction: column;
  background-color: ${theme.colors.bg_default};

  @media (min-width: ${theme.breakpoints.desktop}) {
    align-items: center;
    justify-content: center;
    padding: 40px;
    background-color: ${theme.colors.bg_default};
  }
`;

const gradientHeader = css`
  position: relative;
  width: 100%;
  padding: 20px 20px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const subtitle = css`
  margin-top: 12px;
  line-height: 1.5;
  text-align: center;
`;

const content = css`
  width: 100%;
  padding: 0 20px 40px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 480px;
    max-width: 480px;
    padding: 0;
    flex: 0 0 auto;
  }
`;

const formSection = css`
  background-color: ${theme.colors.white};
  border-radius: 20px 20px 0 0;
  padding: 32px 24px 40px;
  margin-top: -20px;
  position: relative;
  z-index: 1;
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 480px;
    max-width: 480px;
    border-radius: 20px;
    padding: 40px 40px;
    margin-top: 0;
  }
`;

const section = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;

  &:last-of-type {
    margin-bottom: 0;
  }
`;

const sectionTitle = css`
  font-weight: 600;
`;

const interestGrid = css`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
`;

const genderContainer = css`
  display: flex;
  gap: 8px;
`;

const ageGroupContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const submitContainer = css`
  margin-top: 16px;
  width: 100%;
  display: flex;
  justify-content: center;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 100%;
  }
`;

const submitButtonStyle = css`
  width: 100%;

  @media (min-width: ${theme.breakpoints.desktop}) {
    width: 480px;
    max-width: 480px;
  }
`;

export const getServerSideProps = getI18nServerSideProps(['interest']);
