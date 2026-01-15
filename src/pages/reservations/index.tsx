import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar,
  DesktopAppBar,
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
  Text,
  Dim,
} from '@/components';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { PaymentLocation } from '@/icons';
import { useRequireAuth, useToast, useMediaQuery } from '@/hooks';
import { useGetCompanyDetailQuery } from '@/queries/company';
import { useGetProgramCompanyListQuery } from '@/queries/program';
import { useGetUserProfileQuery } from '@/queries/user';
import { usePostCreateReservationMutation } from '@/queries/reservation';
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
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
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
  const { data: profileData } = useGetUserProfileQuery();
  const { mutateAsync: createReservation, isPending: isCreatingReservation } =
    usePostCreateReservationMutation();
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
  const [contactValues, setContactValues] = useState<{
    line: string;
    whatsapp: string;
    kakao: string;
    phone: string;
  }>({
    line: '',
    whatsapp: '',
    kakao: '',
    phone: '',
  });
  const [language, setLanguage] = useState('korean');
  const hasInitializedProfile = useRef(false);

  // Inquiries
  const [inquiryText, setInquiryText] = useState('');

  // Reservation - dates (max 2)
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Reservation - times (max 3 per date)
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string[] }>({});
  const [timeSelectionOpen, setTimeSelectionOpen] = useState<{ [key: string]: boolean }>({});
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<{
    company_id: number;
    company_name: string;
    company_address: string;
    company_tags: string[];
    program_id: number;
    program_name: string;
    program_duration_minutes: number;
    program_price: number;
    preferred_contact: string;
    language_preference: string;
    availability_options: Array<{
      date: string;
      times: string[];
    }>;
    inquiries: string;
    contact_line: string;
    contact_whatsapp: string;
    contact_kakao: string;
    contact_phone: string;
  } | null>(null);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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

  useEffect(() => {
    if (!profileData?.user) return;
    const user = profileData.user;
    setEmail(user.email ?? '');
    if (hasInitializedProfile.current) return;

    const nextContactValues = {
      line: user.line ?? '',
      whatsapp: user.whatsapp ?? '',
      kakao: user.kakao ?? '',
      phone: user.phone ?? '',
    };
    setContactValues(nextContactValues);
    const preferredMethod =
      selectedContactMethod ||
      (['line', 'whatsapp', 'kakao', 'phone'] as const).find(
        (method) => nextContactValues[method].trim().length > 0
      ) ||
      '';

    if (!selectedContactMethod && preferredMethod) {
      setSelectedContactMethod(preferredMethod);
    }
    hasInitializedProfile.current = true;
  }, [profileData, selectedContactMethod]);

  const handleSelectContactMethod = (method: string) => {
    setSelectedContactMethod(method);
  };

  const handleContactValueChange = (value: string) => {
    if (!selectedContactMethod) return;
    setContactValues((prev) => ({
      ...prev,
      [selectedContactMethod]: value,
    }));
  };

  // 로딩 중이면 대기
  if (isLoading) {
    return (
      <Layout isAppBarExist={false} title={t('title')}>
        <div css={desktopAppBar}>
          <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
        </div>
        <div css={mobileAppBar}>
          <AppBar
            onBackClick={router.back}
            leftButton={true}
            buttonType="dark"
            title={t('title')}
            backgroundColor="bg_surface1"
          />
        </div>
      </Layout>
    );
  }

  // 비회원인 경우 페이지 내용을 숨기고 모달만 표시
  if (!isAuthenticated) {
    return (
      <Layout isAppBarExist={false} title={t('title')}>
        <div css={desktopAppBar}>
          <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
        </div>
        <div css={mobileAppBar}>
          <AppBar
            onBackClick={router.back}
            leftButton={true}
            buttonType="dark"
            title={t('title')}
            backgroundColor="bg_surface1"
          />
        </div>
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
    if (isPastDate(clickedDate) && !isAlreadySelected) {
      return;
    }

    if (isAlreadySelected) {
      setSelectedDates(selectedDates.filter((date) => formatDateForRequest(date) !== dateString));
      const newTimes = { ...selectedTimes };
      delete newTimes[dateString];
      setSelectedTimes(newTimes);
      const newTimeSelectionOpen = { ...timeSelectionOpen };
      delete newTimeSelectionOpen[dateString];
      setTimeSelectionOpen(newTimeSelectionOpen);
      return;
    }

    if (selectedDates.length < 2) {
      const nextDates = [...selectedDates, clickedDate].sort((a, b) => a.getTime() - b.getTime());
      setSelectedDates(nextDates);
      return;
    }

    const sortedDates = [...selectedDates].sort((a, b) => a.getTime() - b.getTime());
    const removedDate = sortedDates[0];
    const nextDates = [...sortedDates.slice(1), clickedDate].sort(
      (a, b) => a.getTime() - b.getTime()
    );
    const removedDateKey = formatDateForRequest(removedDate);
    const newTimes = { ...selectedTimes };
    delete newTimes[removedDateKey];
    setSelectedTimes(newTimes);
    const newTimeSelectionOpen = { ...timeSelectionOpen };
    delete newTimeSelectionOpen[removedDateKey];
    setTimeSelectionOpen(newTimeSelectionOpen);
    setSelectedDates(nextDates);
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

  const isDateDisabled = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return isPastDate(date);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDateForDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const weekday = new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    return `${year} . ${month} . ${day} (${weekday})`;
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
    if (method === 'line') return 'Line';
    if (method === 'whatsapp') return 'Whats App';
    if (method === 'kakao') return 'Kakao';
    if (method === 'phone') return 'Phone';
    return method;
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

    const selectedContactValue = selectedContactMethod
      ? (contactValues[selectedContactMethod as keyof typeof contactValues] ?? '')
      : '';

    if (!selectedContactValue.trim()) {
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
      contact_line: contactValues.line,
      contact_whatsapp: contactValues.whatsapp,
      contact_kakao: contactValues.kakao,
      contact_phone: contactValues.phone,
    };

    if (isDesktop) {
      setPendingDraft(draft);
      setIsPaymentModalOpen(true);
      return;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('reservation_draft', JSON.stringify(draft));
    }

    router.push({
      pathname: `/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT}`,
      query: { companyId: company.id, programId: selectedProgram.id },
    });
  };

  const handleConfirmPayment = async () => {
    if (!pendingDraft) return;
    try {
      await createReservation({
        program_id: pendingDraft.program_id,
        preferred_contact: pendingDraft.preferred_contact,
        language_preference: pendingDraft.language_preference as
          | 'korean'
          | 'english'
          | 'chinese'
          | 'japanese',
        availability_options: pendingDraft.availability_options,
        inquiries: pendingDraft.inquiries,
        contact_line: pendingDraft.contact_line,
        contact_whatsapp: pendingDraft.contact_whatsapp,
        contact_kakao: pendingDraft.contact_kakao,
        contact_phone: pendingDraft.contact_phone,
      });

      if (typeof window !== 'undefined') {
        const primaryOption = pendingDraft.availability_options[0];
        const primaryTime = primaryOption?.times?.[0] ?? '';
        window.sessionStorage.setItem(
          'reservation_complete',
          JSON.stringify({
            company_name: pendingDraft.company_name,
            program_name: pendingDraft.program_name,
            program_duration_minutes: pendingDraft.program_duration_minutes,
            date: primaryOption?.date ?? '',
            time: primaryTime,
          })
        );
      }

      router.push(`/${currentLocale}${ROUTES.RESERVATIONS_COMPLETE}`);
    } catch {
      showToast({ title: t('payment.toastFailed'), icon: 'exclaim' });
    }
  };

  const selectedProgram = programs.find((program) => program.id === selectedProgramId);
  const summaryDate = selectedDates[0];
  const summaryDateKey = summaryDate ? formatDateForRequest(summaryDate) : '';
  const summaryTimes = summaryDateKey ? (selectedTimes[summaryDateKey] ?? []) : [];
  const summaryTimeText = summaryTimes.length > 0 ? summaryTimes.join(' / ') : '-';
  const summaryPrice = selectedProgram?.price ?? null;
  const summaryPriceText =
    summaryPrice == null ? '-' : `${formatPrice(summaryPrice)} ${t('payment.currency')}`;

  return (
    <Layout isAppBarExist={false} title={t('title')}>
      <div css={desktopAppBar}>
        <DesktopAppBar onSearchChange={() => {}} showSearch={false} />
      </div>
      <div css={mobileAppBar}>
        <AppBar
          onBackClick={router.back}
          leftButton={true}
          buttonType="dark"
          title={t('title')}
          backgroundColor="bg_surface1"
        />
      </div>
      <div css={pageWrapper}>
        {isDesktop && (
          <div css={desktopHeader}>
            <Text typo="title_L" color="text_primary">
              {t('title')}
            </Text>
            <Text typo="body_M" color="text_tertiary">
              {t('form.schedule.selectDates')}
            </Text>
          </div>
        )}
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

        {hasValidCompanyId && (
          <div css={contentGrid}>
            <div css={sideColumn}>
              <div css={sidePanel}>
                {company && (
                  <CompanyInfoCard
                    name={company.name}
                    address={company.address}
                    tags={company.tags ?? []}
                    addressIconNode={<PaymentLocation width={16} height={16} />}
                    variant="payment"
                  />
                )}
                <div css={desktopOnly}>
                  <div css={summaryCard}>
                    <Text typo="title_M" color="text_primary">
                      {t('payment.bookingInfo')}
                    </Text>
                    <div css={summaryRow}>
                      <Text typo="body_M" color="text_secondary">
                        {t('payment.date')}
                      </Text>
                      <Text typo="title_S" color="text_primary">
                        {summaryDate ? formatDateForDisplay(summaryDate) : '-'}
                      </Text>
                    </div>
                    <div css={summaryRow}>
                      <Text typo="body_M" color="text_secondary">
                        {t('payment.time')}
                      </Text>
                      <Text typo="title_S" color="text_primary">
                        {summaryTimeText}
                      </Text>
                    </div>
                    <div css={summaryRow}>
                      <Text typo="body_M" color="text_secondary">
                        {t('payment.program')}
                      </Text>
                      <Text typo="title_S" color="text_primary" css={summaryValueRight}>
                        {selectedProgram
                          ? `${selectedProgram.name} (${selectedProgram.duration_minutes}${t(
                              'payment.minutes'
                            )})`
                          : '-'}
                      </Text>
                    </div>
                  </div>

                  <div css={summaryCard}>
                    <Text typo="title_M" color="text_primary">
                      {t('payment.paymentAmount')}
                    </Text>
                    <div css={summaryRow}>
                      <Text typo="body_M" color="text_secondary">
                        {t('payment.paymentAmountLabel')}
                      </Text>
                      <Text typo="body_M" color="text_primary">
                        {summaryPriceText}
                      </Text>
                    </div>
                    <div css={summaryDivider} />
                    <div css={summaryRow}>
                      <Text typo="title_S" color="text_primary">
                        {t('payment.finalPaymentAmount')}
                      </Text>
                      <Text typo="title_S" color="primary50">
                        {summaryPriceText}
                      </Text>
                    </div>
                  </div>

                  <div css={desktopSubmitWrapper}>
                    <CTAButton onClick={handleSubmit} disabled={isCreatingReservation}>
                      {t('payment.bookNow')}
                    </CTAButton>
                  </div>
                </div>
              </div>
            </div>

            <div css={mainColumn}>
              {/* Programs Section */}
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

              {/* Contact Information Section */}
              <ContactSection
                isOpen={isContactOpen}
                onToggle={() => setIsContactOpen((prev) => !prev)}
                contactMethods={contactMethods}
                selectedContactMethod={selectedContactMethod}
                onSelectMethod={handleSelectContactMethod}
                email={email}
                onEmailChange={setEmail}
                isEmailReadOnly={true}
                contactPhone={
                  selectedContactMethod
                    ? (contactValues[selectedContactMethod as keyof typeof contactValues] ?? '')
                    : ''
                }
                onPhoneChange={handleContactValueChange}
                language={language}
                onLanguageChange={setLanguage}
                languageOptions={languageOptions}
              />

              {/* Inquiries Section */}
              <InquiriesSection
                isOpen={isInquiriesOpen}
                onToggle={() => setIsInquiriesOpen((prev) => !prev)}
                commonConcerns={commonConcerns}
                inquiryText={inquiryText}
                onInquiryChange={setInquiryText}
              />

              {/* Reservation Section */}
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
                isDateDisabled={isDateDisabled}
                onTimeSelect={handleTimeSelect}
                availableTimes={availableTimes}
                formatDateForDisplay={formatDateForDisplay}
                formatDateKey={formatDateForRequest}
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        {hasValidCompanyId && (
          <div css={submitButtonWrapper}>
            <CTAButton onClick={handleSubmit}>{t('submitPayment')}</CTAButton>
          </div>
        )}
      </div>
      {isPaymentModalOpen && pendingDraft && (
        <>
          <Dim fullScreen onClick={() => setIsPaymentModalOpen(false)} />
          <div css={modalCard}>
            <div css={modalText}>
              <Text typo="title_M" color="text_primary">
                {t('payment.submitTitle')}
              </Text>
              <Text typo="body_M" color="text_tertiary" css={modalDescription}>
                {t('payment.submitDescription')}
              </Text>
            </div>
            <div css={modalButtonRow}>
              <button css={modalCancel} onClick={() => setIsPaymentModalOpen(false)}>
                <Text typo="body_M" color="text_primary">
                  {t('payment.cancel')}
                </Text>
              </button>
              <button
                css={modalSubmit}
                onClick={handleConfirmPayment}
                disabled={isCreatingReservation}
              >
                <Text typo="body_M" color="white">
                  {t('payment.submit')}
                </Text>
              </button>
            </div>
          </div>
        </>
      )}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout>
  );
}

// Styles
const pageWrapper = css`
  padding: 0 0 120px 0;
  background: ${theme.colors.bg_surface1};

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding-bottom: 80px;
  }
`;

const desktopAppBar = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
  }
`;

const mobileAppBar = css`
  display: block;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
  }
`;

const desktopHeader = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 24px auto 0;
    padding: 0 40px;
  }
`;

const contentGrid = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.6fr);
    gap: 24px;
    align-items: start;
    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
  }
`;

const mainColumn = css`
  display: flex;
  flex-direction: column;
  order: 2;

  @media (min-width: ${theme.breakpoints.desktop}) {
    order: 1;
  }
`;

const sideColumn = css`
  order: 1;

  @media (min-width: ${theme.breakpoints.desktop}) {
    order: 2;
    position: sticky;
    top: 24px;
  }
`;

const sidePanel = css`
  @media (min-width: ${theme.breakpoints.desktop}) {
    border: 1px solid ${theme.colors.border_default};
    border-radius: 20px;
    padding: 12px 16px;
    background: ${theme.colors.bg_surface1};
  }
`;

const desktopOnly = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
  }
`;

const summaryCard = css`
  margin-top: 12px;
  padding: 20px 18px;
  border-radius: 16px;
  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const summaryRow = css`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

const summaryValueRight = css`
  text-align: right;
`;

const summaryDivider = css`
  height: 1px;
  background: ${theme.colors.border_default};
`;

const submitButtonWrapper = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 18px;
  background: ${theme.colors.white};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: none;
  }
`;

const desktopSubmitWrapper = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
    margin-top: 16px;
  }
`;

const modalCard = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${theme.colors.white};
  border-radius: 24px;
  width: calc(100% - 48px);
  max-width: 360px;
  padding: 28px 24px 24px;
  z-index: ${theme.zIndex.dialog};
  text-align: center;
  box-shadow: 0 16px 32px ${theme.colors.grayOpacity200};
`;

const modalText = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const modalDescription = css`
  margin: 0;
  line-height: 1.5;
`;

const modalButtonRow = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const modalButtonBase = css`
  border-radius: 999px;
  padding: 12px 0;
  border: 1px solid ${theme.colors.primary50};
  background: ${theme.colors.white};
  cursor: pointer;
`;

const modalCancel = css`
  ${modalButtonBase};
`;

const modalSubmit = css`
  ${modalButtonBase};
  background: ${theme.colors.primary50};
`;

const loadingContainer = css`
  margin: 24px 16px;
`;

const emptyContainer = css`
  margin: 24px 16px;
`;
