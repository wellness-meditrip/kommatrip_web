import { useEffect, useRef, useState } from 'react';
import type { AdminEntityFormPresentation } from '@/components/admin/common/AdminEntityFormFrame';

interface UseAdminFormSectionNavigationParams<SectionId extends string> {
  presentation: AdminEntityFormPresentation;
  sections: ReadonlyArray<{ id: SectionId }>;
  initialSectionId: SectionId;
  getSectionDomId: (id: SectionId) => string;
  activationOffset?: number;
  scrollOffset?: number;
}

export const useAdminFormSectionNavigation = <SectionId extends string>({
  presentation,
  sections,
  initialSectionId,
  getSectionDomId,
  activationOffset = 120,
  scrollOffset = 24,
}: UseAdminFormSectionNavigationParams<SectionId>) => {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<SectionId>(initialSectionId);

  useEffect(() => {
    if (sections.some((section) => section.id === activeSectionId)) return;
    setActiveSectionId(sections[0]?.id ?? initialSectionId);
  }, [activeSectionId, initialSectionId, sections]);

  useEffect(() => {
    if (presentation !== 'sheet') return;

    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const containerTop = container.getBoundingClientRect().top + activationOffset;
      let nextActive = sections[0]?.id ?? initialSectionId;

      for (const section of sections) {
        const element = document.getElementById(getSectionDomId(section.id));
        if (!element) continue;

        if (element.getBoundingClientRect().top <= containerTop) {
          nextActive = section.id;
        }
      }

      setActiveSectionId((prev) => (prev === nextActive ? prev : nextActive));
    };

    handleScroll();
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activationOffset, getSectionDomId, initialSectionId, presentation, sections]);

  const handleSectionNavClick = (sectionId: SectionId) => {
    const element = document.getElementById(getSectionDomId(sectionId));
    const container = scrollContainerRef.current;
    if (!element || !container) return;

    setActiveSectionId(sectionId);
    const containerTop = container.getBoundingClientRect().top;
    const elementTop = element.getBoundingClientRect().top;
    const nextTop = container.scrollTop + (elementTop - containerTop) - scrollOffset;

    container.scrollTo({
      top: Math.max(0, nextTop),
      behavior: 'smooth',
    });
  };

  return {
    activeSectionId,
    scrollContainerRef,
    handleSectionNavClick,
  };
};
