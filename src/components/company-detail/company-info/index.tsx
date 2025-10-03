// import { useUserReservationGroomingListQuery } from '~/queries/reservation';
import { CompanyDetail } from '@/models';
import { container, wrapper, infoWrapper } from './index.styles';
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
import { CompanyGoogleMap } from '@/components/map/google-map';
import { ROUTES } from '@/constants';
import router from 'next/router';

interface CompanyInfoProps {
  data: CompanyDetail;
}
export function CompanyInfo({ data }: CompanyInfoProps) {
  if (!data) {
    return <div>데이터를 불러오는 중...</div>;
  }
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
    <div css={container}>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          Operation Information
        </Text>
        <div css={infoWrapper}>
          <InfoRow
            icon={<ClinicLocation width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                {data.address}
              </Text>
            }
          />
          <InfoRow
            icon={<ClinicClock width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                영업중
              </Text>
            }
            expandable
            showToggleButton
          >
            {/* <div css={operatingWrapper}>
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
            </div> */}
          </InfoRow>

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
          Facilities
        </Text>
        <div css={infoWrapper}>
          <InfoRow
            icon={<ClinicParking width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                주차 가능
              </Text>
            }
          />
          <InfoRow
            icon={<ClinicWifi width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                무료 Wifi
              </Text>
            }
          />
          <InfoRow
            icon={<ClinicLuggage width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                짐 보관
              </Text>
            }
          />
          <InfoRow
            icon={<ClinicPrivate width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                프라이빗 진료
              </Text>
            }
          />
          <InfoRow
            icon={<ClinicPickup width={16} height={16} />}
            title={
              <Text typo="button_S" color="text_primary">
                공항 픽업
              </Text>
            }
          />
        </div>
      </div>
      <div css={wrapper}>
        <Text typo="title_M" color="text_primary">
          Location
        </Text>
        <CompanyGoogleMap address={data.address} />
      </div>

      <CTAButton onClick={handleReserveClick}>예약하기</CTAButton>
    </div>
  );
}
