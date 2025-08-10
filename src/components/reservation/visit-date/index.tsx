import { Text } from '@/components';
import {
  wrapper,
  datePickerContainer,
  timeSlotContainer,
  timeSlot,
  selectedTimeSlot,
  input,
} from './index.styles';

interface VisitDateCardProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
}

const timeSlots = ['10:00', '11:00', '13:00', '14:00', '15:00', '17:00'];

export function VisitDateCard({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
}: VisitDateCardProps) {
  return (
    <div css={wrapper}>
      <Text typo="title_M" color="text_primary">
        원하는 방문일자
      </Text>

      <div css={datePickerContainer}>
        <Text typo="title_S" color="text_primary">
          방문 날짜 *
        </Text>
        <input
          type="date"
          css={input}
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          placeholder="방문 날짜를 선택해주세요"
        />
      </div>

      <div>
        <Text typo="title_S">방문 시간</Text>
        <div css={timeSlotContainer}>
          {timeSlots.map((time) => (
            <button
              key={time}
              css={selectedTime === time ? selectedTimeSlot : timeSlot}
              onClick={() => setSelectedTime(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
