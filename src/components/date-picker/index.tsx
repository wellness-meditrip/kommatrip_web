import { useEffect, useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import {
  DatePicker as MuiDatePicker,
  LocalizationProvider,
  TimePicker,
  DesktopTimePicker,
  DesktopDatePicker,
} from '@mui/x-date-pickers';
import 'dayjs/locale/ko';
import dayjs, { Dayjs } from 'dayjs';
import { box, dateSelect } from './index.styles';

interface Props {
  onChange: (date: string) => void;
}

export function DatePicker({ onChange }: Props) {
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
  const [selectedTime, setSelectedTime] = useState<Dayjs | null>(dayjs());

  const now = dayjs();
  const startOfToday = now.startOf('day').hour(10).minute(0);
  const endOfToday = now.startOf('day').hour(19).minute(0);
  const maxDate = now.add(1, 'year').endOf('day');

  const handleDateChange = (newValue: Dayjs | null) => {
    setSelectedDate(newValue);
  };

  const handleTimeChange = (newValue: Dayjs | null) => {
    setSelectedTime(newValue);
  };

  useEffect(() => {
    onChange(`${selectedDate?.format('YYYY-MM-DD')} ${selectedTime?.format('HH:mm:ss')}`);
  }, [selectedDate, selectedTime]);

  return (
    <div css={box}>
      <div css={dateSelect}>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
          <DesktopDatePicker
            format="YYYY.MM.DD"
            value={selectedDate}
            onChange={handleDateChange}
            minDate={now.startOf('day')}
            maxDate={maxDate}
            slotProps={{
              textField: {
                size: 'small',
                InputProps: {
                  sx: {
                    borderRadius: '30px',
                    input: { color: 'black', textAlign: 'center' },
                    fontSize: '13px',
                  },
                },
              },
            }}
          />
        </LocalizationProvider>
      </div>

      <div css={dateSelect}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DesktopTimePicker
            value={selectedTime}
            onChange={handleTimeChange}
            minTime={
              selectedDate?.isSame(now, 'day')
                ? now.isBefore(startOfToday)
                  ? startOfToday
                  : now.isAfter(endOfToday)
                    ? endOfToday
                    : now
                : startOfToday
            }
            maxTime={selectedDate?.startOf('day').hour(19).minute(0)}
            ampm={false}
            slotProps={{
              textField: {
                size: 'small',
                InputProps: {
                  sx: {
                    borderRadius: '30px',
                    input: { color: 'black', textAlign: 'center' },
                    fontSize: '13px',
                  },
                },
              },
            }}
            sx={{ borderRadius: '30px' }}
          />
        </LocalizationProvider>
      </div>
    </div>
  );
}
