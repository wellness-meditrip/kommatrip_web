// import { useUserReservationGroomingListQuery } from '~/queries/reservation';
import { CompanyDetail } from '@/models';
import {
  container,
  wrapper,
  infoWrapper,
  hoursWrapper,
  hoursIcon,
  hoursContent,
  hoursHeader,
  hoursHeaderLeft,
  hoursArrow,
  hoursDetailWrapper,
  hoursDetailRow,
  dayLabel,
  recognitionContent,
  recognitionHeader,
  contactList,
  contactRow,
  contactLabel,
  facilityIcon,
  theGateSpaArticle,
  theGateSpaFeature,
  theGateSpaFeatureCopy,
  theGateSpaFeatureGrid,
  theGateSpaFeatureStack,
  theGateSpaHeader,
  theGateSpaHeroImage,
  theGateSpaImageGrid,
  theGateSpaIntro,
  theGateSpaKicker,
  theGateSpaParagraph,
  theGateSpaSection,
  theGateSpaSectionCopy,
  theGateSpaSectionImage,
  theGateSpaSectionTitle,
  theGateSpaTitle,
} from './index.styles';
import { Text } from '@/components/text';
import {
  ClinicClock,
  ClinicContact,
  ClinicGlobe,
  ClinicLuggage,
  ClinicParking,
  ClinicPickup,
  ClinicPrivate,
  ClinicWifi,
} from '@/icons';
import { InfoRow } from '@/components/info-row';
import { CompanyGoogleMap } from '@/components/map/google-map';
import { useState } from 'react';
import { ArrowDown } from '@/icons';
import { useTranslations } from 'next-intl';
import { isTheGateSpaCompany } from '@/utils/the-gate-spa-discount';

// Facilities 매핑 (API 데이터 -> 아이콘 + 한글 텍스트)
const FACILITY_MAP: Record<string, { icon: React.ReactElement; label: string }> = {
  'Parking lot': {
    icon: <ClinicParking width={16} height={16} />,
    label: 'Parking lot',
  },
  'Free Wi-Fi': {
    icon: <ClinicWifi width={16} height={16} />,
    label: 'Free Wi-Fi',
  },
  'Information Desk': {
    icon: <ClinicLuggage width={16} height={16} />,
    label: 'Information Desk',
  },
  'Private room': {
    icon: <ClinicPrivate width={16} height={16} />,
    label: 'Private room',
  },
  'Airport pickup': {
    icon: <ClinicPickup width={16} height={16} />,
    label: 'Airport pickup',
  },
} as const;

// 요일 순서 및 매핑
const DAYS_ORDER = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKEND_DAYS = ['Sat', 'Sun'];

const THE_GATE_SPA_IMAGES = {
  roomWide: '/images/company/the-gate-spa/treatment-room-wide.jpg',
  hallway: '/images/company/the-gate-spa/hallway.jpg',
  roomDoor: '/images/company/the-gate-spa/private-room-entrance.jpg',
  bathDetail: '/images/company/the-gate-spa/bathroom-detail.jpg',
  shower: '/images/company/the-gate-spa/shower.jpg',
  basin: '/images/company/the-gate-spa/basin.jpg',
  vanity: '/images/company/the-gate-spa/vanity.jpg',
  sign: '/images/company/the-gate-spa/entrance-sign.jpg',
} as const;

const THE_GATE_SPA_FEATURES = [
  {
    key: 'privateRoom',
    images: [
      { src: THE_GATE_SPA_IMAGES.roomDoor, altKey: 'privateRoomEntrance' },
      { src: THE_GATE_SPA_IMAGES.roomWide, altKey: 'treatmentRoom' },
      { src: THE_GATE_SPA_IMAGES.vanity, altKey: 'roomVanity' },
    ],
  },
  {
    key: 'showerPowder',
    images: [
      { src: THE_GATE_SPA_IMAGES.shower, altKey: 'shower' },
      { src: THE_GATE_SPA_IMAGES.basin, altKey: 'basin' },
      { src: THE_GATE_SPA_IMAGES.bathDetail, altKey: 'bathDetail' },
    ],
  },
  {
    key: 'calmFlow',
    images: [
      { src: THE_GATE_SPA_IMAGES.sign, altKey: 'sign' },
      { src: THE_GATE_SPA_IMAGES.hallway, altKey: 'hallway' },
      { src: THE_GATE_SPA_IMAGES.roomDoor, altKey: 'roomEntrance' },
    ],
  },
] as const;

const getStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

interface CompanyInfoProps {
  data: CompanyDetail;
}

function TheGateSpaStory() {
  const t = useTranslations('company-detail');
  const translatedIntroParagraphs = getStringArray(t.raw('theGateSpa.intro'));

  return (
    <article css={theGateSpaArticle}>
      <header css={theGateSpaHeader}>
        <Text tag="p" typo="button_S" color="primary50" css={theGateSpaKicker}>
          {t('theGateSpa.kicker')}
        </Text>
        <Text tag="h2" typo="title_L" color="text_primary" css={theGateSpaTitle}>
          {t('theGateSpa.title')}
        </Text>
      </header>

      <img
        src={THE_GATE_SPA_IMAGES.roomWide}
        alt={t('theGateSpa.imageAlt.hero')}
        css={theGateSpaHeroImage}
      />

      <div css={theGateSpaIntro}>
        {translatedIntroParagraphs.map((paragraph, index) => (
          <Text
            key={`${paragraph.slice(0, 20)}-${index}`}
            tag="p"
            typo="body_M"
            color="text_secondary"
            css={theGateSpaParagraph}
          >
            {paragraph}
          </Text>
        ))}
      </div>

      <section css={theGateSpaSection}>
        <img
          src={THE_GATE_SPA_IMAGES.sign}
          alt={t('theGateSpa.imageAlt.sign')}
          css={theGateSpaSectionImage}
          loading="lazy"
        />
        <div css={theGateSpaSectionCopy}>
          <Text tag="h3" typo="title_M" color="text_primary" css={theGateSpaSectionTitle}>
            {t('theGateSpa.privateSpa.title')}
          </Text>
          <Text tag="p" typo="body_M" color="text_secondary" css={theGateSpaParagraph}>
            {t('theGateSpa.privateSpa.description')}
          </Text>
        </div>
      </section>

      <section css={theGateSpaFeatureStack}>
        <Text tag="h3" typo="title_M" color="text_primary" css={theGateSpaSectionTitle}>
          {t('theGateSpa.featuresTitle')}
        </Text>

        {THE_GATE_SPA_FEATURES.map((feature) => (
          <div key={feature.key} css={theGateSpaFeature}>
            <div css={theGateSpaImageGrid}>
              {feature.images.map((image) => (
                <img
                  key={image.src}
                  src={image.src}
                  alt={t(`theGateSpa.imageAlt.${image.altKey}`)}
                  css={theGateSpaFeatureGrid}
                  loading="lazy"
                />
              ))}
            </div>
            <div css={theGateSpaFeatureCopy}>
              <Text tag="h4" typo="title_S" color="text_primary" css={theGateSpaSectionTitle}>
                {t(`theGateSpa.features.${feature.key}.title`)}
              </Text>
              <Text tag="p" typo="body_M" color="text_secondary" css={theGateSpaParagraph}>
                {t(`theGateSpa.features.${feature.key}.description`)}
              </Text>
            </div>
          </div>
        ))}
      </section>
    </article>
  );
}

export function CompanyInfo({ data }: CompanyInfoProps) {
  const t = useTranslations('company-detail');
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isRecognitionOpen, setIsRecognitionOpen] = useState(false);
  const [isGettingHereOpen, setIsGettingHereOpen] = useState(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);

  // API에서 받은 facilities 필터링
  const availableFacilities = (data.facilities || [])
    .filter((facility) => FACILITY_MAP[facility])
    .map((facility) => ({
      ...FACILITY_MAP[facility],
      key: facility,
    }));

  // 영업일 체크
  const businessDaysSet = new Set(data.business_days || []);
  const closedDays = DAYS_ORDER.filter((day) => !businessDaysSet.has(day));

  // 각 요일별 영업시간 생성
  const weeklyHours = DAYS_ORDER.map((day) => {
    const isOpen = businessDaysSet.has(day);
    if (!isOpen) {
      return { day, hours: '-' };
    }

    // Weekday or Weekend 구분
    if (WEEKDAYS.includes(day)) {
      return {
        day,
        hours: `${data.weekday_open_time} - ${data.weekday_close_time}`,
      };
    } else if (WEEKEND_DAYS.includes(day)) {
      return {
        day,
        hours: `${data.weekend_open_time} - ${data.weekend_close_time}`,
      };
    }

    return { day, hours: '-' };
  });

  // 현재 영업 여부 및 휴무일 텍스트
  const isCurrentlyOpen = businessDaysSet.size > 0;
  const closedText =
    closedDays.length > 0 ? `Closed every ${closedDays.join(', ')}` : 'Open every day';
  // const urlList = [
  //   { type: 'Instagram', url: data.instagram },
  //   { type: 'Line', url: data.line },
  //   { type: 'Youtube', url: data.youtube },
  // ].filter(({ url }) => url?.trim() !== '');

  // const detail = data.hospital_details[0];

  // const closedDays =
  //   detail?.operating_hours
  //     ?.filter((item) => item.is_closed)
  //     ?.map((item) => DAY_KR[item.day_of_week]) || [];

  // const closedText = closedDays.length > 0 ? `매주 ${closedDays.join('·')} 휴무` : '영업중';
  // const { data, isError } = useUserReservationGroomingListQuery();

  const recognitionText = data.badge?.replace(/\\n/g, '\n').trim() ?? '';
  const gettingHereText = data.getting_here?.replace(/\\n/g, '\n').trim() ?? '';
  const highlightsText = data.highlights?.replace(/\\n/g, '\n').trim() ?? '';
  const websiteUrl = data.website_url?.trim() ?? '';
  const instagramUrl = data.instagram_url?.trim() ?? '';
  const whatsappUrl = data.whats_app_url?.trim() ?? '';
  const isTheGateSpa = isTheGateSpaCompany({
    name: data.name,
    company_code: data.company_code,
  });

  const handleOpenLink = (value: string, type?: 'instagram') => {
    if (!value) return;
    const trimmedValue = value.trim();
    const url =
      trimmedValue.startsWith('http://') || trimmedValue.startsWith('https://')
        ? trimmedValue
        : trimmedValue.startsWith('www.')
          ? `https://${trimmedValue}`
          : type === 'instagram' && trimmedValue.startsWith('@')
            ? `https://instagram.com/${trimmedValue.slice(1)}`
            : '';
    if (url) {
      window.open(url, '_blank');
    }
  };

  return (
    <div css={container}>
      {isTheGateSpa ? (
        <TheGateSpaStory />
      ) : (
        <div css={wrapper}>
          <Text typo="title_M" color="text_primary">
            {t('editorComment')}
          </Text>

          {recognitionText && (
            <div css={infoWrapper}>
              <div css={recognitionHeader} onClick={() => setIsRecognitionOpen((prev) => !prev)}>
                <Text typo="title_S" color="text_primary">
                  {t('officialRecognition')}
                </Text>
                <div css={hoursArrow(isRecognitionOpen)}>
                  <ArrowDown width={30} height={30} />
                </div>
              </div>
              {isRecognitionOpen && (
                <Text typo="body_M" color="text_secondary" css={recognitionContent}>
                  {recognitionText}
                </Text>
              )}
            </div>
          )}
          <div css={infoWrapper}>
            <div css={recognitionHeader} onClick={() => setIsGettingHereOpen((prev) => !prev)}>
              <Text typo="title_S" color="text_primary">
                {t('gettingHere')}
              </Text>
              <div css={hoursArrow(isGettingHereOpen)}>
                <ArrowDown width={30} height={30} />
              </div>
            </div>
            {isGettingHereOpen && (
              <Text typo="body_M" color="text_secondary" css={recognitionContent}>
                {gettingHereText || t('infoPending')}
              </Text>
            )}
          </div>
          <div css={infoWrapper}>
            <div css={recognitionHeader} onClick={() => setIsHighlightsOpen((prev) => !prev)}>
              <Text typo="title_S" color="text_primary">
                {t('highlights')}
              </Text>
              <div css={hoursArrow(isHighlightsOpen)}>
                <ArrowDown width={30} height={30} />
              </div>
            </div>
            {isHighlightsOpen && (
              <Text typo="body_M" color="text_secondary" css={recognitionContent}>
                {highlightsText || t('infoPending')}
              </Text>
            )}
          </div>
        </div>
      )}
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          {t('operationInfo')}
        </Text>
        <div css={infoWrapper}>
          <div css={hoursWrapper}>
            <div css={hoursIcon}>
              <ClinicClock width={16} height={16} />
            </div>
            <div css={hoursContent}>
              <div css={hoursHeader(isHoursOpen)} onClick={() => setIsHoursOpen(!isHoursOpen)}>
                <div css={hoursHeaderLeft}>
                  <Text typo="button_S" color={isCurrentlyOpen ? 'primary50' : 'text_secondary'}>
                    {isCurrentlyOpen ? t('open') : t('closed')}
                  </Text>
                  <Text typo="button_S" color="text_secondary">
                    {closedText}
                  </Text>
                </div>
                <div css={hoursArrow(isHoursOpen)}>
                  <ArrowDown width={16} height={16} />
                </div>
              </div>

              {isHoursOpen && (
                <div css={hoursDetailWrapper}>
                  {weeklyHours.map(({ day, hours }) => (
                    <div key={day} css={hoursDetailRow}>
                      <Text typo="button_S" color="text_secondary" css={dayLabel}>
                        {day}
                      </Text>
                      <Text typo="button_S" color="text_primary">
                        {hours}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <InfoRow
            icon={<ClinicContact width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                {data.phone}
              </Text>
            }
          />

          {(websiteUrl || instagramUrl || whatsappUrl) && (
            <InfoRow
              icon={<ClinicGlobe width={16} height={16} />}
              title={
                <div css={contactList}>
                  {websiteUrl && (
                    <div css={contactRow}>
                      <Text typo="button_S" color="text_secondary" css={contactLabel}>
                        {t('website')}
                      </Text>
                      <Text
                        typo="button_S"
                        color="primary50"
                        onClick={() => handleOpenLink(websiteUrl)}
                      >
                        {websiteUrl}
                      </Text>
                    </div>
                  )}
                  {instagramUrl && (
                    <div css={contactRow}>
                      <Text typo="button_S" color="text_secondary" css={contactLabel}>
                        {t('instagram')}
                      </Text>
                      <Text
                        typo="button_S"
                        color="primary50"
                        onClick={() => handleOpenLink(instagramUrl, 'instagram')}
                      >
                        {instagramUrl}
                      </Text>
                    </div>
                  )}
                  {whatsappUrl && (
                    <div css={contactRow}>
                      <Text typo="button_S" color="text_secondary" css={contactLabel}>
                        {t('whatsapp')}
                      </Text>
                      <Text
                        typo="button_S"
                        color="primary50"
                        onClick={() => handleOpenLink(whatsappUrl)}
                      >
                        {whatsappUrl}
                      </Text>
                    </div>
                  )}
                </div>
              }
            />
          )}
        </div>
      </div>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          {t('location')}
        </Text>
        <CompanyGoogleMap
          address={data.address}
          latitude={data.latitude}
          longitude={data.longitude}
        />
      </div>
      {availableFacilities.length > 0 && (
        <div css={wrapper}>
          <Text typo="title_M" color="text_primary">
            {t('facilities')}
          </Text>
          <div css={infoWrapper}>
            {availableFacilities.map((facility) => (
              <InfoRow
                key={facility.key}
                icon={<span css={facilityIcon}>{facility.icon}</span>}
                title={
                  <Text typo="button_S" color="primary30">
                    {facility.label}
                  </Text>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
