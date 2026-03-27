import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Script from 'next/script';
import { useAuthState } from '@/hooks/auth/use-auth-state';
import { useAuthSync } from '@/hooks/auth/use-auth-sync';
import { useAuthStore } from '@/store/auth';

interface AppRuntimeProps {
  gtmId?: string;
  enableAnalytics: boolean;
  enableAuthSync: boolean;
}

function AuthSyncBridge() {
  useAuthState();
  useAuthSync();
  return null;
}

function GtmConsentSync({ enabled }: { enabled: boolean }) {
  const isBootstrapped = useAuthStore((state) => state.isBootstrapped);
  const marketingConsent = useAuthStore((state) => Boolean(state.user?.marketing_consent));

  useEffect(() => {
    if (!enabled || !isBootstrapped || typeof window.gtag !== 'function') return;

    const consentState = marketingConsent ? 'granted' : 'denied';
    window.gtag('consent', 'update', {
      ad_storage: consentState,
      analytics_storage: consentState,
      ad_user_data: consentState,
      ad_personalization: consentState,
    });
  }, [enabled, isBootstrapped, marketingConsent]);

  return null;
}

function GtmPageViewTracker({ gtmId }: { gtmId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!gtmId) return;

    const handleRouteChange = (url: string) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'page_view',
        page_location: window.location.href,
        page_path: url,
        page_title: document.title,
      });
    };

    if (router.isReady) {
      handleRouteChange(router.asPath);
    }

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [gtmId, router]);

  return null;
}

function GtmLoader({ gtmId }: { gtmId: string }) {
  return (
    <Script
      id="gtm-loader"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','${gtmId}');
        `,
      }}
    />
  );
}

export function AppRuntime({ gtmId, enableAnalytics, enableAuthSync }: AppRuntimeProps) {
  const shouldLoadAnalytics = Boolean(gtmId) && enableAnalytics;
  const analyticsGtmId = shouldLoadAnalytics ? gtmId : undefined;

  return (
    <>
      {analyticsGtmId ? <GtmLoader gtmId={analyticsGtmId} /> : null}
      {enableAuthSync ? <AuthSyncBridge /> : null}
      <GtmPageViewTracker gtmId={analyticsGtmId} />
      <GtmConsentSync enabled={shouldLoadAnalytics} />
    </>
  );
}
