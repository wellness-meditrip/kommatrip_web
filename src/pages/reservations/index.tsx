import { useState } from 'react';
import { AppBar, Layout, Text, CTAButton } from '@/components';
import { useRouter } from 'next/router';
import { css } from '@emotion/react';
import { theme } from '@/styles';
import { Chevron } from '@/icons';

// Mock data
const mockClinicData = {
  name: 'Woojooyan Clinic',
  address: '41 Bukchon-ro 12-gil, Jongno-gu, Seoul',
  tags: ['Spa & Therapy', 'Facial Care', '+2'],
};

const mockPrograms = [
  {
    id: 1,
    title: 'Detox & Slimming',
    duration: '90 mins',
    price: '500,000 KRW',
    image: '/default.png',
  },
  {
    id: 2,
    title: 'Detox & Slimming',
    duration: '90 mins',
    price: '500,000 KRW',
    image: '/default.png',
  },
  {
    id: 3,
    title: 'Detox & Slimming',
    duration: '90 mins',
    price: '500,000 KRW',
    image: '/default.png',
  },
];

const contactMethods = ['Line', 'Whats App', 'Kakao', 'Phone'];

const commonConcerns = [
  'This is my first time at a Korean clinic',
  'I have sensitive skin/allergies',
  'I need English explanation during treatment',
  'I prefer gentle pressure during massage',
  'I have specific areas of concern',
];

export default function ReservationPage() {
  const router = useRouter();

  // Toggle states for sections
  const [isProgramsOpen, setIsProgramsOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isInquiriesOpen, setIsInquiriesOpen] = useState(true);

  // Programs
  const [selectedPrograms, setSelectedPrograms] = useState<number[]>([]);

  // Contact Information
  const [email, setEmail] = useState('');
  const [selectedContactMethod, setSelectedContactMethod] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [language, setLanguage] = useState('한국어');

  // Inquiries
  const [inquiryText, setInquiryText] = useState('');

  // Reservation - dates (max 2)
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  // Reservation - times (max 3 per date)
  const [selectedTimes, setSelectedTimes] = useState<{ [key: string]: string[] }>({});

  // Time selection visibility toggle for each date
  const [timeSelectionOpen, setTimeSelectionOpen] = useState<{ [key: string]: boolean }>({});

  const availableTimes = [
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00',
    '19:00',
  ];

  // Calendar logic
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 8)); // September 2025

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const handleDateClick = (day: number) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = clickedDate.toISOString().split('T')[0];

    const isAlreadySelected = selectedDates.some(
      (date) => date.toISOString().split('T')[0] === dateString
    );

    if (isAlreadySelected) {
      setSelectedDates(
        selectedDates.filter((date) => date.toISOString().split('T')[0] !== dateString)
      );
      const newTimes = { ...selectedTimes };
      delete newTimes[dateString];
      setSelectedTimes(newTimes);

      const newTimeSelectionOpen = { ...timeSelectionOpen };
      delete newTimeSelectionOpen[dateString];
      setTimeSelectionOpen(newTimeSelectionOpen);
    } else {
      if (selectedDates.length < 2) {
        setSelectedDates([...selectedDates, clickedDate]);
      }
    }
  };

  const handleTimeSelect = (dateString: string, time: string) => {
    const currentTimes = selectedTimes[dateString] || [];

    if (currentTimes.includes(time)) {
      setSelectedTimes({
        ...selectedTimes,
        [dateString]: currentTimes.filter((t) => t !== time),
      });
    } else {
      if (currentTimes.length < 3) {
        // Add and sort the times
        const newTimes = [...currentTimes, time].sort((a, b) => {
          const timeA = parseInt(a.replace(':', ''));
          const timeB = parseInt(b.replace(':', ''));
          return timeA - timeB;
        });
        setSelectedTimes({
          ...selectedTimes,
          [dateString]: newTimes,
        });
      }
    }
  };

  const isDateSelected = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = date.toISOString().split('T')[0];
    return selectedDates.some((selected) => selected.toISOString().split('T')[0] === dateString);
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const formatDateForDisplay = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = days[date.getDay()];
    return `${year}. ${month}. ${day} (${dayOfWeek})`;
  };

  const handleSubmit = () => {
    console.log({
      selectedPrograms,
      email,
      selectedContactMethod,
      contactPhone,
      language,
      inquiryText,
      selectedDates,
      selectedTimes,
    });
    // TODO: API 호출
  };

  return (
    <Layout isAppBarExist={false}>
      <AppBar
        onBackClick={router.back}
        leftButton={true}
        buttonType="dark"
        title="Reservation"
        backgroundColor="bg_surface1"
      />
      <div css={pageWrapper}>
        {/* Clinic Info */}
        <div css={clinicInfo}>
          <Text typo="title_L" color="text_primary">
            {mockClinicData.name}
          </Text>
          <Text typo="body_M" color="text_tertiary" css={addressText}>
            📍 {mockClinicData.address}
          </Text>
          <div css={tagsContainer}>
            {mockClinicData.tags.map((tagText, index) => (
              <div key={index} css={tag}>
                <Text typo="body_S" color="text_secondary">
                  {tagText}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {/* Programs Section */}
        <div css={section}>
          <div css={sectionHeader} onClick={() => setIsProgramsOpen(!isProgramsOpen)}>
            <Text typo="title_M" color="text_primary">
              Programs
            </Text>
            <div css={chevronIcon(isProgramsOpen)}>
              <Chevron width={24} height={24} />
            </div>
          </div>
          {isProgramsOpen && (
            <div css={sectionContent}>
              {mockPrograms.map((program) => (
                <div
                  key={program.id}
                  css={programCard(selectedPrograms.includes(program.id))}
                  onClick={() => {
                    if (selectedPrograms.includes(program.id)) {
                      setSelectedPrograms(selectedPrograms.filter((id) => id !== program.id));
                    } else {
                      setSelectedPrograms([...selectedPrograms, program.id]);
                    }
                  }}
                >
                  <img src={program.image} alt={program.title} css={programImage} />
                  <div css={programInfo}>
                    <Text typo="title_S" color="text_primary">
                      {program.title}
                    </Text>
                    <Text typo="body_S" color="text_tertiary">
                      ⏱ {program.duration} | {program.price}
                    </Text>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact Information Section */}
        <div css={section}>
          <div css={sectionHeader} onClick={() => setIsContactOpen(!isContactOpen)}>
            <Text typo="title_M" color="text_primary">
              Contact Information
            </Text>
            <div css={chevronIcon(isContactOpen)}>
              <Chevron width={24} height={24} />
            </div>
          </div>
          {isContactOpen && (
            <div css={sectionContent}>
              <div css={inputGroup}>
                <Text typo="body_M" color="text_primary">
                  Email
                </Text>
                <input
                  type="email"
                  placeholder="Elena123@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  css={input}
                />
              </div>

              <div css={inputGroup}>
                <Text typo="body_M" color="text_primary">
                  Preferred Contact Method
                </Text>
                <div css={contactMethodsContainer}>
                  {contactMethods.map((method) => (
                    <div
                      key={method}
                      css={contactMethodChip(selectedContactMethod === method)}
                      onClick={() => setSelectedContactMethod(method)}
                    >
                      <Text
                        typo="body_S"
                        color={selectedContactMethod === method ? 'white' : 'text_secondary'}
                      >
                        {method}
                      </Text>
                    </div>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="Elena122"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  css={input}
                />
              </div>

              <div css={inputGroup}>
                <Text typo="body_M" color="text_primary">
                  Language Preference
                </Text>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} css={select}>
                  <option value="한국어">한국어</option>
                  <option value="English">English</option>
                  <option value="中文">中文</option>
                  <option value="日本語">日本語</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Inquiries Section */}
        <div css={section}>
          <div css={sectionHeader} onClick={() => setIsInquiriesOpen(!isInquiriesOpen)}>
            <Text typo="title_M" color="text_primary">
              Inquiries
            </Text>
            <div css={chevronIcon(isInquiriesOpen)}>
              <Chevron width={24} height={24} />
            </div>
          </div>
          {isInquiriesOpen && (
            <div css={sectionContent}>
              <Text typo="body_M" color="text_primary" css={inquiryTitle}>
                Tell us about your needs (Optional)
              </Text>
              <div css={concernsBox}>
                <Text typo="body_S" color="text_secondary" css={concernsTitle}>
                  Common concerns for international visitors :
                </Text>
                <ul css={concernsList}>
                  {commonConcerns.map((concern, index) => (
                    <li key={index}>
                      <Text typo="body_S" color="text_secondary">
                        {concern}
                      </Text>
                    </li>
                  ))}
                </ul>
              </div>
              <textarea
                placeholder="Write about your needs"
                value={inquiryText}
                onChange={(e) => setInquiryText(e.target.value)}
                css={textarea}
              />
            </div>
          )}
        </div>

        {/* Reservation Section */}
        <div css={reservationSection}>
          <Text typo="title_L" color="text_primary">
            Reservation
          </Text>

          <div css={dateSelectionSection}>
            <Text typo="body_M" color="text_primary">
              01. Select up to 2 preferred dates
            </Text>

            {/* Calendar */}
            <div css={calendarContainer}>
              <div css={calendarHeader}>
                <button onClick={prevMonth} css={arrowButton}>
                  &lt;
                </button>
                <Text typo="title_S" color="text_primary">
                  {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </Text>
                <button onClick={nextMonth} css={arrowButton}>
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
                      onClick={() => handleDateClick(day)}
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

          {/* Time Selection */}
          <div css={timeSelectionSection}>
            <Text typo="body_M" color="text_primary">
              02. Select up to 3 available times
            </Text>

            {selectedDates.length === 0 && (
              <Text typo="body_S" color="text_tertiary" css={placeholderText}>
                Please select your first preferred date.
              </Text>
            )}

            {selectedDates.map((date) => {
              const dateString = date.toISOString().split('T')[0];
              const hasSelectedTime =
                selectedTimes[dateString] && selectedTimes[dateString].length > 0;
              const isOpen = timeSelectionOpen[dateString] || false;

              return (
                <div key={dateString} css={timeSelectionGroup}>
                  <Text typo="body_S" color="text_secondary">
                    {formatDateForDisplay(date)}
                  </Text>

                  {hasSelectedTime ? (
                    <>
                      {/* Selected times display box */}
                      <div
                        css={selectedTimesBox()}
                        onClick={() =>
                          setTimeSelectionOpen({
                            ...timeSelectionOpen,
                            [dateString]: !isOpen,
                          })
                        }
                      >
                        <Text typo="body_M" color="text_primary">
                          {selectedTimes[dateString].join(' / ')}
                        </Text>
                        <div css={timeBoxChevron(isOpen)}>
                          <Chevron width={20} height={20} />
                        </div>
                      </div>

                      {/* Time chips - show when open */}
                      {isOpen && (
                        <div css={timeChipsContainer}>
                          {availableTimes.map((time) => (
                            <div
                              key={time}
                              css={timeChip(selectedTimes[dateString]?.includes(time) || false)}
                              onClick={() => handleTimeSelect(dateString, time)}
                            >
                              <Text
                                typo="body_S"
                                color={
                                  selectedTimes[dateString]?.includes(time)
                                    ? 'white'
                                    : 'text_secondary'
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
                          handleTimeSelect(dateString, e.target.value);
                          // Auto-open the time chips after first selection
                          setTimeSelectionOpen({
                            ...timeSelectionOpen,
                            [dateString]: true,
                          });
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

        {/* Submit Button */}
        <div css={submitButtonWrapper}>
          <CTAButton onClick={handleSubmit}>Book Now</CTAButton>
        </div>
      </div>
    </Layout>
  );
}

// Styles
const pageWrapper = css`
  padding: 0 0 100px 0;
  background: ${theme.colors.bg_surface1};
`;

const clinicInfo = css`
  padding: 24px 18px;
  background: ${theme.colors.white};
  margin-bottom: 8px;
`;

const addressText = css`
  margin-top: 8px;
`;

const tagsContainer = css`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const tag = css`
  padding: 6px 12px;
  background: ${theme.colors.primary10};
  border-radius: 16px;
`;

const section = css`
  background: ${theme.colors.white};
  margin-bottom: 8px;
  padding: 20px 18px;
`;

const sectionHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  user-select: none;
`;

const chevronIcon = (isOpen: boolean) => css`
  transform: ${isOpen ? 'rotate(180deg)' : 'rotate(90deg)'};
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const sectionContent = css`
  margin-top: 16px;
`;

const programCard = (isSelected: boolean) => css`
  display: flex;
  gap: 12px;
  padding: 12px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.border_default};
  border-radius: 8px;
  margin-bottom: 12px;
  cursor: pointer;
  background: ${isSelected ? theme.colors.primary10Opacity20 : theme.colors.white};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const programImage = css`
  width: 72px;
  height: 72px;
  border-radius: 8px;
  object-fit: cover;
`;

const programInfo = css`
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
`;

const inputGroup = css`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const input = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 8px;
  font-size: 14px;
  margin-top: 8px;
  outline: none;

  &:focus {
    border-color: ${theme.colors.primary50};
  }

  &::placeholder {
    color: ${theme.colors.text_disabled};
  }
`;

const contactMethodsContainer = css`
  display: flex;
  gap: 8px;
  margin: 8px 0;
  flex-wrap: wrap;
`;

const contactMethodChip = (isSelected: boolean) => css`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.border_default};
  background: ${isSelected ? theme.colors.primary50 : theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const select = css`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 8px;
  font-size: 14px;
  margin-top: 8px;
  outline: none;
  background: ${theme.colors.white};
  cursor: pointer;

  &:focus {
    border-color: ${theme.colors.primary50};
  }
`;

const inquiryTitle = css`
  margin-bottom: 12px;
`;

const concernsBox = css`
  background: ${theme.colors.primary10Opacity20};
  padding: 16px;
  border-radius: 8px;
  margin: 12px 0;
`;

const concernsTitle = css`
  margin-bottom: 8px;
  font-weight: 600;
`;

const concernsList = css`
  margin: 0;
  padding-left: 20px;

  li {
    margin-bottom: 4px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const textarea = css`
  width: 100%;
  min-height: 120px;
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  font-family: inherit;

  &:focus {
    border-color: ${theme.colors.primary50};
  }

  &::placeholder {
    color: ${theme.colors.text_disabled};
  }
`;

const reservationSection = css`
  background: ${theme.colors.white};
  padding: 24px 18px;
`;

const dateSelectionSection = css`
  margin-top: 20px;
`;

const calendarContainer = css`
  margin-top: 16px;
`;

const calendarHeader = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const arrowButton = css`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 8px 12px;
  color: ${theme.colors.text_primary};

  &:hover {
    background: ${theme.colors.bg_surface1};
    border-radius: 4px;
  }
`;

const calendarGrid = css`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const dayHeader = css`
  text-align: center;
  padding: 8px 0;
`;

const emptyDay = css`
  padding: 12px 0;
`;

const calendarDay = (isSelected: boolean) => css`
  width: 43px;
  height: 43px;
  text-align: center;
  padding: 12px 0;
  border-radius: 50%;
  cursor: pointer;
  background: ${isSelected ? theme.colors.primary50 : 'transparent'};
  transition: all 0.2s ease;

  &:hover {
    background: ${isSelected ? theme.colors.primary50 : theme.colors.bg_surface1};
  }
`;

const timeSelectionSection = css`
  margin-top: 32px;
`;

const placeholderText = css`
  margin-top: 12px;
`;

const timeSelectionGroup = css`
  margin-top: 16px;
`;

const selectedTimesBox = () => css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-top: 12px;
  border: 1px solid ${theme.colors.border_default};
  border-radius: 8px;
  background: ${theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const timeBoxChevron = (isOpen: boolean) => css`
  transform: ${isOpen ? 'rotate(90deg)' : 'rotate(270deg)'};
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const timeChipsContainer = css`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
`;

const timeChip = (isSelected: boolean) => css`
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid ${isSelected ? theme.colors.primary50 : theme.colors.border_default};
  background: ${isSelected ? theme.colors.primary50 : theme.colors.white};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.primary50};
  }
`;

const submitButtonWrapper = css`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 18px;
  background: ${theme.colors.white};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
`;
