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
import { Loading } from '@/components/common';

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

interface CompanyInfoProps {
  data: CompanyDetail;
}
export function CompanyInfo({ data }: CompanyInfoProps) {
  const t = useTranslations('company-detail');
  const [isHoursOpen, setIsHoursOpen] = useState(false);
  const [isRecognitionOpen, setIsRecognitionOpen] = useState(false);
  const [isGettingHereOpen, setIsGettingHereOpen] = useState(false);
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(false);

  if (!data) {
    return <Loading title={t('loading')} />;
  }

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

  // if (isError) {
  //   open({
  //     title: '로그인 후 이용해 주세요',
  //     primaryActionLabel: '로그인 하기',
  //     onPrimaryAction: () => router.replace(ROUTES.LOGIN),
  //     secondaryActionLabel: '닫기',
  //   });
  //   router.back();
  // }

  return (
    <div css={container}>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          Editor&apos;s Comment
        </Text>

        <div css={infoWrapper}>
          <div css={recognitionHeader} onClick={() => setIsRecognitionOpen((prev) => !prev)}>
            <Text typo="title_S" color="text_primary">
              Official Recognition
            </Text>
            <div css={hoursArrow(isRecognitionOpen)}>
              <ArrowDown width={30} height={30} />
            </div>
          </div>
          {isRecognitionOpen && (
            <Text typo="body_M" color="text_secondary" css={recognitionContent}>
              {recognitionText || t('infoPending')}
            </Text>
          )}
        </div>
        <div css={infoWrapper}>
          <div css={recognitionHeader} onClick={() => setIsGettingHereOpen((prev) => !prev)}>
            <Text typo="title_S" color="text_primary">
              Getting Here
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
              Highlights
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
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          Operation Information
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
                    {isCurrentlyOpen ? 'Open' : 'Closed'}
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

          <InfoRow
            icon={<ClinicGlobe width={16} height={16} />}
            title={
              <Text
                typo="button_S"
                color="primary50"
                onClick={() => window.open(data.website_url, '_blank')}
              >
                {data.website_url}
              </Text>
            }
            expandable
            showToggleButton
          >
            {/* <div css={urlWrapper}>
              {urlList.map(({ type, url }) => (
                <Text
                  key={type}
                  typo="button_S"
                  color="primary50"
                  onClick={() => window.open(url, '_blank')}
                >
                  {type}
                </Text>
              ))}
            </div> */}
          </InfoRow>
        </div>
      </div>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          Location
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
            Facilities
          </Text>
          <div css={infoWrapper}>
            {availableFacilities.map((facility) => (
              <InfoRow
                key={facility.key}
                icon={facility.icon}
                title={
                  <Text typo="button_S" color="text_primary">
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
