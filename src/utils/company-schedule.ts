import type { CompanyDetail } from '@/models';

const BUSINESS_DAY_BY_INDEX = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const WEEKDAY_DAY_SET = new Set(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

type BusinessDay = (typeof BUSINESS_DAY_BY_INDEX)[number];
type CompanySchedule = Pick<
  CompanyDetail,
  | 'business_days'
  | 'weekday_open_time'
  | 'weekday_close_time'
  | 'weekend_open_time'
  | 'weekend_close_time'
>;

const normalizeTimeValue = (value?: string | null) => {
  if (typeof value !== 'string') return null;
  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const [rawHour, rawMinute] = trimmedValue.split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const toMinutes = (time: string) => {
  const normalizedTime = normalizeTimeValue(time);
  if (!normalizedTime) return null;

  const [hour, minute] = normalizedTime.split(':').map(Number);
  return hour * 60 + minute;
};

const toDisplayTime = (minutes: number) => {
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

export const getBusinessDay = (date: Date): BusinessDay => {
  return BUSINESS_DAY_BY_INDEX[date.getDay()];
};

export const getCompanyHoursForDate = (company: CompanySchedule | null | undefined, date: Date) => {
  if (!company) return null;

  const businessDay = getBusinessDay(date);
  if (!(company.business_days ?? []).includes(businessDay)) {
    return null;
  }

  const isWeekday = WEEKDAY_DAY_SET.has(businessDay);
  const openTime = normalizeTimeValue(
    isWeekday ? company.weekday_open_time : company.weekend_open_time
  );
  const closeTime = normalizeTimeValue(
    isWeekday ? company.weekday_close_time : company.weekend_close_time
  );

  if (!openTime || !closeTime) return null;

  return { openTime, closeTime };
};

export const getCompanyAvailableReservationTimes = (
  company: CompanySchedule | null | undefined,
  date: Date,
  stepMinutes: number = 60
) => {
  const hours = getCompanyHoursForDate(company, date);
  if (!hours) return [];

  const startMinutes = toMinutes(hours.openTime);
  const endMinutes = toMinutes(hours.closeTime);

  if (startMinutes == null || endMinutes == null) return [];
  if (stepMinutes <= 0 || startMinutes >= endMinutes) return [];

  const slots: string[] = [];
  for (
    let currentMinutes = startMinutes;
    currentMinutes + stepMinutes <= endMinutes;
    currentMinutes += stepMinutes
  ) {
    slots.push(toDisplayTime(currentMinutes));
  }

  return slots;
};

export const isCompanyClosedOnDate = (
  company: CompanySchedule | null | undefined,
  date: Date,
  stepMinutes: number = 60
) => {
  const hours = getCompanyHoursForDate(company, date);
  if (!hours) return true;

  const startMinutes = toMinutes(hours.openTime);
  const endMinutes = toMinutes(hours.closeTime);

  return (
    startMinutes == null ||
    endMinutes == null ||
    stepMinutes <= 0 ||
    startMinutes + stepMinutes > endMinutes
  );
};
