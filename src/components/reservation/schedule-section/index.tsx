import { Text } from '@/components';
import { Chevron } from '@/icons';
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
  return (
    <div css={sectionCard}>
      <Text typo="title_L" color="text_primary">
        Reservation
      </Text>

      <div css={dateSection}>
        <Text typo="body_M" color="text_primary">
          01. Select up to 2 preferred dates
        </Text>

        <div css={calendarContainer}>
          <div css={calendarHeader}>
            <button onClick={onPrevMonth} css={arrowButton}>
              &lt;
            </button>
            <Text typo="title_S" color="text_primary">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Text>
            <button onClick={onNextMonth} css={arrowButton}>
              &gt;
            </button>
          </div>

          <div css={calendarGrid}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
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
          02. Select up to 3 available times
        </Text>

        {selectedDates.length === 0 && (
          <Text typo="body_S" color="text_tertiary" css={placeholderText}>
            Please select your first preferred date.
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
                  <option value="">Select times</option>
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
