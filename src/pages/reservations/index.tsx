import { useEffect, useMemo, useState } from 'react';
import {
  AppBar,
  Layout,
  CTAButton,
  LoginModal,
  Loading,
  Empty,
  CompanyInfoCard,
  ProgramSection,
  ContactSection,
  InquiriesSection,
  ScheduleSection,
} from '@/components';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { PaymentLocation } from '@/icons';
import { useRequireAuth, useToast } from '@/hooks';
import { useGetCompanyDetailQuery } from '@/queries/company';
import { useGetProgramCompanyListQuery } from '@/queries/program';
import { ROUTES } from '@/constants';
import { CompanyDetail } from '@/models';
import { useCurrentLocale } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function ReservationPage() {
  const router = useRouter();
  const t = useTranslations('reservation');
  const { showLoginModal, setShowLoginModal, isAuthenticated, isLoading, handleDismissModal } =
    useRequireAuth(true);
  const { showToast } = useToast();
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : currentLocale === 'ja' ? 'ja-JP' : 'en-US';
  const companyIdQuery = Array.isArray(router.query.companyId)
    ? router.query.companyId[0]
    : router.query.companyId;
  const [prefetchedCompany, setPrefetchedCompany] = useState<CompanyDetail | null>(null);
  const resolvedCompanyId = useMemo(() => {
    if (Number.isFinite(Number(companyIdQuery)) && Number(companyIdQuery) > 0) {
      return Number(companyIdQuery);
    }
    return prefetchedCompany?.id ?? 0;
  }, [companyIdQuery, prefetchedCompany]);
  const hasValidCompanyId = Number.isFinite(resolvedCompanyId) && resolvedCompanyId > 0;
  const { data: companyData, isLoading: isCompanyLoading } = useGetCompanyDetailQuery({
    companyId: resolvedCompanyId,
  });
  const { data: programList, isLoading: isProgramLoading } = useGetProgramCompanyListQuery({
    company_id: resolvedCompanyId,
  });
  const company = companyData?.company ?? prefetchedCompany;
  const programs = programList?.programs ?? [];
  const contactMethods = useMemo(
    () => [
      { value: 'line', label: t('form.contact.methods.line') },
      { value: 'whatsapp', label: t('form.contact.methods.whatsapp') },
      { value: 'kakao', label: t('form.contact.methods.kakao') },
      { value: 'phone', label: t('form.contact.methods.phone') },
    ],
    [t]
  );
  const languageOptions = useMemo(
    () => [
      { value: 'korean', label: t('form.contact.languages.korean') },
      { value: 'english', label: t('form.contact.languages.english') },
      { value: 'chinese', label: t('form.contact.languages.chinese') },
      { value: 'japanese', label: t('form.contact.languages.japanese') },
    ],
    [t]
  );
  const commonConcerns = useMemo(
    () => [
      t('form.inquiries.concerns.firstTime'),
      t('form.inquiries.concerns.sensitiveSkin'),
      t('form.inquiries.concerns.needEnglish'),
      t('form.inquiries.concerns.gentlePressure'),
      t('form.inquiries.concerns.specificAreas'),
    ],
    [t]
  );

  // Toggle states for sections
  const [isProgramsOpen, setIsProgramsOpen] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(true);
  const [isInquiriesOpen, setIsInquiriesOpen] = useState(true);

  // Programs
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);

  // Contact Information
  const [email, setEmail] = useState('');
  const [selectedContactMethod, setSelectedContactMethod] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [language, setLanguage] = useState('korean');

  // Inquiries
  const [inquiryText, setInquiryText] = useState('');

  // Reservation - dates (max 2)
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Reservation - times (max 3 per date)
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string[] }>({});

  // Time selection visibility toggle for each date
  const [timeSelectionOpen, setTimeSelectionOpen] = useState<{ [key: string]: boolean }>({});
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8)); // September 2025

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedCompany = window.sessionStorage.getItem('reservation_company');
    if (!storedCompany) return;
    try {
      const parsed = JSON.parse(storedCompany) as CompanyDetail;
      setPrefetchedCompany(parsed);
    } catch {
      window.sessionStorage.removeItem('reservation_company');
    }
  }, []);

  useEffect(() => {
    const programIdQuery = router.query.programId;
    if (!programIdQuery || selectedProgramId) return;
    const parsed =
      typeof programIdQuery === 'string' ? Number(programIdQuery) : Number(programIdQuery[0]);
    if (Number.isFinite(parsed) && parsed > 0) {
      setSelectedProgramId(parsed);
    }
  }, [router.query.programId, selectedProgramId]);

  // 로딩 중이면 대기
  if (isLoading) {
    return (
      <Layout isAppBarExist={false}>
        <AppBar
          onBackClick={router.back}
          leftButton={true}
          buttonType="dark"
          title={t('title')}
          backgroundColor="bg_surface1"
        />
      </Layout>
    );
  }

  // 비회원인 경우 페이지 내용을 숨기고 모달만 표시
  if (!isAuthenticated) {
    return (
      <Layout isAppBarExist={false}>
        <AppBar
          onBackClick={router.back}
          leftButton={true}
          buttonType="dark"
          title={t('title')}
          backgroundColor="bg_surface1"
        />
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onCancel={handleDismissModal}
        />
      </Layout>
    );
  }

  const availableTimes = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  // Calendar logic

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = formatDateForRequest(clickedDate);

    const isAlreadySelected = selectedDates.some(
      (date) => formatDateForRequest(date) === dateString
    );

    if (isAlreadySelected) {
      setSelectedDates(selectedDates.filter((date) => formatDateForRequest(date) !== dateString));
      const newTimes = { ...selectedTimes };
      delete newTimes[dateString];
      setSelectedTimes(newTimes);

      const newTimeSelectionOpen = { ...timeSelectionOpen };
      delete newTimeSelectionOpen[dateString];
      setTimeSelectionOpen(newTimeSelectionOpen);
    } else {
      if (selectedDates.length < 2) {
        setSelectedDates([...selectedDates, clickedDate]);
      }
    }
  };

  const handleTimeSelect = (dateString: string, time: string) => {
    const currentTimes = selectedTimes[dateString] || [];

    if (currentTimes.includes(time)) {
      setSelectedTimes({
        ...selectedTimes,
        [dateString]: currentTimes.filter((t) => t !== time),
      });
    } else {
      if (currentTimes.length < 3) {
        // Add and sort the times
        const newTimes = [...currentTimes, time].sort((a, b) => {
          const timeA = parseInt(a.replace(':', ''));
          const timeB = parseInt(b.replace(':', ''));
          return timeA - timeB;
        });
        setSelectedTimes({
          ...selectedTimes,
          [dateString]: newTimes,
        });
      }
    }
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = formatDateForRequest(date);
    return selectedDates.some((selected) => formatDateForRequest(selected) === dateString);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDateForDisplay = (date: Date) => {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      weekday: 'short',
    }).format(date);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    return `${minutes} ${t('form.programs.minutes')}`;
  };

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return '';
    return `${new Intl.NumberFormat(locale).format(price)} ${t('payment.currency')}`;
  };

  const formatDateForRequest = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const toTimeString = (timeString: string) => {
    const [hour, minute, second] = timeString.split(':');
    const safeHour = hour?.padStart(2, '0') ?? '00';
    const safeMinute = minute?.padStart(2, '0') ?? '00';
    const safeSecond = second?.padStart(2, '0') ?? '00';
    return `${safeHour}:${safeMinute}:${safeSecond}`;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    const compare = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    return compare < todayStart;
  };

  const normalizeContactMethod = (method: string) => {
    if (method === 'line') return 'line';
    if (method === 'whatsapp') return 'whatsapp';
    if (method === 'kakao') return 'kakao';
    if (method === 'phone') return 'phone';
    return method.toLowerCase();
  };

  const normalizeLanguage = (value: string) => {
    if (value === 'korean') return 'korean';
    if (value === 'english') return 'english';
    if (value === 'chinese') return 'chinese';
    if (value === 'japanese') return 'japanese';
    return 'korean';
  };

  const handleSubmit = async () => {
    if (!selectedProgramId) {
      showToast({ title: t('validation.selectProgram'), icon: 'exclaim' });
      return;
    }

    if (!selectedContactMethod) {
      showToast({ title: t('validation.selectContact'), icon: 'exclaim' });
      return;
    }

    if (!contactPhone.trim()) {
      showToast({ title: t('validation.enterContact'), icon: 'exclaim' });
      return;
    }

    if (selectedDates.length === 0) {
      showToast({ title: t('validation.selectDate'), icon: 'exclaim' });
      return;
    }

    if (selectedDates.some((date) => isPastDate(date))) {
      showToast({ title: t('validation.pastDate'), icon: 'exclaim' });
      return;
    }

    const hasEmptyTimes = selectedDates.some(
      (date) => (selectedTimes[formatDateForRequest(date)] || []).length === 0
    );

    if (hasEmptyTimes) {
      showToast({ title: t('validation.selectTimesPerDate'), icon: 'exclaim' });
      return;
    }

    const availabilityOptions = selectedDates
      .map((date) => {
        const dateString = formatDateForRequest(date);
        const times = (selectedTimes[dateString] || []).map((time) => toTimeString(time));
        return {
          date: dateString,
          times,
        };
      })
      .filter((option) => option.times.length > 0);

    if (availabilityOptions.length === 0) {
      showToast({ title: t('validation.selectTimeSlot'), icon: 'exclaim' });
      return;
    }

    const hasDuplicateTimes = availabilityOptions.some((option) => {
      const uniqueTimes = new Set(option.times);
      return uniqueTimes.size !== option.times.length;
    });

    if (hasDuplicateTimes) {
      showToast({ title: t('validation.duplicateTimes'), icon: 'exclaim' });
      return;
    }

    const normalizedContact = normalizeContactMethod(selectedContactMethod);
    const selectedProgram = programs.find((program) => program.id === selectedProgramId);
    if (!selectedProgram) {
      showToast({ title: t('validation.programNotFound'), icon: 'exclaim' });
      return;
    }
    if (!company) {
      showToast({ title: t('validation.companyNotFound'), icon: 'exclaim' });
      return;
    }

    const draft = {
      company_id: company.id,
      company_name: company.name,
      company_address: company.address,
      company_tags: company.tags ?? [],
      program_id: selectedProgram.id,
      program_name: selectedProgram.name,
      program_duration_minutes: selectedProgram.duration_minutes,
      program_price: selectedProgram.price,
      preferred_contact: normalizedContact,
      language_preference: normalizeLanguage(language),
      availability_options: availabilityOptions,
      inquiries: inquiryText,
      contact_line: normalizedContact === 'line' ? contactPhone : '',
      contact_whatsapp: normalizedContact === 'whatsapp' ? contactPhone : '',
      contact_kakao: normalizedContact === 'kakao' ? contactPhone : '',
      contact_phone: normalizedContact === 'phone' ? contactPhone : '',
    };

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('reservation_draft', JSON.stringify(draft));
    }

    router.push({
      pathname: `/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT}`,
      query: { companyId: company.id, programId: selectedProgram.id },
    });
  };

  return (
    <Layout isAppBarExist={false}>
      <AppBar
        onBackClick={router.back}
        leftButton={true}
        buttonType="dark"
        title={t('title')}
        backgroundColor="bg_surface1"
      />
      <div css={pageWrapper}>
        {!hasValidCompanyId && (
          <div css={emptyContainer}>
            <Empty title={t('emptyCompany')} />
          </div>
        )}
        {hasValidCompanyId && (isCompanyLoading || isProgramLoading) && (
          <div css={loadingContainer}>
            <Loading title={t('loading')} />
          </div>
        )}
        {/* Company Info */}
        {hasValidCompanyId && company && (
          <CompanyInfoCard
            name={company.name}
            address={company.address}
            tags={company.tags ?? []}
            addressIconNode={<PaymentLocation width={16} height={16} />}
            variant="payment"
          />
        )}

        {/* Programs Section */}
        {hasValidCompanyId && (
          <ProgramSection
            isOpen={isProgramsOpen}
            onToggle={() => setIsProgramsOpen((prev) => !prev)}
            programs={programs}
            selectedProgramId={selectedProgramId}
            onSelectProgram={(programId) =>
              setSelectedProgramId((prev) => (prev === programId ? null : programId))
            }
            formatDuration={formatDuration}
            formatPrice={formatPrice}
          />
        )}

        {/* Contact Information Section */}
        {hasValidCompanyId && (
          <ContactSection
            isOpen={isContactOpen}
            onToggle={() => setIsContactOpen((prev) => !prev)}
            contactMethods={contactMethods}
            selectedContactMethod={selectedContactMethod}
            onSelectMethod={setSelectedContactMethod}
            email={email}
            onEmailChange={setEmail}
            contactPhone={contactPhone}
            onPhoneChange={setContactPhone}
            language={language}
            onLanguageChange={setLanguage}
            languageOptions={languageOptions}
          />
        )}

        {/* Inquiries Section */}
        {hasValidCompanyId && (
          <InquiriesSection
            isOpen={isInquiriesOpen}
            onToggle={() => setIsInquiriesOpen((prev) => !prev)}
            commonConcerns={commonConcerns}
            inquiryText={inquiryText}
            onInquiryChange={setInquiryText}
          />
        )}

        {/* Reservation Section */}
        {hasValidCompanyId && (
          <ScheduleSection
            currentMonth={currentMonth}
            onPrevMonth={prevMonth}
            onNextMonth={nextMonth}
            daysInMonth={daysInMonth}
            startingDayOfWeek={startingDayOfWeek}
            isDateSelected={isDateSelected}
            onDateClick={handleDateClick}
            selectedDates={selectedDates}
            selectedTimes={selectedTimes}
            timeSelectionOpen={timeSelectionOpen}
            onToggleTimeSelection={(dateString) =>
              setTimeSelectionOpen((prev) => ({ ...prev, [dateString]: !prev[dateString] }))
            }
            onTimeSelect={handleTimeSelect}
            availableTimes={availableTimes}
            formatDateForDisplay={formatDateForDisplay}
            formatDateKey={formatDateForRequest}
          />
        )}

        {/* Submit Button */}
        {hasValidCompanyId && (
          <div css={submitButtonWrapper}>
            <CTAButton onClick={handleSubmit}>{t('submitPayment')}</CTAButton>
          </div>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout>
  );
}

// Styles
const pageWrapper = css`
  padding: 0 0 120px 0;
  background: ${theme.colors.bg_surface1};
`;

const submitButtonWrapper = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 18px;
  background: ${theme.colors.white};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;

const loadingContainer = css`
  margin: 24px 16px;
`;

const emptyContainer = css`
  margin: 24px 16px;
`;
