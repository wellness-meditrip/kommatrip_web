import { ReactNode, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from '../tab';
import { tabHeader, wrapper, tabContent, tabContentItem } from './index.styles';

export interface TabType {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabType[];
  renderContent: (activeTabId: string, scrollHeight?: number) => ReactNode;
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
}

export function Tabs({ tabs, activeTabId, onTabClick, renderContent }: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(activeTabId ?? tabs[0]?.id ?? '');
  const [direction, setDirection] = useState<number>(0);
  const [scrollHeight, setScrollHeight] = useState<number>(0);
  const scrollPositionRef = useRef<number>(0);
  const tabContentRef = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === activeTab),
    [tabs, activeTab]
  );

  const handleTabChange = useCallback(
    (id: string) => {
      // 현재 스크롤 위치와 높이 저장
      if (tabContentRef.current) {
        scrollPositionRef.current = tabContentRef.current.scrollTop;
        setScrollHeight(tabContentRef.current.scrollTop);
      }

      const newIndex = tabs.findIndex((tab) => tab.id === id);
      setDirection(newIndex > activeIndex ? 1 : -1);
      setActiveTab(id);
      onTabClick?.(id);
    },
    [activeIndex, tabs, onTabClick]
  );

  useEffect(() => {
    if (activeTabId && activeTabId !== activeTab) {
      handleTabChange(activeTabId);
    }
  }, [activeTabId, activeTab, handleTabChange]);

  // 탭 변경 후 스크롤 위치 복원
  useEffect(() => {
    if (tabContentRef.current && scrollPositionRef.current > 0) {
      const timer = setTimeout(() => {
        if (tabContentRef.current) {
          tabContentRef.current.scrollTop = scrollPositionRef.current;
        }
      }, 50); // 애니메이션 완료 후 스크롤 위치 복원

      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  return (
    <div css={wrapper}>
      <div css={tabHeader}>
        {tabs.map((tab) => (
          <Tab
            key={tab.id}
            id={tab.id}
            label={tab.label}
            isActive={activeTab === tab.id}
            onClick={() => handleTabChange(tab.id)}
          />
        ))}
      </div>

      <div css={tabContent} ref={tabContentRef}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            css={tabContentItem}
          >
            {renderContent(activeTab, scrollHeight)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
