/** @jsxImportSource @emotion/react */
import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Text } from '../text';
import { CalenderWhite, ChevronLeft, ChevronRight, GnbCalendarActive } from '@/icons';
import { formatMonthDayWithWeekday, formatMonthYearLabel, getWeekdayLabels } from '@/i18n/format';
import { useCurrentLocale } from '@/i18n/navigation';
import {
  calendarContainer,
  calendarHeader,
  calendarContent,
  monthHeader,
  navButton,
  monthLabel,
  dayNamesRow,
  dayName,
  calendarGrid,
  dayCell,
  dayCellOutside,
  dayButton,
  rangeMiddleCell,
  rangeStartCell,
  rangeEndCell,
  rangeSingleCell,
  rangeStartButton,
  rangeEndButton,
  rangeSingleButton,
} from './index.styles';

interface RangeValue {
  start: Date | null;
  end: Date | null;
}

interface Props {
  selectedRange?: RangeValue;
  onRangeSelect?: (range: RangeValue) => void;
  variant?: 'default' | 'desktop';
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const startOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const addMonths = (date: Date, delta: number) =>
  new Date(date.getFullYear(), date.getMonth() + delta, 1);

const getCalendarDays = (baseDate: Date) => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const startDate = new Date(year, month, 1 - startOffset);

  const days = [];
  const cursor = new Date(startDate);

  for (let i = 0; i < 42; i += 1) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
};

export function Calendar({ selectedRange, onRangeSelect, variant = 'default' }: Props) {
  const locale = useCurrentLocale();
  const tCommon = useTranslations('common');
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);
  const dayLabels = useMemo(() => getWeekdayLabels(locale), [locale]);
  const dateLabel = useMemo(() => {
    if (!selectedRange?.start) return tCommon('date.selectDates');
    if (!selectedRange.end) {
      return formatMonthDayWithWeekday(selectedRange.start, locale);
    }
    return `${formatMonthDayWithWeekday(selectedRange.start, locale)} - ${formatMonthDayWithWeekday(selectedRange.end, locale)}`;
  }, [locale, selectedRange, tCommon]);

  const handlePrevMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
  };

  const handleDateClick = (date: Date) => {
    const start = selectedRange?.start ?? null;
    const end = selectedRange?.end ?? null;

    let nextRange: RangeValue;
    if (!start || (start && end)) {
      nextRange = { start: date, end: null };
    } else if (start && !end) {
      if (date < start) {
        nextRange = { start: date, end: start };
      } else if (isSameDay(date, start)) {
        nextRange = { start: date, end: null };
      } else {
        nextRange = { start, end: date };
      }
    } else {
      nextRange = { start: date, end: null };
    }

    onRangeSelect?.(nextRange);
  };

  const monthLabelText = useMemo(
    () => formatMonthYearLabel(currentMonth, locale),
    [currentMonth, locale]
  );

  return (
    <div css={calendarContainer}>
      <div css={calendarHeader}>
        {variant === 'desktop' ? (
          <GnbCalendarActive width="22px" height="22px" />
        ) : (
          <CalenderWhite width="22px" height="22px" />
        )}
        <Text typo="body_L" color={variant === 'desktop' ? 'text_primary' : 'white'}>
          {dateLabel}
        </Text>
      </div>

      <div css={calendarContent}>
        <div css={monthHeader}>
          <button type="button" css={navButton} onClick={handlePrevMonth}>
            <ChevronLeft width="18px" height="18px" />
          </button>
          <Text typo="title_S" color="text_primary" css={monthLabel}>
            {monthLabelText}
          </Text>
          <button type="button" css={navButton} onClick={handleNextMonth}>
            <ChevronRight width="18px" height="18px" />
          </button>
        </div>

        <div css={dayNamesRow}>
          {dayLabels.map((label) => (
            <div key={label} css={dayName}>
              {label}
            </div>
          ))}
        </div>

        <div css={calendarGrid}>
          {days.map((date) => {
            const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
            const start = selectedRange?.start ?? null;
            const end = selectedRange?.end ?? null;
            const hasRange = !!(start && end);
            const isStart = start ? isSameDay(date, start) : false;
            const isEnd = end ? isSameDay(date, end) : false;
            const isSingle = isStart && !end;
            const isInRange = hasRange && start && end && date > start && date < end;

            return (
              <div
                key={date.toISOString()}
                css={[
                  dayCell,
                  !isCurrentMonth && dayCellOutside,
                  isInRange && rangeMiddleCell,
                  hasRange && isStart && !isEnd && rangeStartCell,
                  hasRange && isEnd && !isStart && rangeEndCell,
                  isStart && isEnd && rangeSingleCell,
                  isSingle && rangeSingleCell,
                ]}
              >
                <button
                  type="button"
                  css={[
                    dayButton,
                    hasRange && isStart && !isEnd && rangeStartButton,
                    hasRange && isEnd && !isStart && rangeEndButton,
                    isSingle && rangeSingleButton,
                  ]}
                  onClick={() => handleDateClick(date)}
                  disabled={!isCurrentMonth}
                >
                  {date.getDate()}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
