import dynamic from 'next/dynamic';
import { useUiStore } from '@/store/ui';

const GlobalLoginModal = dynamic(
  () => import('@/components/auth/GlobalLoginModal').then((mod) => mod.GlobalLoginModal),
  {
    ssr: false,
    loading: () => null,
  }
);

export function LazyGlobalLoginModal() {
  const isLoginModalOpen = useUiStore((state) => state.isLoginModalOpen);

  if (!isLoginModalOpen) return null;

  return <GlobalLoginModal />;
}
