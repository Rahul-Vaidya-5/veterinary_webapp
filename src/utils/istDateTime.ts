export const IST_TIME_ZONE = 'Asia/Kolkata';

const IST_DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
  timeZone: IST_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export const getIstDateKey = (date: Date = new Date()): string =>
  IST_DATE_FORMATTER.format(date);

export const formatIstDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions,
): string =>
  new Intl.DateTimeFormat('en-IN', {
    ...options,
    timeZone: IST_TIME_ZONE,
  }).format(date);
