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
  select,
  timeBoxChevron,
  timeChip,
  timeChips,
  timeGroup,
  timeSection,
  selectedTimesBox,
} from './index.styles';

interface Props {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  daysInMonth: number;
  startingDayOfWeek: number;
  isDateSelected: (day: number) => boolean;
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
  const locale = currentLocale === 'ko' ? 'ko-KR' : currentLocale === 'ja' ? 'ja-JP' : 'en-US';
  const weekdayLabels = useMemo(() => {
    const base = new Date(2024, 0, 7);
    return Array.from({ length: 7 }).map((_, index) => {
      const date = new Date(base.getFullYear(), base.getMonth(), base.getDate() + index);
      return new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date);
    });
  }, [locale]);

  return (
    <div css={sectionCard}>
      <Text typo="title_L" color="text_primary">
        {t('form.schedule.title')}
      </Text>

      <div css={dateSection}>
        <Text typo="body_M" color="text_primary">
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
                <Text typo="body_S" color="text_tertiary">
                  {day}
                </Text>
              </div>
            ))}

            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} css={emptyDay} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              return (
                <div
                  key={day}
                  css={calendarDay(isDateSelected(day))}
                  onClick={() => onDateClick(day)}
                >
                  <Text typo="body_M" color={isDateSelected(day) ? 'white' : 'text_primary'}>
                    {day}
                  </Text>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div css={timeSection}>
        <Text typo="body_M" color="text_primary">
          {t('form.schedule.selectTimes')}
        </Text>

        {selectedDates.length === 0 && (
          <Text typo="body_S" color="text_tertiary" css={placeholderText}>
            {t('form.schedule.emptyDatePrompt')}
          </Text>
        )}

        {selectedDates.map((date) => {
          const dateString = formatDateKey(date);
          const hasSelectedTime = selectedTimes[dateString]?.length > 0;
          const isOpen = timeSelectionOpen[dateString] || false;

          return (
            <div key={dateString} css={timeGroup}>
              <Text typo="body_S" color="text_secondary">
                {formatDateForDisplay(date)}
              </Text>

              {hasSelectedTime ? (
                <>
                  <div css={selectedTimesBox()} onClick={() => onToggleTimeSelection(dateString)}>
                    <Text typo="body_M" color="text_primary">
                      {selectedTimes[dateString].join(' / ')}
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
                </>
              ) : (
                <select
                  css={select}
                  value=""
                  onChange={(e) => {
                    if (e.target.value) {
                      onTimeSelect(dateString, e.target.value);
                      onToggleTimeSelection(dateString);
                    }
                  }}
                >
                  <option value="">{t('form.schedule.selectTimesPlaceholder')}</option>
                  {availableTimes.map((time) => (
                    <option key={time} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
