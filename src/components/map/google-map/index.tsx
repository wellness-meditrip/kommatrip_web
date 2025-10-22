'use client'; // 클라이언트 컴포넌트
import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

interface Props {
  address: string;
}

export function CompanyGoogleMap({ address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY!, // ✅ .env에 API 키 설정 필요
      version: 'beta',
      libraries: ['marker', 'places'],
    });

    let mapInstance: google.maps.Map;

    loader.load().then(() => {
      if (!mapRef.current) return;

      const geocoder = new google.maps.Geocoder();

      geocoder.geocode(
        { address },
        (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
          if (status === 'OK' && results && results[0]) {
            const location = results[0].geometry.location;

            mapInstance = new google.maps.Map(mapRef.current!, {
              center: location,
              zoom: 15,
              mapId: process.env.NEXT_PUBLIC_MAP_ID_API_KEY,
            });

            new google.maps.marker.AdvancedMarkerElement({
              map: mapInstance,
              position: location,
            });
          } else {
            console.error('Geocoding failed:', status);
          }
        }
      );
    });

    return () => {
      mapInstance = undefined as unknown as google.maps.Map;
    };
  }, [address]);

  return <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '12px' }} />;
}
