import { useState, useRef } from 'react';
import { wrapper, dateInput, calendarButton, calendarIcon } from './index.styles';

interface DatePickerProps {
  onChange: (date: string) => void;
  placeholder?: string;
  value?: string;
}

export function DatePicker({ onChange, placeholder = 'YYYY.MM.DD', value }: DatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<string>(value || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;

    const formattedDate = dateValue.replace(/-/g, '.');

    setSelectedDate(formattedDate);
    onChange(dateValue);
  };

  const handleButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker();
    }
  };

  const displayValue = selectedDate || '';

  return (
    <div css={wrapper}>
      <input
        ref={inputRef}
        type="date"
        css={dateInput}
        onChange={handleDateChange}
        value={selectedDate ? selectedDate.replace(/\./g, '-') : ''}
      />
      <div css={calendarButton} onClick={handleButtonClick}>
        <span>{displayValue || placeholder}</span>
        <div css={calendarIcon}>📅</div>
      </div>
    </div>
  );
}
