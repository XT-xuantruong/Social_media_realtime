export type FormatType = 'fixed' | 'relative';
export type Locale = 'vi' | 'en';

export interface FormatOptions {
  formatType?: FormatType;
  fixedPattern?: string;
  locale?: Locale;
}

export function formatDateWithTimeSince(
  date: string | Date,
  options: FormatOptions = {}
): string {
  const {
    formatType = 'fixed',
    fixedPattern = 'dd/MM/yyyy HH:mm',
    locale = 'vi',
  } = options;

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Kiểm tra ngày hợp lệ
  if (isNaN(dateObj.getTime())) {
    return locale === 'vi' ? 'Ngày không hợp lệ' : 'Invalid date';
  }

  if (formatType === 'relative') {
    const now = Date.now();
    const diffMs = now - dateObj.getTime(); // Thời gian hiện tại - date
    const diffSeconds = Math.abs(diffMs) / 1000;
    const diffMinutes = diffSeconds / 60;
    const diffHours = diffMinutes / 60;
    const diffDays = diffHours / 24;
    const diffMonths = diffDays / 30;
    const diffYears = diffDays / 365;

    // Nếu thời gian trong tương lai
    const isFuture = diffMs < 0;

    const phrases =
      locale === 'vi'
        ? {
            justNow: 'vừa xong',
            seconds: (n: number) =>
              `${Math.round(n)} giây ${isFuture ? 'sau' : 'trước'}`,
            minutes: (n: number) =>
              `${Math.round(n)} phút ${isFuture ? 'sau' : 'trước'}`,
            hours: (n: number) =>
              `${Math.round(n)} giờ ${isFuture ? 'sau' : 'trước'}`,
            days: (n: number) =>
              `${Math.round(n)} ngày ${isFuture ? 'sau' : 'trước'}`,
            months: (n: number) =>
              `${Math.round(n)} tháng ${isFuture ? 'sau' : 'trước'}`,
            years: (n: number) =>
              `${Math.round(n)} năm ${isFuture ? 'sau' : 'trước'}`,
          }
        : {
            justNow: 'just now',
            seconds: (n: number) =>
              `${Math.round(n)} second${n >= 2 ? 's' : ''} ${
                isFuture ? 'from now' : 'ago'
              }`,
            minutes: (n: number) =>
              `${Math.round(n)} minute${n >= 2 ? 's' : ''} ${
                isFuture ? 'from now' : 'ago'
              }`,
            hours: (n: number) =>
              `${Math.round(n)} hour${n >= 2 ? 's' : ''} ${
                isFuture ? 'from now' : 'ago'
              }`,
            days: (n: number) =>
              `${Math.round(n)} day${n >= 2 ? 's' : ''} ${
                isFuture ? 'from now' : 'ago'
              }`,
            months: (n: number) =>
              `${Math.round(n)} month${n >= 2 ? 's' : ''} ${
                isFuture ? 'from now' : 'ago'
              }`,
            years: (n: number) =>
              `${Math.round(n)} year${n >= 2 ? 's' : ''} ${
                isFuture ? 'from now' : 'ago'
              }`,
          };

    if (diffSeconds < 45) return phrases.justNow;
    if (diffMinutes < 60) return phrases.minutes(diffMinutes);
    if (diffHours < 24) return phrases.hours(diffHours);
    if (diffDays < 30) return phrases.days(diffDays);
    if (diffDays < 365) return phrases.months(diffMonths);
    return phrases.years(diffYears);
  }

  // Định dạng cố định
  const pad = (n: number) => n.toString().padStart(2, '0');
  const replacements: { [key: string]: string } = {
    dd: pad(dateObj.getDate()),
    MM: pad(dateObj.getMonth() + 1),
    yyyy: dateObj.getFullYear().toString(),
    HH: pad(dateObj.getHours()),
    mm: pad(dateObj.getMinutes()),
    ss: pad(dateObj.getSeconds()),
  };

  let result = fixedPattern;
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(key, value);
  }

  return result;
}
