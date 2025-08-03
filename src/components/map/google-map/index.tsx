'use client';

import { useEffect, useRef } from 'react';

interface Props {
  address: string;
}

export function ClinicGoogleMap({ address }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.google || !mapRef.current) return;

    const geocoder = new window.google.maps.Geocoder();

    geocoder.geocode(
      { address },
      (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;

          const map = new window.google.maps.Map(mapRef.current!, {
            center: location,
            zoom: 15,
          });

          new window.google.maps.Marker({
            map,
            position: location,
          });
        } else {
          console.error('Geocoding failed:', status);
        }
      }
    );
  }, [address]);
  console.log('입력 주소:', address);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '300px', borderRadius: '12px', backgroundColor: 'red' }}
    />
  );
}
