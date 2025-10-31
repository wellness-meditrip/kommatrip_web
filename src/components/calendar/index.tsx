/** @jsxImportSource @emotion/react */
import { useState } from 'react';
import { Text } from '../text';
import { ChevronLeft, ChevronRight, CalenderWhite } from '@/icons';
import {
  calendarContainer,
  calendarHeader,
  calendarContent,
  monthNavigation,
  calendarGrid,
  dayHeader,
  dayCell,
  dayNumber,
  selectedDay,
  otherMonthDay,
  navigationButton,
} from './index.styles';

interface Props {
  onDateSelect?: (date: Date) => void;
}

export function Calendar({ onDateSelect }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 8, 1)); // September 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    // 6 weeks * 7 days = 42 days
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = current.getMonth() === month;
      const isSelected =
        selectedDate &&
        current.getDate() === selectedDate.getDate() &&
        current.getMonth() === selectedDate.getMonth() &&
        current.getFullYear() === selectedDate.getFullYear();

      days.push(
        <div
          key={i}
          css={[dayCell, !isCurrentMonth && otherMonthDay]}
          onClick={() => handleDateClick(new Date(current))}
        >
          <div css={[dayNumber, isSelected && selectedDay]}>{current.getDate()}</div>
        </div>
      );

      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  return (
    <div css={calendarContainer}>
      <div css={calendarHeader}>
        <CalenderWhite width="24px" height="24px" />
        <Text typo="body_L" color="bg_default">
          Select dates
        </Text>
      </div>
      <div css={calendarContent}>
        <div css={monthNavigation}>
          <button css={navigationButton} onClick={handlePreviousMonth}>
            <ChevronLeft width="16px" height="16px" />
          </button>
          <Text typo="body_M" color="primary90">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>
          <button css={navigationButton} onClick={handleNextMonth}>
            <ChevronRight width="16px" height="16px" />
          </button>
        </div>
        <div css={calendarGrid}>
          {dayNames.map((day) => (
            <div key={day} css={dayHeader}>
              <Text typo="body_S" color="primary70">
                {day}
              </Text>
            </div>
          ))}
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}
