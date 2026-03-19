import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AppBar,
  DesktopAppBar,
  Layout,
  CTAButton,
  Empty,
  CompanyInfoCard,
  ProgramSection,
  ContactSection,
  InquiriesSection,
  ReservationPolicyPanel,
  ScheduleSection,
  Text,
  Dim,
  Skeleton,
} from '@/components';
import { Meta, createPageMeta } from '@/seo';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { PaymentLocation } from '@/icons';
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';
import { useRequireAuth, useToast, useMediaQuery, useErrorHandler } from '@/hooks';
import { useGetCompanyDetailQuery } from '@/queries/company';
import { useGetProgramCompanyListQuery } from '@/queries/program';
import { useGetUserProfileQuery } from '@/queries/user';
import { usePostCreateReservationMutation } from '@/queries/reservation';
import { usePostCreatePaymentOrderMutation } from '@/queries/payment';
import {
  ROUTES,
  PAYMENT_WIDGET_CONFIG,
  PaymentMethod,
  PaymentVariantKey,
  isPayNowPaymentMethod,
} from '@/constants';
import { CompanyDetail } from '@/models';
import type { PaymentOrder } from '@/models/payment';
import { useCurrentLocale } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';
import { resolvePrice, type CurrencyCode } from '@/utils/price';
import { getI18nServerSideProps } from '@/i18n/page-props';
import { RESERVATION_REFUND_POLICY_URL } from '@/utils/reservation-policy';

interface ReservationDraft {
  company_id: number;
  company_name: string;
  company_address: string;
  company_tags: string[];
  company_primary_image_url?: string;
  program_id: number;
  program_name: string;
  program_duration_minutes: number;
  program_price: number;
  program_primary_image_url?: string;
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
}

const isDev = process.env.NODE_ENV !== 'production';
const logPaymentInfo = (message: string, payload?: Record<string, unknown>) => {
  if (!isDev) return;
  console.info(message, payload);
};

export default function ReservationPage() {
  const router = useRouter();
  const t = useTranslations('reservation');
  const tCommon = useTranslations('common');
  const { isAuthenticated, isLoading } = useRequireAuth(true);
  const { showToast } = useToast();
  const { showErrorToast } = useErrorHandler();
  const isDesktop = useMediaQuery(`(min-width: ${theme.breakpoints.desktop})`);
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : 'en-US';
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
  const { data: profileData, isLoading: isProfileLoading } = useGetUserProfileQuery();
  const { mutateAsync: createReservation, isPending: isCreatingReservation } =
    usePostCreateReservationMutation();
  const { mutateAsync: createPaymentOrder, isPending: isPaymentOrderPending } =
    usePostCreatePaymentOrderMutation();
  const company = companyData?.company ?? prefetchedCompany;
  const programs = useMemo(() => programList?.programs ?? [], [programList?.programs]);
  const shouldShowCompanySkeleton = hasValidCompanyId && !company && isCompanyLoading;
  const isProgramSectionLoading = hasValidCompanyId && isProgramLoading;
  const isContactSectionLoading = hasValidCompanyId && isProfileLoading;
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

  const meta = createPageMeta({
    pageTitle: t('title'),
    description: tCommon('app.description'),
    path: router.asPath || '/reservations',
    noindex: true,
  });
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
  const [pendingDraft, setPendingDraft] = useState<ReservationDraft | null>(null);
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<PaymentMethod>('onSite');
  const isPayNowPayment = isPayNowPaymentMethod(paymentMethodChoice);
  const paymentWidgetConfig = isPayNowPayment ? PAYMENT_WIDGET_CONFIG[paymentMethodChoice] : null;
  const [paymentOrder, setPaymentOrder] = useState<PaymentOrder | null>(null);
  const [isWidgetReady, setIsWidgetReady] = useState(false);
  const paymentWidgetsRef = useRef<ReturnType<
    Awaited<ReturnType<typeof loadTossPayments>>['widgets']
  > | null>(null);
  const [isPaymentWidgetOpen, setIsPaymentWidgetOpen] = useState(false);
  const hasRenderedWidgetRef = useRef(false);
  const [isPolicyAccepted, setIsPolicyAccepted] = useState(false);

  const closePaymentWidgetModal = () => {
    if (typeof document !== 'undefined') {
      document.getElementById('reservation-payment-methods-modal')?.replaceChildren();
      document.getElementById('reservation-payment-agreement-modal')?.replaceChildren();
    }
    paymentWidgetsRef.current = null;
    hasRenderedWidgetRef.current = false;
    setIsWidgetReady(false);
    setIsPaymentWidgetOpen(false);
  };

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

  useEffect(() => {
    if (!isPayNowPayment) {
      paymentWidgetsRef.current = null;
      hasRenderedWidgetRef.current = false;
      setIsWidgetReady(false);
      setPaymentOrder(null);
      return;
    }
  }, [isPayNowPayment]);

  useEffect(() => {
    if (!isPayNowPayment) return;
    // Ensure widget gets re-rendered with the selected variant key (KOREA/PAYPAL).
    paymentWidgetsRef.current = null;
    hasRenderedWidgetRef.current = false;
    setIsWidgetReady(false);
    setPaymentOrder(null);
  }, [paymentMethodChoice, isPayNowPayment]);

  useEffect(() => {
    if (!isPayNowPayment) return;
    if (!pendingDraft || !isPaymentWidgetOpen) return;
    if (!process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY) {
      showToast({ title: t('payment.toastTossInitFailed'), icon: 'exclaim' });
      return;
    }

    let isMounted = true;
    const initializeWidget = async () => {
      try {
        if (!paymentWidgetsRef.current) {
          const tossPayments = await loadTossPayments(
            process.env.NEXT_PUBLIC_TOSSPAYMENTS_CLIENT_KEY!
          );
          paymentWidgetsRef.current = tossPayments.widgets({ customerKey: ANONYMOUS });
        }
        const widgets = paymentWidgetsRef.current;
        if (!widgets) return;
        const selectedCurrency = paymentWidgetConfig?.currency ?? 'KRW';
        const programPriceByCurrency = resolvePrice({
          currency: selectedCurrency,
          priceInfo: programs.find((program) => program.id === pendingDraft.program_id)?.price_info,
        });
        await widgets.setAmount({
          currency: selectedCurrency,
          value:
            typeof programPriceByCurrency === 'number'
              ? programPriceByCurrency
              : pendingDraft.program_price,
        });
        if (!hasRenderedWidgetRef.current) {
          await widgets.renderPaymentMethods({
            selector: '#reservation-payment-methods-modal',
            variantKey: paymentWidgetConfig?.variantKey ?? PaymentVariantKey.KOREA,
          });
          await widgets.renderAgreement({
            selector: '#reservation-payment-agreement-modal',
            variantKey: 'AGREEMENT',
          });
          hasRenderedWidgetRef.current = true;
        }
        if (isMounted) {
          setIsWidgetReady(true);
        }
      } catch (error) {
        if (isMounted) {
          setIsWidgetReady(false);
          showErrorToast(error, { fallbackMessage: t('payment.toastTossInitFailed') });
        }
      }
    };

    initializeWidget();
    return () => {
      isMounted = false;
    };
  }, [
    isPayNowPayment,
    pendingDraft,
    paymentWidgetConfig,
    programs,
    isPaymentWidgetOpen,
    showToast,
    showErrorToast,
    t,
  ]);

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
      <>
        <Meta {...meta} />
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
      </>
    );
  }

  // 비회원인 경우 페이지 내용을 숨기고 모달만 표시
  if (!isAuthenticated) {
    return (
      <>
        <Meta {...meta} />
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
      </>
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

  const formatPriceByCurrency = (
    priceInfo: { krw: number; usd: number } | undefined,
    currency: CurrencyCode
  ) => {
    const price = resolvePrice({
      currency,
      priceInfo,
    });
    if (typeof price !== 'number') return '';
    return `${new Intl.NumberFormat(locale).format(price)} ${currency}`;
  };

  const formatPrice = (priceInfo?: { krw: number; usd: number }) => {
    return formatPriceByCurrency(priceInfo, 'KRW');
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

  const buildDraft = (showErrors: boolean): ReservationDraft | null => {
    const showError = (key: string) => {
      if (showErrors) {
        showToast({ title: t(key as never), icon: 'exclaim' });
      }
    };

    if (!selectedProgramId) {
      showError('validation.selectProgram');
      return null;
    }

    if (!selectedContactMethod) {
      showError('validation.selectContact');
      return null;
    }

    const selectedContactValue = selectedContactMethod
      ? (contactValues[selectedContactMethod as keyof typeof contactValues] ?? '')
      : '';

    if (!selectedContactValue.trim()) {
      showError('validation.enterContact');
      return null;
    }

    if (selectedDates.length === 0) {
      showError('validation.selectDate');
      return null;
    }

    if (selectedDates.some((date) => isPastDate(date))) {
      showError('validation.pastDate');
      return null;
    }

    const hasEmptyTimes = selectedDates.some(
      (date) => (selectedTimes[formatDateForRequest(date)] || []).length === 0
    );

    if (hasEmptyTimes) {
      showError('validation.selectTimesPerDate');
      return null;
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
      showError('validation.selectTimeSlot');
      return null;
    }

    const hasDuplicateTimes = availabilityOptions.some((option) => {
      const uniqueTimes = new Set(option.times);
      return uniqueTimes.size !== option.times.length;
    });

    if (hasDuplicateTimes) {
      showError('validation.duplicateTimes');
      return null;
    }

    const normalizedContact = normalizeContactMethod(selectedContactMethod);
    const selectedProgram = programs.find((program) => program.id === selectedProgramId);
    if (!selectedProgram) {
      showError('validation.programNotFound');
      return null;
    }
    if (!company) {
      showError('validation.companyNotFound');
      return null;
    }
    const programPriceKrw = resolvePrice({
      currency: 'KRW',
      priceInfo: selectedProgram.price_info,
    });
    if (typeof programPriceKrw !== 'number') {
      showError('validation.programNotFound');
      return null;
    }

    return {
      company_id: company.id,
      company_name: company.name,
      company_address: company.address,
      company_tags: company.tags ?? [],
      company_primary_image_url: company.primary_image_url ?? '',
      program_id: selectedProgram.id,
      program_name: selectedProgram.name,
      program_duration_minutes: selectedProgram.duration_minutes,
      program_price: programPriceKrw,
      program_primary_image_url: selectedProgram.primary_image_url ?? '',
      preferred_contact: normalizedContact,
      language_preference: normalizeLanguage(language),
      availability_options: availabilityOptions,
      inquiries: inquiryText,
      contact_line: contactValues.line,
      contact_whatsapp: contactValues.whatsapp,
      contact_kakao: contactValues.kakao,
      contact_phone: contactValues.phone,
    };
  };

  const handleTossPayment = async (draft: ReservationDraft) => {
    if (!paymentWidgetsRef.current || !isWidgetReady) {
      showToast({ title: t('payment.toastTossInitFailed'), icon: 'exclaim' });
      return;
    }
    if (typeof window === 'undefined') return;

    window.sessionStorage.setItem('reservation_draft', JSON.stringify(draft));
    const successUrl = `${window.location.origin}/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT_SUCCESS}`;
    const failUrl = `${window.location.origin}/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT_FAIL}`;

    try {
      const selectedCurrency = paymentWidgetConfig?.currency ?? 'KRW';
      let order = paymentOrder;
      if (!order || order.program_id !== draft.program_id || order.currency !== selectedCurrency) {
        const response = await createPaymentOrder({
          programId: draft.program_id,
          currency: selectedCurrency,
        });
        order = response.order;
        setPaymentOrder(order);
      }

      logPaymentInfo('[payment][request] prepared order', {
        programId: draft.program_id,
        selectedCurrency,
        orderId: order.order_id,
        orderCurrency: order.currency,
        orderAmount: order.amount,
      });

      // Keep widget amount in sync with the order that will be confirmed on backend.
      await paymentWidgetsRef.current.setAmount({
        currency: selectedCurrency,
        value: order.amount,
      });
      window.sessionStorage.setItem(
        'reservation_payment_context',
        JSON.stringify({
          orderId: order.order_id,
          amount: order.amount,
          currency: selectedCurrency,
          programId: draft.program_id,
        })
      );

      await paymentWidgetsRef.current.requestPayment({
        orderId: order.order_id,
        orderName: draft.program_name,
        successUrl,
        failUrl,
      });
    } catch (error) {
      showErrorToast(error, { fallbackMessage: t('payment.toastTossRequestFailed') });
    }
  };

  const handleSubmit = async () => {
    const draft = buildDraft(true);
    if (!draft) return;
    if (isPayNowPayment && !isPolicyAccepted) {
      showToast({ title: t('payment.refundAcceptRequired'), icon: 'exclaim' });
      return;
    }

    if (isPayNowPayment) {
      setPendingDraft(draft);
      setIsPaymentWidgetOpen(true);
      return;
    }

    setPendingDraft(draft);
    setIsPaymentModalOpen(true);
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

      router.push(`/${currentLocale}${ROUTES.RESERVATIONS_PAYMENT_SUCCESS}`);
    } catch (error) {
      showErrorToast(error, { fallbackMessage: t('payment.toastFailed') });
    }
  };

  const selectedProgram = programs.find((program) => program.id === selectedProgramId);
  const selectedPaymentCurrency: CurrencyCode = paymentMethodChoice === 'payNowUsd' ? 'USD' : 'KRW';
  const summaryDate = selectedDates[0];
  const summaryDateKey = summaryDate ? formatDateForRequest(summaryDate) : '';
  const summaryTimes = summaryDateKey ? (selectedTimes[summaryDateKey] ?? []) : [];
  const summaryTimeText = summaryTimes.length > 0 ? summaryTimes.join(' / ') : '-';
  const summaryPriceText = selectedProgram
    ? formatPriceByCurrency(selectedProgram.price_info, selectedPaymentCurrency) || '-'
    : '-';

  const handleOpenRefundPolicy = () => {
    if (typeof window === 'undefined') return;
    window.open(RESERVATION_REFUND_POLICY_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <Meta {...meta} />
      <Layout isAppBarExist={false} title={t('title')} showFooter={false}>
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
          {hasValidCompanyId && (
            <div css={contentGrid}>
              <div css={sideColumn}>
                <div css={sidePanel}>
                  {company && (
                    <div css={companyInfoCard}>
                      <img
                        src={company.primary_image_url || '/default.png'}
                        alt={company.name}
                        css={companyImage}
                      />
                      <CompanyInfoCard
                        name={company.name}
                        address={company.address}
                        tags={company.tags ?? []}
                        addressIconNode={<PaymentLocation width={16} height={16} />}
                        variant="payment"
                      />
                    </div>
                  )}
                  {shouldShowCompanySkeleton && (
                    <div css={companyInfoCard}>
                      <Skeleton width="100%" height={160} radius={12} />
                      <div css={sideCardSkeletonContent}>
                        <Skeleton width="65%" height={24} />
                        <Skeleton width="85%" height={16} />
                        <div css={sideCardSkeletonTags}>
                          <Skeleton width={64} height={24} radius={999} />
                          <Skeleton width={72} height={24} radius={999} />
                          <Skeleton width={58} height={24} radius={999} />
                        </div>
                      </div>
                    </div>
                  )}
                  <div css={desktopSubmitWrapper}>
                    <CTAButton
                      onClick={handleSubmit}
                      disabled={isCreatingReservation || isPaymentOrderPending}
                    >
                      {isPayNowPayment ? t('payment.payNow') : t('payment.bookNow')}
                    </CTAButton>
                  </div>
                </div>
              </div>

              <div css={mainColumn}>
                {/* Programs Section */}
                <ProgramSection
                  isOpen={isProgramsOpen}
                  onToggle={() => setIsProgramsOpen((prev) => !prev)}
                  isLoading={isProgramSectionLoading}
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
                  isLoading={isContactSectionLoading}
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

                <div css={paymentSection}>
                  <Text typo="title_M" color="text_primary">
                    {t('payment.paymentMethod')}
                  </Text>
                  <div css={paymentMethodOptions}>
                    <button
                      type="button"
                      css={paymentMethodButton}
                      data-selected={paymentMethodChoice === 'payNowKrw'}
                      onClick={() => setPaymentMethodChoice('payNowKrw')}
                    >
                      <span css={radioDot(paymentMethodChoice === 'payNowKrw')} />
                      <Text typo="body_M" color="text_primary">
                        {t('payment.payNowKrw')}
                      </Text>
                    </button>
                    <button
                      type="button"
                      css={paymentMethodButton}
                      data-selected={paymentMethodChoice === 'payNowUsd'}
                      onClick={() => setPaymentMethodChoice('payNowUsd')}
                    >
                      <span css={radioDot(paymentMethodChoice === 'payNowUsd')} />
                      <Text typo="body_M" color="text_primary">
                        {t('payment.payNowUsd')}
                      </Text>
                    </button>
                    <button
                      type="button"
                      css={paymentMethodButton}
                      data-selected={paymentMethodChoice === 'onSite'}
                      onClick={() => setPaymentMethodChoice('onSite')}
                    >
                      <span css={radioDot(paymentMethodChoice === 'onSite')} />
                      <Text typo="body_M" color="text_primary">
                        {t('payment.payOnSite')}
                      </Text>
                    </button>
                  </div>
                </div>

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

                {isPayNowPayment && (
                  <div css={policyCard}>
                    <ReservationPolicyPanel
                      title={t('payment.refundTitle')}
                      actionLabel={t('payment.refundMore')}
                      onActionClick={handleOpenRefundPolicy}
                      acceptLabel={t('payment.refundAccept')}
                      accepted={isPolicyAccepted}
                      onAcceptedChange={setIsPolicyAccepted}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {hasValidCompanyId && (
            <div css={submitButtonWrapper}>
              <CTAButton
                onClick={handleSubmit}
                disabled={
                  isCreatingReservation ||
                  isPaymentOrderPending ||
                  (isPayNowPayment && !isPolicyAccepted)
                }
              >
                {isPayNowPayment ? t('payment.payNow') : t('payment.bookNow')}
              </CTAButton>
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
        {isPaymentWidgetOpen && pendingDraft && (
          <>
            <Dim fullScreen onClick={closePaymentWidgetModal} />
            <div css={paymentWidgetModal}>
              <div css={paymentWidgetHeader}>
                <Text typo="title_M" color="text_primary">
                  {t('payment.tossWidgetTitle')}
                </Text>
                <button type="button" css={modalClose} onClick={closePaymentWidgetModal}>
                  ×
                </button>
              </div>
              {!isWidgetReady && (
                <Text typo="body_M" color="text_secondary">
                  {t('payment.tossPreparing')}
                </Text>
              )}
              <div id="reservation-payment-methods-modal" css={widgetBox} />
              <div id="reservation-payment-agreement-modal" css={widgetBox} />
              <div css={paymentWidgetAction}>
                <CTAButton
                  onClick={() => handleTossPayment(pendingDraft)}
                  disabled={!isWidgetReady || isPaymentOrderPending}
                >
                  {t('payment.payNow')}
                </CTAButton>
              </div>
            </div>
          </>
        )}
      </Layout>
    </>
  );
}

// Styles
const pageWrapper = css`
  padding: 0 0 120px;

  background: ${theme.colors.bg_surface1};

  @media (min-width: ${theme.breakpoints.desktop}) {
    padding: 96px 0 80px;
  }
`;

const desktopAppBar = css`
  display: none;

  @media (min-width: ${theme.breakpoints.desktop}) {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    left: 0;
    z-index: ${theme.zIndex.dialog};

    background: ${theme.colors.bg_surface1};
    border-bottom: 1px solid ${theme.colors.border_default};
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
    align-items: start;
    gap: 24px;

    max-width: 1200px;
    margin: 0 auto;
    padding: 24px;
    grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.6fr);
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
    position: sticky;
    top: 96px;
    z-index: 0;
    order: 2;
    align-self: flex-start;
  }
`;

const sidePanel = css`
  @media (min-width: ${theme.breakpoints.desktop}) {
    position: relative;
    z-index: 0;

    padding: 16px;
    border: 1px solid ${theme.colors.border_default};
    border-radius: 20px;

    background: ${theme.colors.bg_surface1};
  }
`;

const companyInfoCard = css`
  overflow: hidden;

  margin-bottom: 12px;
  padding: 12px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

const companyImage = css`
  display: block;

  width: 100%;
  height: 160px;
  border-radius: 12px;
  object-fit: cover;
`;

const sideCardSkeletonContent = css`
  display: flex;
  flex-direction: column;
  gap: 10px;

  padding: 14px 4px 2px;
`;

const sideCardSkeletonTags = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const paymentSection = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  margin: 12px 16px 8px;
  padding: 20px 18px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

const paymentMethodOptions = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const paymentMethodButton = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 999px;

  background: ${theme.colors.white};

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  cursor: pointer;

  &[data-selected='true'] {
    border-color: ${theme.colors.primary50};

    box-shadow: 0 4px 10px ${theme.colors.grayOpacity50};
  }
`;

const radioDot = (selected: boolean) => css`
  width: 14px;
  height: 14px;
  border: 2px solid ${selected ? theme.colors.primary50 : theme.colors.border_default};
  border-radius: 50%;

  background: ${selected ? theme.colors.primary50 : theme.colors.white};
`;

const widgetBox = css`
  overflow: hidden;

  border-radius: 12px;
`;

const paymentWidgetModal = css`
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: ${theme.zIndex.dialog};
  overflow: auto;

  width: calc(100% - 48px);
  max-width: 720px;
  max-height: 80vh;
  padding: 24px;
  border-radius: 24px;

  background: ${theme.colors.white};
  box-shadow: 0 16px 32px ${theme.colors.grayOpacity200};
`;

const paymentWidgetHeader = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const modalClose = css`
  border: none;

  background: transparent;
  color: ${theme.colors.text_secondary};
  font-size: 20px;

  cursor: pointer;
`;

const paymentWidgetAction = css`
  margin-top: 8px;
`;

const summaryCard = css`
  display: flex;
  flex-direction: column;
  gap: 12px;

  margin: 12px 16px 8px;
  padding: 20px 18px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
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

const policyCard = css`
  margin: 12px 16px 8px;
  padding: 20px 18px;
  border-radius: 16px;

  background: ${theme.colors.white};
  box-shadow: 0 6px 16px ${theme.colors.grayOpacity50};
`;

const submitButtonWrapper = css`
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;

  padding: 16px 18px;

  background: ${theme.colors.white};
  box-shadow: 0 -2px 10px rgb(0 0 0 / 10%);

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
  z-index: ${theme.zIndex.dialog};

  width: calc(100% - 48px);
  max-width: 360px;
  padding: 28px 24px 24px;
  border-radius: 24px;

  background: ${theme.colors.white};
  box-shadow: 0 16px 32px ${theme.colors.grayOpacity200};
  text-align: center;
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
  padding: 12px 0;
  border: 1px solid ${theme.colors.primary50};
  border-radius: 999px;

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

const emptyContainer = css`
  margin: 24px 16px;
`;

export const getServerSideProps = getI18nServerSideProps(['reservation']);
