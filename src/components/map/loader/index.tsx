'use client';

import Script from 'next/script';
import { useState } from 'react';

interface GoogleMapLoaderProps {
  children: React.ReactNode;
}

export function GoogleMapLoader({ children }: GoogleMapLoaderProps) {
  const apiKey = process.env.NEXT_PUBLIC_MAPS_API_KEY;
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        strategy="afterInteractive"
        onLoad={() => {
          setIsLoaded(true);
        }}
        onError={(e) => {
          console.error('❌ Google Maps API failed to load', e);
        }}
      />
      {isLoaded && children}
    </>
  );
}
