/** @jsxImportSource @emotion/react */
import { useMemo, useState } from 'react';
import { Text } from '../text';
import { CalenderWhite, ChevronLeft, ChevronRight } from '@/icons';
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
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

export function Calendar({ selectedRange, onRangeSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  const days = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

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
    () =>
      currentMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    [currentMonth]
  );

  return (
    <div css={calendarContainer}>
      <div css={calendarHeader}>
        <CalenderWhite width="22px" height="22px" />
        <Text typo="body_L" color="text_primary">
          Select dates
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
          {DAY_LABELS.map((label) => (
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
                  isStart && !isEnd && rangeStartCell,
                  isEnd && !isStart && rangeEndCell,
                  isStart && isEnd && rangeSingleCell,
                ]}
              >
                <button
                  type="button"
                  css={[
                    dayButton,
                    isStart && !isEnd && rangeStartButton,
                    isEnd && !isStart && rangeEndButton,
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
