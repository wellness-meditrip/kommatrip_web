import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Text } from '@/components';
import { Chevron } from '@/icons';
import { useCurrentLocale } from '@/i18n/navigation';
import {
  arrowButton,
  calendarContainer,
  calendarDay,
  calendarGrid,
  calendarHeader,
  dateSection,
  dayHeader,
  emptyDay,
  placeholderText,
  sectionCard,
  timeChip,
  timeChips,
  timeGroup,
  timeSection,
  selectedTimesBox,
  timeBoxChevron,
} from './index.styles';

interface Props {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  daysInMonth: number;
  startingDayOfWeek: number;
  isDateSelected: (day: number) => boolean;
  isDateDisabled: (day: number) => boolean;
  onDateClick: (day: number) => void;
  selectedDates: Date[];
  selectedTimes: Record<string, string[]>;
  timeSelectionOpen: Record<string, boolean>;
  onToggleTimeSelection: (dateString: string) => void;
  onTimeSelect: (dateString: string, time: string) => void;
  availableTimes: string[];
  formatDateForDisplay: (date: Date) => string;
  formatDateKey: (date: Date) => string;
}

export function ScheduleSection({
  currentMonth,
  onPrevMonth,
  onNextMonth,
  daysInMonth,
  startingDayOfWeek,
  isDateSelected,
  isDateDisabled,
  onDateClick,
  selectedDates,
  selectedTimes,
  timeSelectionOpen,
  onToggleTimeSelection,
  onTimeSelect,
  availableTimes,
  formatDateForDisplay,
  formatDateKey,
}: Props) {
  const t = useTranslations('reservation');
  const currentLocale = useCurrentLocale();
  const locale = currentLocale === 'ko' ? 'ko-KR' : 'en-US';
  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 7);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + index);
      return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    });
  }, [locale]);

  return (
    <div css={sectionCard}>
      <Text typo="title_M" color="text_primary">
        {t('form.schedule.title')}
      </Text>

      <div css={dateSection}>
        <Text typo="title_S" color="text_primary">
          {t('form.schedule.selectDates')}
        </Text>

        <div css={calendarContainer}>
          <div css={calendarHeader}>
            <button onClick={onPrevMonth} css={arrowButton}>
              &lt;
            </button>
            <Text typo="title_S" color="text_primary">
              {new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
                currentMonth
              )}
            </Text>
            <button onClick={onNextMonth} css={arrowButton}>
              &gt;
            </button>
          </div>

          <div css={calendarGrid}>
            {weekdayLabels.map((day) => (
              <div key={day} css={dayHeader}>
                <Text typo="body_M" color="text_tertiary">
                  {day}
                </Text>
              </div>
            ))}

            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} css={emptyDay} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const isSelected = isDateSelected(day);
              const isDisabled = isDateDisabled(day);
              return (
                <div
                  key={day}
                  css={calendarDay(isSelected, isDisabled)}
                  onClick={() => {
                    if (!isDisabled || isSelected) {
                      onDateClick(day);
                    }
                  }}
                >
                  <Text
                    typo="body_M"
                    color={isDisabled ? 'text_disabled' : isSelected ? 'white' : 'text_primary'}
                  >
                    {day}
                  </Text>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div css={timeSection}>
        <Text typo="title_S" color="text_primary">
          {t('form.schedule.selectTimes')}
        </Text>

        {selectedDates.length === 0 && (
          <Text typo="body_S" color="text_tertiary" css={placeholderText}>
            {t('form.schedule.emptyDatePrompt')}
          </Text>
        )}

        {selectedDates.map((date) => {
          const dateString = formatDateKey(date);
          const selectedTimeList = selectedTimes[dateString] ?? [];
          const hasSelectedTime = selectedTimeList.length > 0;
          const isOpen = timeSelectionOpen[dateString] || false;

          return (
            <div key={dateString} css={timeGroup}>
              <Text typo="button_M" color="primary30">
                {formatDateForDisplay(date)}
              </Text>

              <div css={selectedTimesBox()} onClick={() => onToggleTimeSelection(dateString)}>
                <Text typo="body_M" color={hasSelectedTime ? 'text_primary' : 'text_tertiary'}>
                  {hasSelectedTime
                    ? selectedTimeList.join(' / ')
                    : t('form.schedule.selectTimesPlaceholder')}
                </Text>
                <div css={timeBoxChevron(isOpen)}>
                  <Chevron width={20} height={20} />
                </div>
              </div>

              {isOpen && (
                <div css={timeChips}>
                  {availableTimes.map((time) => (
                    <div
                      key={time}
                      css={timeChip(selectedTimes[dateString]?.includes(time) || false)}
                      onClick={() => onTimeSelect(dateString, time)}
                    >
                      <Text
                        typo="body_S"
                        color={
                          selectedTimes[dateString]?.includes(time) ? 'white' : 'text_secondary'
                        }
                      >
                        {time}
                      </Text>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
