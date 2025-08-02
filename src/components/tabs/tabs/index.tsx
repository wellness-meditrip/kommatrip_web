import { ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tab } from '../tab';
import { tabHeader, wrapper, tabContent, tabContentItem } from './index.styles';

export interface TabType {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: TabType[];
  renderContent: (activeTabId: string) => ReactNode;
  activeTabId?: string;
  onTabClick?: (tabId: string) => void;
}

export function Tabs({ tabs, activeTabId, onTabClick, renderContent }: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(activeTabId ?? tabs[0]?.id ?? '');
  const [direction, setDirection] = useState<number>(0);

  useEffect(() => {
    if (activeTabId && activeTabId !== activeTab) {
      handleTabChange(activeTabId);
    }
  }, [activeTabId]);

  const activeIndex = useMemo(
    () => tabs.findIndex((tab) => tab.id === activeTab),
    [tabs, activeTab]
  );

  const handleTabChange = useCallback(
    (id: string) => {
      const newIndex = tabs.findIndex((tab) => tab.id === id);
      setDirection(newIndex > activeIndex ? 1 : -1);
      setActiveTab(id);
      onTabClick?.(id);
    },
    [activeIndex, tabs, onTabClick]
  );

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

      <div css={tabContent}>
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={activeTab}
            custom={direction}
            initial={{ x: direction * 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -direction * 100, opacity: 0 }}
            transition={{ duration: 0.4 }}
            css={tabContentItem}
          >
            {renderContent(activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
