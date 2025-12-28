import { useEffect, useMemo, useState } from 'react';
import { AppBar, Layout, Text, CTAButton, LoginModal, Loading, Empty } from '@/components';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Chevron } from '@/icons';
import { useRequireAuth, useToast } from '@/hooks';
import { useGetCompanyDetailQuery } from '@/queries/company';
import { useGetProgramCompanyListQuery } from '@/queries/program';
import { usePostCreateReservationMutation } from '@/queries/reservation';
import { ROUTES } from '@/constants';
import { CompanyDetail } from '@/models';
import { useAuthStore } from '@/store/auth';
import { postTokenReissue } from '@/apis/auth';

const contactMethods = ['Line', 'Whats App', 'Kakao', 'Phone'];

const commonConcerns = [
  'This is my first time at a Korean clinic',
  'I have sensitive skin/allergies',
  'I need English explanation during treatment',
  'I prefer gentle pressure during massage',
  'I have specific areas of concern',
];

export default function ReservationPage() {
  const router = useRouter();
  const { showLoginModal, setShowLoginModal, isAuthenticated, isLoading, handleDismissModal } =
    useRequireAuth(true);
  const { showToast } = useToast();
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
  const { mutateAsync: createReservation, isLoading: isSubmitting } =
    usePostCreateReservationMutation();

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
  const [language, setLanguage] = useState('한국어');

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

  // 로딩 중이면 대기
  if (isLoading) {
    return (
      <Layout isAppBarExist={false}>
        <AppBar
          onBackClick={router.back}
          leftButton={true}
          buttonType="dark"
          title="Reservation"
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
          title="Reservation"
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
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = days[date.getDay()];
    return `${year}. ${month}. ${day} (${dayOfWeek})`;
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return '';
    return `${minutes} mins`;
  };

  const formatPrice = (price?: number) => {
    if (!price && price !== 0) return '';
    return `${new Intl.NumberFormat('ko-KR').format(price)} KRW`;
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
    if (method === 'Line') return 'line';
    if (method === 'Whats App') return 'whatsapp';
    if (method === 'Kakao') return 'kakao';
    if (method === 'Phone') return 'phone';
    return method.toLowerCase();
  };

  const normalizeLanguage = (value: string) => {
    if (value === '한국어') return 'korean';
    if (value === 'English') return 'english';
    if (value === '中文') return 'chinese';
    if (value === '日本語') return 'japanese';
    return 'korean';
  };

  const parseJwtPayload = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload) as {
        exp?: number;
        type?: string;
        role?: string;
        sub?: string;
      };
    } catch {
      return null;
    }
  };

  const ensureValidAccessToken = async () => {
    const currentToken = useAuthStore.getState().accessToken;
    const payload = currentToken ? parseJwtPayload(currentToken) : null;
    console.log('[createReservation] token payload:', payload);
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const isExpired = payload?.exp ? payload.exp <= nowInSeconds + 10 : true;
    const isAccessToken = payload?.type === 'access';

    if (!currentToken || !payload || isExpired || !isAccessToken) {
      try {
        const response = await postTokenReissue();
        const newAccessToken = response?.tokens?.access_token;
        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
          return true;
        }
      } catch {
        return false;
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    const hasValidToken = await ensureValidAccessToken();
    if (!hasValidToken) {
      showToast({ title: '로그인이 만료되었습니다. 다시 로그인해 주세요.', icon: 'exclaim' });
      return;
    }

    if (!selectedProgramId) {
      showToast({ title: '프로그램을 선택해 주세요.', icon: 'exclaim' });
      return;
    }

    if (!selectedContactMethod) {
      showToast({ title: '연락 방법을 선택해 주세요.', icon: 'exclaim' });
      return;
    }

    if (!contactPhone.trim()) {
      showToast({ title: '연락처 정보를 입력해 주세요.', icon: 'exclaim' });
      return;
    }

    if (selectedDates.length === 0) {
      showToast({ title: '방문 날짜를 선택해 주세요.', icon: 'exclaim' });
      return;
    }

    if (selectedDates.some((date) => isPastDate(date))) {
      showToast({ title: '지난 날짜는 선택할 수 없습니다.', icon: 'exclaim' });
      return;
    }

    const hasEmptyTimes = selectedDates.some(
      (date) => (selectedTimes[formatDateForRequest(date)] || []).length === 0
    );

    if (hasEmptyTimes) {
      showToast({ title: '선택한 날짜마다 시간을 선택해 주세요.', icon: 'exclaim' });
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
      showToast({ title: '방문 시간대를 선택해 주세요.', icon: 'exclaim' });
      return;
    }

    const hasDuplicateTimes = availabilityOptions.some((option) => {
      const uniqueTimes = new Set(option.times);
      return uniqueTimes.size !== option.times.length;
    });

    if (hasDuplicateTimes) {
      showToast({ title: '중복된 시간대를 선택할 수 없습니다.', icon: 'exclaim' });
      return;
    }

    const normalizedContact = normalizeContactMethod(selectedContactMethod);
    const payload = {
      program_id: selectedProgramId,
      preferred_contact: normalizedContact,
      language_preference: normalizeLanguage(language),
      availability_options: availabilityOptions,
      inquiries: inquiryText,
      contact_line: normalizedContact === 'line' ? contactPhone : '',
      contact_whatsapp: normalizedContact === 'whatsapp' ? contactPhone : '',
      contact_kakao: normalizedContact === 'kakao' ? contactPhone : '',
      contact_phone: normalizedContact === 'phone' ? contactPhone : '',
    };

    try {
      console.log(
        '[createReservation] token:',
        useAuthStore.getState().accessToken ? 'present' : 'missing'
      );
      await createReservation(payload);
      showToast({ title: '예약이 접수되었습니다.', icon: 'check' });
      router.push(ROUTES.RESERVATIONS_COMPLETE);
    } catch (error) {
      console.error('[createReservation] error:', {
        status: (error as { response?: { status?: number } })?.response?.status,
        data: (error as { response?: { data?: unknown } })?.response?.data,
        message: (error as { message?: string })?.message,
      });
      showToast({ title: '예약 요청에 실패했습니다. 다시 시도해 주세요.', icon: 'exclaim' });
    }
  };

  return (
    <Layout isAppBarExist={false}>
      <AppBar
        onBackClick={router.back}
        leftButton={true}
        buttonType="dark"
        title="Reservation"
        backgroundColor="bg_surface1"
      />
      <div css={pageWrapper}>
        {!hasValidCompanyId && (
          <div css={emptyWrapper}>
            <Empty title="예약할 업체 정보가 없습니다." />
          </div>
        )}
        {hasValidCompanyId && (isCompanyLoading || isProgramLoading) && (
          <div css={loadingWrapper}>
            <Loading title="Loading..." />
          </div>
        )}
        {/* Clinic Info */}
        {hasValidCompanyId && company && (
          <div css={clinicInfo}>
            <Text typo="title_L" color="text_primary">
              {company.name}
            </Text>
            <Text typo="body_M" color="text_tertiary" css={addressText}>
              📍 {company.address}
            </Text>
            <div css={tagsContainer}>
              {company.tags?.map((tagText, index) => (
                <div key={`${tagText}-${index}`} css={tag}>
                  <Text typo="body_S" color="text_secondary">
                    {tagText}
                  </Text>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Programs Section */}
        {hasValidCompanyId && (
          <div css={section}>
            <div css={sectionHeader} onClick={() => setIsProgramsOpen(!isProgramsOpen)}>
              <Text typo="title_M" color="text_primary">
                Programs
              </Text>
              <div css={chevronIcon(isProgramsOpen)}>
                <Chevron width={24} height={24} />
              </div>
            </div>
            {isProgramsOpen && (
              <div css={sectionContent}>
                {programs.length === 0 && (
                  <Text typo="body_S" color="text_tertiary">
                    표시할 프로그램이 없습니다.
                  </Text>
                )}
                {programs.map((program) => (
                  <div
                    key={program.id}
                    css={programCard(selectedProgramId === program.id)}
                    onClick={() => {
                      setSelectedProgramId((prev) => (prev === program.id ? null : program.id));
                    }}
                  >
                    <img
                      src={program.primary_image_url || '/default.png'}
                      alt={program.name}
                      css={programImage}
                    />
                    <div css={programInfo}>
                      <Text typo="title_S" color="text_primary">
                        {program.name}
                      </Text>
                      <Text typo="body_S" color="text_tertiary">
                        ⏱ {formatDuration(program.duration_minutes)} | {formatPrice(program.price)}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Contact Information Section */}
        {hasValidCompanyId && (
          <div css={section}>
            <div css={sectionHeader} onClick={() => setIsContactOpen(!isContactOpen)}>
              <Text typo="title_M" color="text_primary">
                Contact Information
              </Text>
              <div css={chevronIcon(isContactOpen)}>
                <Chevron width={24} height={24} />
              </div>
            </div>
            {isContactOpen && (
              <div css={sectionContent}>
                <div css={inputGroup}>
                  <Text typo="body_M" color="text_primary">
                    Email
                  </Text>
                  <input
                    type="email"
                    placeholder="Elena123@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    css={input}
                  />
                </div>

                <div css={inputGroup}>
                  <Text typo="body_M" color="text_primary">
                    Preferred Contact Method
                  </Text>
                  <div css={contactMethodsContainer}>
                    {contactMethods.map((method) => (
                      <div
                        key={method}
                        css={contactMethodChip(selectedContactMethod === method)}
                        onClick={() => setSelectedContactMethod(method)}
                      >
                        <Text
                          typo="body_S"
                          color={selectedContactMethod === method ? 'white' : 'text_secondary'}
                        >
                          {method}
                        </Text>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Elena122"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    css={input}
                  />
                </div>

                <div css={inputGroup}>
                  <Text typo="body_M" color="text_primary">
                    Language Preference
                  </Text>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    css={select}
                  >
                    <option value="한국어">한국어</option>
                    <option value="English">English</option>
                    <option value="中文">中文</option>
                    <option value="日本語">日本語</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inquiries Section */}
        {hasValidCompanyId && (
          <div css={section}>
            <div css={sectionHeader} onClick={() => setIsInquiriesOpen(!isInquiriesOpen)}>
              <Text typo="title_M" color="text_primary">
                Inquiries
              </Text>
              <div css={chevronIcon(isInquiriesOpen)}>
                <Chevron width={24} height={24} />
              </div>
            </div>
            {isInquiriesOpen && (
              <div css={sectionContent}>
                <Text typo="body_M" color="text_primary" css={inquiryTitle}>
                  Tell us about your needs (Optional)
                </Text>
                <div css={concernsBox}>
                  <Text typo="body_S" color="text_secondary" css={concernsTitle}>
                    Common concerns for international visitors :
                  </Text>
                  <ul css={concernsList}>
                    {commonConcerns.map((concern, index) => (
                      <li key={index}>
                        <Text typo="body_S" color="text_secondary">
                          {concern}
                        </Text>
                      </li>
                    ))}
                  </ul>
                </div>
                <textarea
                  placeholder="Write about your needs"
                  value={inquiryText}
                  onChange={(e) => setInquiryText(e.target.value)}
                  css={textarea}
                />
              </div>
            )}
          </div>
        )}

        {/* Reservation Section */}
        {hasValidCompanyId && (
          <div css={reservationSection}>
            <Text typo="title_L" color="text_primary">
              Reservation
            </Text>

            <div css={dateSelectionSection}>
              <Text typo="body_M" color="text_primary">
                01. Select up to 2 preferred dates
              </Text>

              {/* Calendar */}
              <div css={calendarContainer}>
                <div css={calendarHeader}>
                  <button onClick={prevMonth} css={arrowButton}>
                    &lt;
                  </button>
                  <Text typo="title_S" color="text_primary">
                    {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Text>
                  <button onClick={nextMonth} css={arrowButton}>
                    &gt;
                  </button>
                </div>

                <div css={calendarGrid}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} css={dayHeader}>
                      <Text typo="body_S" color="text_tertiary">
                        {day}
                      </Text>
                    </div>
                  ))}

                  {Array.from({ length: startingDayOfWeek }).map((_, index) => (
                    <div key={`empty-${index}`} css={emptyDay} />
                  ))}

                  {Array.from({ length: daysInMonth }).map((_, index) => {
                    const day = index + 1;
                    return (
                      <div
                        key={day}
                        css={calendarDay(isDateSelected(day))}
                        onClick={() => handleDateClick(day)}
                      >
                        <Text typo="body_M" color={isDateSelected(day) ? 'white' : 'text_primary'}>
                          {day}
                        </Text>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Time Selection */}
            <div css={timeSelectionSection}>
              <Text typo="body_M" color="text_primary">
                02. Select up to 3 available times
              </Text>

              {selectedDates.length === 0 && (
                <Text typo="body_S" color="text_tertiary" css={placeholderText}>
                  Please select your first preferred date.
                </Text>
              )}

              {selectedDates.map((date) => {
                const dateString = formatDateForRequest(date);
                const hasSelectedTime =
                  selectedTimes[dateString] && selectedTimes[dateString].length > 0;
                const isOpen = timeSelectionOpen[dateString] || false;

                return (
                  <div key={dateString} css={timeSelectionGroup}>
                    <Text typo="body_S" color="text_secondary">
                      {formatDateForDisplay(date)}
                    </Text>

                    {hasSelectedTime ? (
                      <>
                        {/* Selected times display box */}
                        <div
                          css={selectedTimesBox()}
                          onClick={() =>
                            setTimeSelectionOpen({
                              ...timeSelectionOpen,
                              [dateString]: !isOpen,
                            })
                          }
                        >
                          <Text typo="body_M" color="text_primary">
                            {selectedTimes[dateString].join(' / ')}
                          </Text>
                          <div css={timeBoxChevron(isOpen)}>
                            <Chevron width={20} height={20} />
                          </div>
                        </div>

                        {/* Time chips - show when open */}
                        {isOpen && (
                          <div css={timeChipsContainer}>
                            {availableTimes.map((time) => (
                              <div
                                key={time}
                                css={timeChip(selectedTimes[dateString]?.includes(time) || false)}
                                onClick={() => handleTimeSelect(dateString, time)}
                              >
                                <Text
                                  typo="body_S"
                                  color={
                                    selectedTimes[dateString]?.includes(time)
                                      ? 'white'
                                      : 'text_secondary'
                                  }
                                >
                                  {time}
                                </Text>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <select
                        css={select}
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            handleTimeSelect(dateString, e.target.value);
                            // Auto-open the time chips after first selection
                            setTimeSelectionOpen({
                              ...timeSelectionOpen,
                              [dateString]: true,
                            });
                          }
                        }}
                      >
                        <option value="">Select times</option>
                        {availableTimes.map((time) => (
                          <option key={time} value={time}>
                            {time}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Button */}
        {hasValidCompanyId && (
          <div css={submitButtonWrapper}>
            <CTAButton onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Booking...' : 'Book Now'}
            </CTAButton>
          </div>
        )}
      </div>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </Layout>
  );
}

// Styles
const pageWrapper = css`
  padding: 12px 0 120px 0;
  background: ${theme.colors.bg_surface1};
`;

const clinicInfo = css`
  padding: 24px 18px;
  background: ${theme.colors.white};
  margin: 12px 16px 8px;
  border-radius: 16px;
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

const addressText = css`
  margin-top: 8px;
`;

const tagsContainer = css`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const tag = css`
  padding: 6px 12px;
  background: ${theme.colors.primary10Opacity40};
  border-radius: 16px;
`;

const section = css`
  background: ${theme.colors.white};
  margin: 12px 16px 8px;
  padding: 20px 18px;
  border-radius: 16px;
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

const sectionHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const chevronIcon = (isOpen: boolean) => css`
  transform: ${isOpen ? 'rotate(180deg)' : 'rotate(90deg)'};
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const sectionContent = css`
  margin-top: 16px;
`;

const programCard = (isSelected: boolean) => css`
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.divider_2};
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  background: ${isSelected ? theme.colors.sub_sub_2 : theme.colors.bg_surface2};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const programImage = css`
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
`;

const programInfo = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;

const inputGroup = css`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const input = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 10px;
  font-size: 14px;
  margin-top: 8px;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary50};
  }

  &::placeholder {
    color: ${theme.colors.text_disabled};
  }
`;

const contactMethodsContainer = css`
  display: flex;
  gap: 8px;
  margin: 8px 0;
  flex-wrap: wrap;
`;

const contactMethodChip = (isSelected: boolean) => css`
  padding: 8px 16px;
  border-radius: 18px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.divider_2};
  background: ${isSelected ? theme.colors.primary50 : theme.colors.bg_surface2};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const select = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 10px;
  font-size: 14px;
  margin-top: 8px;
  outline: none;
  background: ${theme.colors.white};
  cursor: pointer;

  &:focus {
    border-color: ${theme.colors.primary50};
  }
`;

const inquiryTitle = css`
  margin-bottom: 12px;
`;

const concernsBox = css`
  background: ${theme.colors.primary10Opacity40};
  padding: 16px;
  border-radius: 12px;
  margin: 12px 0;
`;

const concernsTitle = css`
  margin-bottom: 8px;
  font-weight: 600;
`;

const concernsList = css`
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const textarea = css`
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${theme.colors.primary50};
  }

  &::placeholder {
    color: ${theme.colors.text_disabled};
  }
`;

const reservationSection = css`
  background: ${theme.colors.white};
  padding: 24px 18px;
  margin: 12px 16px 80px;
  border-radius: 16px;
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

const dateSelectionSection = css`
  margin-top: 20px;
`;

const calendarContainer = css`
  margin-top: 16px;
`;

const calendarHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const arrowButton = css`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px 12px;
  color: ${theme.colors.text_primary};

  &:hover {
    background: ${theme.colors.bg_surface1};
    border-radius: 4px;
  }
`;

const calendarGrid = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const dayHeader = css`
  text-align: center;
  padding: 8px 0;
`;

const emptyDay = css`
  padding: 12px 0;
`;

const calendarDay = (isSelected: boolean) => css`
  width: 43px;
  height: 43px;
  text-align: center;
  padding: 12px 0;
  border-radius: 50%;
  cursor: pointer;
  background: ${isSelected ? theme.colors.primary50 : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${isSelected ? theme.colors.primary50 : theme.colors.bg_surface1};
  }
`;

const timeSelectionSection = css`
  margin-top: 32px;
`;

const placeholderText = css`
  margin-top: 12px;
`;

const timeSelectionGroup = css`
  margin-top: 16px;
`;

const selectedTimesBox = () => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-top: 12px;
  border: 1px solid ${theme.colors.divider_2};
  border-radius: 10px;
  background: ${theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const timeBoxChevron = (isOpen: boolean) => css`
  transform: ${isOpen ? 'rotate(90deg)' : 'rotate(270deg)'};
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const timeChipsContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const timeChip = (isSelected: boolean) => css`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.divider_2};
  background: ${isSelected ? theme.colors.primary50 : theme.colors.bg_surface2};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
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

const loadingWrapper = css`
  margin: 24px 16px;
`;

const emptyWrapper = css`
  margin: 24px 16px;
`;
