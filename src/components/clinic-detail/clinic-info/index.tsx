// import { useUserReservationGroomingListQuery } from '~/queries/reservation';
import { Hospital } from '@/models';
import {
  wrapper,
  infoWrapper,
  urlWrapper,
  contents,
  item,
  textWrapper,
  itemWrapper,
} from './index.styles';
import { ClinicLocation } from '@/icons/ClinicLocation';
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
import { CTAButton } from '@/components/button';
import { ClinicGoogleMap } from '@/components/map/google-map';
import { ClinicIntroduction } from '../clinic-introduction';
import { css } from '@emotion/react';
import { DAY_KR, ROUTES } from '@/constants';
import router from 'next/router';

interface ClinicInfoProps {
  clinicData: Hospital;
}
export function ClinicInfo({ clinicData }: ClinicInfoProps) {
  const urlList = [
    { type: 'Instagram', url: clinicData.instagram },
    { type: 'Line', url: clinicData.line },
    { type: 'Youtube', url: clinicData.youtube },
  ].filter(({ url }) => url?.trim() !== '');

  const detail = clinicData.hospital_details?.[0];

  const closedDays =
    detail?.operating_hours
      ?.filter((item) => item.is_closed)
      ?.map((item) => DAY_KR[item.day_of_week]) || [];

  const closedText = closedDays.length > 0 ? `매주 ${closedDays.join('·')} 휴무` : '영업중';
  // const { data, isError } = useUserReservationGroomingListQuery();

  // if (isError) {
  //   open({
  //     title: '로그인 후 이용해 주세요',
  //     primaryActionLabel: '로그인 하기',
  //     onPrimaryAction: () => router.replace(ROUTES.LOGIN),
  //     secondaryActionLabel: '닫기',
  //   });
  //   router.back();
  // }

  // const reservations = data?.contents || [];
  // ✅ RN → Web 통신 응답 처리
  // useEffect(() => {
  //   const handleMessage = (event: MessageEvent) => {
  //     try {
  //       const data = JSON.parse(event.data);
  //       if (data.type === 'AUTH_STATUS') {
  //         const isLoggedIn = data.payload?.isLoggedIn;

  //         if (isLoggedIn) {
  //           router.push(`/reservation?hospital_id=${clinicData.hospital_id}`); // ✅ 예약페이지 이동
  //         } else {
  //           window?.ReactNativeWebView?.postMessage(
  //             JSON.stringify({ type: 'LOGIN_REQUEST' }) // ✅ 로그인 요청
  //           );
  //         }
  //       }
  //     } catch (e) {
  //       console.error('Invalid message received:', event.data);
  //     }
  //   };

  //   window.addEventListener('message', handleMessage);
  //   return () => window.removeEventListener('message', handleMessage);
  // }, [router, clinicData.hospital_id]);

  // ✅ 예약하기 버튼 클릭 시 토큰 여부에 따라 동작
  const handleReserveClick = () => {
    const token = localStorage.getItem('token');
    if (token) {
      // 로그인된 상태 → 예약페이지로 이동
      router.push(ROUTES.RESERVATIONS);
    } else {
      // 로그인 안 된 상태 → RN에 로그인 요청
      window.ReactNativeWebView?.postMessage(JSON.stringify({ type: 'LOGIN_REQUEST' }));
    }
  };
  return (
    <div css={wrapper}>
      <div css={infoWrapper}>
        <InfoRow
          icon={<ClinicLocation width={16} height={16} />}
          title={
            <Text typo="button_S" color="text_primary">
              {clinicData.address}
            </Text>
          }
        />
        <InfoRow
          icon={<ClinicClock width={16} height={16} />}
          title={
            <Text typo="button_S" color="text_primary">
              영업중 {closedDays.length > 0 && closedText}
            </Text>
          }
          expandable
          showToggleButton
        >
          <div css={operatingWrapper}>
            {detail?.operating_hours?.map((hour) => {
              const dayName = DAY_KR[hour.day_of_week];

              if (hour.is_closed) {
                return (
                  <Text key={dayName} typo="button_S" color="text_secondary">
                    {dayName} 휴무
                  </Text>
                );
              }

              return (
                <Text key={dayName} typo="button_S" color="text_secondary">
                  {dayName} {hour.open_time} ~ {hour.close_time}
                </Text>
              );
            }) || []}
          </div>
        </InfoRow>

        <InfoRow
          icon={<ClinicContact width={16} height={16} />}
          title={
            <Text typo="button_S" color="text_primary">
              {clinicData.contact}
            </Text>
          }
        />

        <InfoRow
          icon={<ClinicGlobe width={16} height={16} />}
          title={
            <Text
              typo="button_S"
              color="primary50"
              onClick={() => window.open(clinicData.website, '_blank')}
            >
              {clinicData.website}
            </Text>
          }
          expandable
          showToggleButton
        >
          <div css={urlWrapper}>
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
          </div>
        </InfoRow>
      </div>
      <div css={contents}>
        <ClinicIntroduction title="한의원 소개">
          <Text typo="body_M" color="text_primary">
            {clinicData.hospital_description}
          </Text>
        </ClinicIntroduction>
        <ClinicIntroduction title="편의시설" showToggle={false}>
          <div css={itemWrapper}>
            <div css={item}>
              <ClinicParking width={24} height={24} />
              <Text typo="body_S" color="text_tertiary" css={textWrapper}>
                주차 가능
              </Text>
            </div>
            <div css={item}>
              <ClinicWifi width={24} height={24} />
              <Text typo="body_S" color="text_tertiary" css={textWrapper}>
                무료 Wifi
              </Text>
            </div>
            <div css={item}>
              <ClinicLuggage width={24} height={24} />
              <Text typo="body_S" color="text_tertiary" css={textWrapper}>
                짐 보관
              </Text>
            </div>
            <div css={item}>
              <ClinicPrivate width={24} height={24} />
              <Text typo="body_S" color="text_tertiary" css={textWrapper}>
                프라이빗 진료
              </Text>
            </div>
            <div css={item}>
              <ClinicPickup width={24} height={24} />
              <Text typo="body_S" color="text_tertiary" css={textWrapper}>
                공항 픽업
              </Text>
            </div>
          </div>
        </ClinicIntroduction>

        <ClinicIntroduction title="지도" showToggle={false}>
          <ClinicGoogleMap address={clinicData.address} />
        </ClinicIntroduction>
      </div>
      <CTAButton onClick={handleReserveClick}>예약하기</CTAButton>
    </div>
  );
}
export const operatingWrapper = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 6px;
`;
