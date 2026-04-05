import { useState, useMemo } from 'react';
import { UmbrellaOff, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import './MarkHolidays.css';

type SlotKey = 'morning' | 'noon' | 'evening';
type DayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

type TimeSlot = {
  enabled: boolean;
  startTime: string;
  endTime: string;
  maxPatients: number;
};
type DaySchedule = Record<SlotKey, TimeSlot>;
type WeeklySchedule = Record<DayKey, DaySchedule>;
type HolidayMark = Record<SlotKey, boolean>;
type HolidaysStore = Record<string, HolidayMark>;

const LS_SCHEDULE = 'vc_doctor_schedule';
const LS_HOLIDAYS = 'vc_holidays';

const DAY_INDEX_MAP: DayKey[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const SLOTS: { key: SlotKey; label: string; color: string }[] = [
  { key: 'morning', label: 'Morning', color: '#f59e0b' },
  { key: 'noon', label: 'Noon', color: '#10b981' },
  { key: 'evening', label: 'Evening', color: '#6366f1' },
];

const defaultSlot = (start: string, end: string): TimeSlot => ({
  enabled: true,
  startTime: start,
  endTime: end,
  maxPatients: 10,
});

const fallbackSchedule: WeeklySchedule = {
  monday: {
    morning: defaultSlot('09:00', '12:00'),
    noon: { ...defaultSlot('13:00', '15:00'), enabled: false },
    evening: defaultSlot('16:00', '19:00'),
  },
  tuesday: {
    morning: defaultSlot('09:00', '12:00'),
    noon: { ...defaultSlot('13:00', '15:00'), enabled: false },
    evening: defaultSlot('16:00', '19:00'),
  },
  wednesday: {
    morning: defaultSlot('09:00', '12:00'),
    noon: { ...defaultSlot('13:00', '15:00'), enabled: false },
    evening: defaultSlot('16:00', '19:00'),
  },
  thursday: {
    morning: defaultSlot('09:00', '12:00'),
    noon: { ...defaultSlot('13:00', '15:00'), enabled: false },
    evening: defaultSlot('16:00', '19:00'),
  },
  friday: {
    morning: defaultSlot('09:00', '12:00'),
    noon: { ...defaultSlot('13:00', '15:00'), enabled: false },
    evening: defaultSlot('16:00', '19:00'),
  },
  saturday: {
    morning: defaultSlot('09:00', '12:00'),
    noon: { ...defaultSlot('13:00', '15:00'), enabled: false },
    evening: { ...defaultSlot('16:00', '19:00'), enabled: false },
  },
  sunday: {
    morning: { ...defaultSlot('09:00', '12:00'), enabled: false },
    noon: { ...defaultSlot('13:00', '15:00'), enabled: false },
    evening: { ...defaultSlot('16:00', '19:00'), enabled: false },
  },
};

const loadSchedule = (): WeeklySchedule => {
  try {
    return JSON.parse(
      localStorage.getItem(LS_SCHEDULE) ?? '',
    ) as WeeklySchedule;
  } catch {
    return fallbackSchedule;
  }
};

const loadHolidays = (): HolidaysStore => {
  try {
    return JSON.parse(localStorage.getItem(LS_HOLIDAYS) ?? '{}');
  } catch {
    return {};
  }
};

const saveHolidays = (h: HolidaysStore) => {
  localStorage.setItem(LS_HOLIDAYS, JSON.stringify(h));
};

const toDateStr = (d: Date) => d.toISOString().split('T')[0];
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function buildCalendar(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= last.getDate(); d++)
    cells.push(new Date(year, month, d));
  return cells;
}

function MarkHolidays() {
  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [holidays, setHolidays] = useState<HolidaysStore>(loadHolidays);
  const schedule = useMemo(loadSchedule, []);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });

  // Show 3 months starting from current view month
  const months = useMemo(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      let m = viewMonth + i;
      let y = viewYear;
      while (m > 11) {
        m -= 12;
        y++;
      }
      result.push({ year: y, month: m });
    }
    return result;
  }, [viewMonth, viewYear]);

  const prevMonths = () => {
    let m = viewMonth - 3;
    let y = viewYear;
    while (m < 0) {
      m += 12;
      y--;
    }
    // Don't go before current month
    const cur = new Date(y, m);
    const now = new Date(today.getFullYear(), today.getMonth());
    if (cur < now) {
      setViewMonth(today.getMonth());
      setViewYear(today.getFullYear());
      return;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const nextMonths = () => {
    let m = viewMonth + 3;
    let y = viewYear;
    while (m > 11) {
      m -= 12;
      y++;
    }
    setViewMonth(m);
    setViewYear(y);
  };

  const getEnabledSlots = (dateStr: string): SlotKey[] => {
    const d = new Date(dateStr + 'T00:00:00');
    const dayKey = DAY_INDEX_MAP[d.getDay()];
    return SLOTS.filter(s => schedule[dayKey][s.key].enabled).map(s => s.key);
  };

  const getHolidayMark = (dateStr: string): HolidayMark =>
    holidays[dateStr] ?? { morning: false, noon: false, evening: false };

  const toggleSlot = (dateStr: string, slot: SlotKey) => {
    const cur = getHolidayMark(dateStr);
    const updated: HolidayMark = { ...cur, [slot]: !cur[slot] };
    // If all enabled slots are OFF, remove the entry
    const enabled = getEnabledSlots(dateStr);
    const allOff = enabled.every(s => !updated[s]);
    const next = { ...holidays };
    if (allOff) {
      delete next[dateStr];
    } else {
      next[dateStr] = updated;
    }
    setHolidays(next);
    saveHolidays(next);
  };

  const toggleFullDay = (dateStr: string) => {
    const enabled = getEnabledSlots(dateStr);
    if (enabled.length === 0) return;
    const cur = getHolidayMark(dateStr);
    const allOn = enabled.every(s => cur[s]);
    const updated: HolidayMark = {
      morning: false,
      noon: false,
      evening: false,
    };
    if (!allOn) {
      enabled.forEach(s => {
        updated[s] = true;
      });
    }
    const next = { ...holidays };
    if (allOn) {
      delete next[dateStr];
    } else {
      next[dateStr] = updated;
    }
    setHolidays(next);
    saveHolidays(next);
  };

  const handleDateClick = (dateStr: string, e: React.MouseEvent) => {
    const d = new Date(dateStr + 'T00:00:00');
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    if (d < todayStart) return; // Can't mark past

    const enabled = getEnabledSlots(dateStr);
    if (enabled.length === 0) return; // Non-working day

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setPopupPos({ top: rect.bottom + 6, left: rect.left });
    setSelectedDate(prev => (prev === dateStr ? null : dateStr));
  };

  const getDateStatus = (
    dateStr: string,
  ):
    | 'past'
    | 'non-working'
    | 'working'
    | 'partial-holiday'
    | 'full-holiday' => {
    const d = new Date(dateStr + 'T00:00:00');
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    if (d < todayStart) return 'past';
    const enabled = getEnabledSlots(dateStr);
    if (enabled.length === 0) return 'non-working';
    const mark = getHolidayMark(dateStr);
    const onCount = enabled.filter(s => mark[s]).length;
    if (onCount === 0) return 'working';
    if (onCount === enabled.length) return 'full-holiday';
    return 'partial-holiday';
  };

  const isCurrentViewAtEarliest = () => {
    return viewYear === today.getFullYear() && viewMonth === today.getMonth();
  };

  return (
    <div className="holidays-page" onClick={() => setSelectedDate(null)}>
      <div className="holidays-header">
        <h1 className="dash-page-title">
          <UmbrellaOff size={22} /> Mark Holidays
        </h1>
        <div className="holidays-legend">
          <span className="legend-item">
            <span className="legend-dot working" />
            Working
          </span>
          <span className="legend-item">
            <span className="legend-dot partial-holiday" />
            Partial Off
          </span>
          <span className="legend-item">
            <span className="legend-dot full-holiday" />
            Full Day Off
          </span>
          <span className="legend-item">
            <span className="legend-dot non-working" />
            Non-Working
          </span>
        </div>
      </div>

      <div className="holidays-info-bar dash-card">
        <Info size={14} />
        <span>
          Click any upcoming working day to mark slots as holidays. A full day
          off marks all your scheduled slots. Past dates cannot be changed.
        </span>
      </div>

      {/* Month navigation */}
      <div className="month-nav">
        <button
          type="button"
          className="month-nav-btn"
          onClick={prevMonths}
          disabled={isCurrentViewAtEarliest()}
        >
          <ChevronLeft size={18} />
        </button>
        <span className="month-nav-label">
          {MONTH_NAMES[months[0].month]} – {MONTH_NAMES[months[2].month]}{' '}
          {months[2].year}
        </span>
        <button type="button" className="month-nav-btn" onClick={nextMonths}>
          <ChevronRight size={18} />
        </button>
      </div>

      {/* 3 Calendar grids */}
      <div className="calendars-grid">
        {months.map(({ year, month }) => {
          const cells = buildCalendar(year, month);
          return (
            <div key={`${year}-${month}`} className="calendar-month dash-card">
              <h3 className="cal-month-title">
                {MONTH_NAMES[month]} {year}
              </h3>
              <div className="cal-grid">
                {DAY_NAMES_SHORT.map(d => (
                  <div key={d} className="cal-dow">
                    {d}
                  </div>
                ))}
                {cells.map((date, i) => {
                  if (!date)
                    return (
                      <div key={`empty-${i}`} className="cal-cell empty" />
                    );
                  const dStr = toDateStr(date);
                  const status = getDateStatus(dStr);
                  const isSelected = selectedDate === dStr;
                  const isT = dStr === toDateStr(today);
                  const mark = getHolidayMark(dStr);
                  const enabled = getEnabledSlots(dStr);

                  return (
                    <div
                      key={dStr}
                      className={`cal-cell status-${status}${isSelected ? ' selected' : ''}${isT ? ' today' : ''}`}
                      onClick={e => {
                        e.stopPropagation();
                        handleDateClick(dStr, e);
                      }}
                    >
                      <span className="cal-day-num">{date.getDate()}</span>
                      {/* Slot indicators */}
                      {status !== 'past' && status !== 'non-working' && (
                        <div className="cal-slot-dots">
                          {SLOTS.filter(s => enabled.includes(s.key)).map(s => (
                            <span
                              key={s.key}
                              className="cal-slot-dot"
                              style={{
                                background: mark[s.key] ? '#ef4444' : s.color,
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup for selected date */}
      {selectedDate &&
        (() => {
          const enabled = getEnabledSlots(selectedDate);
          const mark = getHolidayMark(selectedDate);
          const allOn = enabled.every(s => mark[s]);
          const d = new Date(selectedDate + 'T00:00:00');
          const formatted = d.toLocaleDateString('en-IN', {
            weekday: 'long',
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div
              className="holiday-popup"
              style={{
                top: popupPos.top,
                left: Math.min(popupPos.left, window.innerWidth - 250),
              }}
              onClick={e => e.stopPropagation()}
            >
              <div className="popup-date">{formatted}</div>
              <button
                type="button"
                className={`popup-full-day-btn${allOn ? ' active' : ''}`}
                onClick={() => toggleFullDay(selectedDate)}
              >
                {allOn ? 'Unmark Full Day Off' : 'Mark Full Day Off'}
              </button>
              <div className="popup-slots">
                {SLOTS.filter(s => enabled.includes(s.key)).map(s => (
                  <label key={s.key} className="popup-slot-row">
                    <input
                      type="checkbox"
                      checked={!!mark[s.key]}
                      onChange={() => toggleSlot(selectedDate, s.key)}
                    />
                    <span
                      className="popup-slot-dot"
                      style={{ background: s.color }}
                    />
                    <span>{s.label}</span>
                    {mark[s.key] && (
                      <span className="popup-slot-off-tag">Off</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          );
        })()}
    </div>
  );
}

export default MarkHolidays;
