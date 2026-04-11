import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Settings2,
  X,
  Clock,
  PawPrint,
  Plus,
  Check,
  Copy,
  ClipboardList,
} from 'lucide-react';
import SearchableSelectInput from '../../utility/SearchableSelectInput';
import { useSpeciesBreeds } from '../../utility/useSpeciesBreeds';
import './Appointments.css';
import { formatIstDate, getIstDateKey } from '../../../utils/istDateTime';

/* ── Types ── */
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

type Appointment = {
  id: string;
  slot: SlotKey;
  patientName: string;
  species: string;
  breed: string;
  age: string;
  ownerName: string;
  ownerContact: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  cancellationNote?: string;
};

type HolidayMark = Record<SlotKey, boolean>;
type HolidaysStore = Record<string, HolidayMark>;

/* ── Defaults ── */
const defaultSlot = (start: string, end: string): TimeSlot => ({
  enabled: true,
  startTime: start,
  endTime: end,
  maxPatients: 10,
});

const defaultSchedule: WeeklySchedule = {
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

const DAY_KEYS: { key: DayKey; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

const cloneDaySchedule = (daySchedule: DaySchedule): DaySchedule => ({
  morning: { ...daySchedule.morning },
  noon: { ...daySchedule.noon },
  evening: { ...daySchedule.evening },
});

const SLOT_META: { key: SlotKey; label: string; color: string }[] = [
  { key: 'morning', label: 'Morning', color: '#f59e0b' },
  { key: 'noon', label: 'Noon', color: '#10b981' },
  { key: 'evening', label: 'Evening', color: '#6366f1' },
];

const SLOT_TIME_RULES: Record<
  SlotKey,
  { startMin: string; startMax: string; endMin: string; endMax: string }
> = {
  morning: {
    startMin: '07:00',
    startMax: '12:00',
    endMin: '08:00',
    endMax: '15:00',
  },
  noon: {
    startMin: '12:00',
    startMax: '16:00',
    endMin: '13:00',
    endMax: '18:00',
  },
  evening: {
    startMin: '16:00',
    startMax: '21:00',
    endMin: '17:00',
    endMax: '22:00',
  },
};

const LS_SCHEDULE = 'vc_doctor_schedule';
const LS_APPOINTMENTS = 'vc_appointments';
const LS_HOLIDAYS = 'vc_holidays';

const loadSchedule = (): WeeklySchedule => {
  try {
    return normalizeWeeklySchedule(
      JSON.parse(localStorage.getItem(LS_SCHEDULE) ?? '') as WeeklySchedule,
    );
  } catch {
    return defaultSchedule;
  }
};

const loadAppointments = (): Record<string, Appointment[]> => {
  try {
    return JSON.parse(localStorage.getItem(LS_APPOINTMENTS) ?? '{}');
  } catch {
    return {};
  }
};

const loadHolidays = (): HolidaysStore => {
  try {
    return JSON.parse(localStorage.getItem(LS_HOLIDAYS) ?? '{}');
  } catch {
    return {};
  }
};

const toDateStr = (d: Date) => getIstDateKey(d);
const getDayKey = (d: Date): DayKey =>
  DAY_KEYS[d.getDay() === 0 ? 6 : d.getDay() - 1].key;

const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number) => {
  const clamped = Math.max(0, Math.min(23 * 60 + 59, minutes));
  const hours = Math.floor(clamped / 60)
    .toString()
    .padStart(2, '0');
  const mins = (clamped % 60).toString().padStart(2, '0');
  return `${hours}:${mins}`;
};

const formatTimeLabel = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const twelveHour = hours % 12 || 12;
  return `${twelveHour.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')} ${suffix}`;
};

const buildTimeOptions = (min: string, max: string, stepMinutes = 30) => {
  const options: string[] = [];
  const minMinutes = timeToMinutes(min);
  const maxMinutes = timeToMinutes(max);

  for (
    let currentMinutes = minMinutes;
    currentMinutes <= maxMinutes;
    currentMinutes += stepMinutes
  ) {
    options.push(minutesToTime(currentMinutes));
  }

  return options;
};

const clampTime = (time: string, min: string, max: string) => {
  if (time < min) return min;
  if (time > max) return max;
  return time;
};

const normalizeTimeSlot = (
  slot: SlotKey,
  timeSlot: TimeSlot,
  changedField?: 'startTime' | 'endTime',
): TimeSlot => {
  const rules = SLOT_TIME_RULES[slot];
  let startTime = clampTime(timeSlot.startTime, rules.startMin, rules.startMax);
  let endTime = clampTime(timeSlot.endTime, rules.endMin, rules.endMax);

  if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
    if (changedField === 'endTime') {
      startTime = clampTime(
        minutesToTime(timeToMinutes(endTime) - 30),
        rules.startMin,
        rules.startMax,
      );
    } else {
      endTime = clampTime(
        minutesToTime(timeToMinutes(startTime) + 30),
        rules.endMin,
        rules.endMax,
      );
    }
  }

  return {
    ...timeSlot,
    startTime,
    endTime,
  };
};

const normalizeWeeklySchedule = (weeklySchedule: WeeklySchedule) => {
  const nextSchedule = { ...weeklySchedule } as WeeklySchedule;

  DAY_KEYS.forEach(({ key: day }) => {
    nextSchedule[day] = { ...weeklySchedule[day] };
    SLOT_META.forEach(({ key: slot }) => {
      nextSchedule[day][slot] = normalizeTimeSlot(
        slot,
        weeklySchedule[day][slot],
      );
    });
  });

  return nextSchedule;
};

/* ── Component ── */
function Appointments() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<WeeklySchedule>(loadSchedule);
  const [appointments, setAppointments] =
    useState<Record<string, Appointment[]>>(loadAppointments);
  const [holidays] = useState<HolidaysStore>(loadHolidays);

  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState<WeeklySchedule>(schedule);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addSlot, setAddSlot] = useState<SlotKey>('morning');
  const [cancelTarget, setCancelTarget] = useState<Appointment | null>(null);
  const [cancelNote, setCancelNote] = useState('');
  const { speciesNames, getBreedsForSpecies } = useSpeciesBreeds();
  const [addForm, setAddForm] = useState({
    patientName: '',
    species: '',
    breed: '',
    age: '',
    ownerName: '',
    ownerContact: '',
  });
  const addBreedOptions = getBreedsForSpecies(addForm.species);

  const dateStr = toDateStr(currentDate);
  const dayKey = getDayKey(currentDate);
  const daySchedule = schedule[dayKey];
  const dayHolidays = holidays[dateStr] ?? {
    morning: false,
    noon: false,
    evening: false,
  };
  const dayAppointments = appointments[dateStr] ?? [];

  useEffect(() => {
    localStorage.setItem(LS_SCHEDULE, JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem(LS_APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToday = () => setCurrentDate(new Date());

  /* Scheduler helpers */
  const openScheduler = () => {
    setDraftSchedule(normalizeWeeklySchedule(schedule));
    setShowSchedulerModal(true);
  };

  const updateDraft = (
    day: DayKey,
    slot: SlotKey,
    field: keyof TimeSlot,
    val: string | number | boolean,
  ) => {
    setDraftSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [slot]:
          field === 'startTime' || field === 'endTime'
            ? normalizeTimeSlot(
                slot,
                {
                  ...prev[day][slot],
                  [field]: val,
                },
                field,
              )
            : { ...prev[day][slot], [field]: val },
      },
    }));
  };

  const copyDaySchedule = (targetDay: DayKey, sourceDay: DayKey) => {
    setDraftSchedule(prev => ({
      ...prev,
      [targetDay]: normalizeWeeklySchedule({
        ...prev,
        [targetDay]: cloneDaySchedule(prev[sourceDay]),
      })[targetDay],
    }));
  };

  const saveSchedule = () => {
    setSchedule(normalizeWeeklySchedule(draftSchedule));
    setShowSchedulerModal(false);
  };

  /* Add appointment */
  const openAddAppt = (slot: SlotKey) => {
    setAddSlot(slot);
    setAddForm({
      patientName: '',
      species: '',
      breed: '',
      age: '',
      ownerName: '',
      ownerContact: '',
    });
    setShowAddModal(true);
  };

  const saveAppointment = () => {
    if (!addForm.patientName.trim()) return;
    const appt: Appointment = {
      id: `${dateStr}-${Date.now()}`,
      slot: addSlot,
      patientName: addForm.patientName,
      species: addForm.species,
      breed: addForm.breed,
      age: addForm.age,
      ownerName: addForm.ownerName,
      ownerContact: addForm.ownerContact,
      status: 'scheduled',
    };
    setAppointments(prev => ({
      ...prev,
      [dateStr]: [...(prev[dateStr] ?? []), appt],
    }));
    setShowAddModal(false);
  };

  const updateApptStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev => ({
      ...prev,
      [dateStr]: (prev[dateStr] ?? []).map(a =>
        a.id === id ? { ...a, status } : a,
      ),
    }));
  };

  const removeAppt = (id: string) => {
    setAppointments(prev => ({
      ...prev,
      [dateStr]: (prev[dateStr] ?? []).filter(a => a.id !== id),
    }));
  };

  const openCancelAppointment = (appt: Appointment) => {
    setCancelTarget(appt);
    setCancelNote('');
  };

  const confirmCancelAppointment = () => {
    if (!cancelTarget) {
      return;
    }

    setAppointments(prev => ({
      ...prev,
      [dateStr]: (prev[dateStr] ?? []).map(appt =>
        appt.id === cancelTarget.id
          ? {
              ...appt,
              status: 'cancelled',
              cancellationNote: cancelNote.trim(),
            }
          : appt,
      ),
    }));

    setCancelTarget(null);
    setCancelNote('');
  };

  const openPrescriptionForAppointment = (appt: Appointment) => {
    navigate('/doctor/dashboard/prescriptions', {
      state: {
        prefill: {
          animalName: appt.patientName,
          species: appt.species,
          breed: appt.breed,
          age: appt.age,
          ownerName: appt.ownerName,
          ownerContact: appt.ownerContact,
          prescriptionDate: dateStr,
        },
      },
    });
  };

  const isToday = toDateStr(currentDate) === toDateStr(new Date());

  const formatFullDate = (d: Date) =>
    formatIstDate(d, {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });

  return (
    <div className="appointments-page">
      {/* Header */}
      <div className="appt-header">
        <h1 className="dash-page-title">
          <Calendar size={22} /> Appointments
        </h1>
        <button
          className="btn-set-schedule"
          type="button"
          onClick={openScheduler}
        >
          <Settings2 size={15} /> Set My Schedule
        </button>
      </div>

      {/* Day Navigation */}
      <div className="day-nav dash-card">
        <button
          className="day-nav-arrow"
          type="button"
          onClick={prevDay}
          aria-label="Previous day"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="day-nav-center">
          <span className="day-nav-date">{formatFullDate(currentDate)}</span>
          <button
            className="btn-today"
            type="button"
            onClick={goToday}
            disabled={isToday}
          >
            Today
          </button>
        </div>
        <button
          className="day-nav-arrow"
          type="button"
          onClick={nextDay}
          aria-label="Next day"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Slots */}
      <div className="slots-container">
        {SLOT_META.map(({ key, label, color }) => {
          const slot = daySchedule[key];
          const isHoliday = dayHolidays[key];
          const slotAppts = dayAppointments.filter(a => a.slot === key);
          const slotSummary = !slot.enabled
            ? 'This session is currently unavailable.'
            : isHoliday
              ? 'This session is blocked because of a holiday.'
              : slotAppts.length === 0
                ? 'Open for new appointments.'
                : `${slotAppts.length} appointment${slotAppts.length > 1 ? 's' : ''} lined up for this session.`;

          return (
            <div
              key={key}
              className={`slot-card dash-card${!slot.enabled ? ' slot-disabled' : ''}${isHoliday ? ' slot-holiday' : ''}`}
              style={{ '--slot-accent': color } as React.CSSProperties}
            >
              <div className="slot-header">
                <div className="slot-header-main">
                  <div className="slot-label-group">
                    <span className="slot-badge">{label}</span>
                    {slot.enabled && (
                      <span className="slot-time">
                        <Clock size={12} />
                        {slot.startTime} – {slot.endTime}
                      </span>
                    )}
                  </div>

                  <div className="slot-header-copy">
                    <p className="slot-summary">{slotSummary}</p>
                    <span className="slot-count-chip">
                      {slot.enabled && !isHoliday
                        ? `${slotAppts.length} booked`
                        : 'Session paused'}
                    </span>
                  </div>
                </div>

                <div className="slot-header-actions">
                  {!slot.enabled && (
                    <span className="slot-status-tag">Not Available</span>
                  )}
                  {slot.enabled && isHoliday && (
                    <span className="slot-status-tag holiday-tag">Holiday</span>
                  )}
                  {slot.enabled && !isHoliday && (
                    <button
                      type="button"
                      className="btn-add-appt"
                      onClick={() => openAddAppt(key)}
                      style={{ color }}
                    >
                      <Plus size={13} /> Add
                    </button>
                  )}
                </div>
              </div>

              {slot.enabled && !isHoliday && (
                <div className="slot-appointments">
                  {slotAppts.length === 0 ? (
                    <div className="slot-empty-state">
                      <div className="slot-empty-copy">
                        <div className="slot-empty-icon">
                          <PawPrint size={16} />
                        </div>
                        <div>
                          <p className="slot-empty-title">
                            No appointments yet
                          </p>
                          <p className="slot-empty-text">
                            Keep this session available for walk-ins or add the
                            first booking now.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="slot-empty-action"
                        onClick={() => openAddAppt(key)}
                      >
                        <Plus size={14} />
                        <span>Add Appointment</span>
                      </button>
                    </div>
                  ) : (
                    slotAppts.map(appt => (
                      <div
                        key={appt.id}
                        className={`appt-row appt-status-${appt.status}`}
                      >
                        <PawPrint size={13} className="appt-icon" />
                        <div className="appt-info">
                          <span className="appt-name">{appt.patientName}</span>
                          {appt.species && (
                            <span className="appt-species">
                              ({appt.species})
                            </span>
                          )}
                          {appt.ownerName && (
                            <span className="appt-owner">
                              {' '}
                              · {appt.ownerName}
                            </span>
                          )}
                          {appt.status === 'cancelled' &&
                            appt.cancellationNote && (
                              <p className="appt-cancel-note">
                                Doctor note: {appt.cancellationNote}
                              </p>
                            )}
                        </div>
                        <div className="appt-actions">
                          <button
                            type="button"
                            title="Write prescription"
                            className="appt-action-btn prescription-btn"
                            onClick={() => openPrescriptionForAppointment(appt)}
                          >
                            <ClipboardList size={13} />
                          </button>
                          {appt.status === 'scheduled' && (
                            <>
                              <button
                                type="button"
                                title="Mark complete"
                                className="appt-action-btn complete-btn"
                                onClick={() =>
                                  updateApptStatus(appt.id, 'completed')
                                }
                              >
                                <Check size={13} />
                              </button>
                              <button
                                type="button"
                                title="Cancel"
                                className="appt-action-btn cancel-btn"
                                onClick={() => openCancelAppointment(appt)}
                              >
                                <X size={13} />
                              </button>
                            </>
                          )}
                          {appt.status !== 'scheduled' && (
                            <span className={`appt-done-tag ${appt.status}`}>
                              {appt.status}
                            </span>
                          )}
                          <button
                            type="button"
                            title="Remove"
                            className="appt-action-btn remove-btn"
                            onClick={() => removeAppt(appt.id)}
                          >
                            <Trash size={11} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {(!slot.enabled || isHoliday) && (
                <div className="slot-muted-state">
                  <p className="slot-muted-title">
                    {!slot.enabled
                      ? 'Session not enabled'
                      : 'Holiday block active'}
                  </p>
                  <p className="slot-muted-text">
                    {!slot.enabled
                      ? 'Enable this slot from Set My Schedule whenever you want to accept appointments here.'
                      : 'Remove the holiday block when you are ready to reopen this session.'}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Scheduler Modal ── */}
      {showSchedulerModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSchedulerModal(false)}
        >
          <div
            className="modal schedule-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Settings2 size={18} /> Weekly Schedule
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowSchedulerModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="schedule-grid-wrapper">
              <div className="schedule-helper">
                {SLOT_META.map(slotMeta => {
                  const rules = SLOT_TIME_RULES[slotMeta.key];
                  return (
                    <div key={slotMeta.key} className="schedule-helper-card">
                      <div className="schedule-helper-title-row">
                        <span
                          className="schedule-helper-dot"
                          style={{ background: slotMeta.color }}
                        />
                        <span className="schedule-helper-title">
                          {slotMeta.label}
                        </span>
                      </div>
                      <p className="schedule-helper-text">
                        Start: {formatTimeLabel(rules.startMin)} to{' '}
                        {formatTimeLabel(rules.startMax)}
                      </p>
                      <p className="schedule-helper-text">
                        End: {formatTimeLabel(rules.endMin)} to{' '}
                        {formatTimeLabel(rules.endMax)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <table className="schedule-table">
                <thead>
                  <tr>
                    <th className="schedule-day-heading">Day</th>
                    {SLOT_META.map(s => (
                      <th key={s.key} style={{ color: s.color }}>
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAY_KEYS.map(({ key: day, label }) => (
                    <tr
                      key={day}
                      className={`schedule-row schedule-row-${day}`}
                    >
                      <td className="sch-day-name">
                        <div className="sch-day-cell">
                          <span>{label}</span>
                          {day !== 'monday' && (
                            <div className="sch-day-actions">
                              <button
                                type="button"
                                className="sch-copy-btn"
                                onClick={() => copyDaySchedule(day, 'monday')}
                                title="Same as Monday"
                                aria-label="Same as Monday"
                              >
                                <Copy size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                      {SLOT_META.map(({ key: slot }) => {
                        const ts = draftSchedule[day][slot];
                        const rules = SLOT_TIME_RULES[slot];
                        const startOptions = buildTimeOptions(
                          rules.startMin,
                          rules.startMax,
                        ).filter(option => option < ts.endTime);
                        const endOptions = buildTimeOptions(
                          rules.endMin,
                          rules.endMax,
                        ).filter(option => option > ts.startTime);
                        return (
                          <td key={slot} className="sch-slot-cell">
                            <label className="sch-enable-toggle">
                              <input
                                type="checkbox"
                                checked={ts.enabled}
                                onChange={e =>
                                  updateDraft(
                                    day,
                                    slot,
                                    'enabled',
                                    e.target.checked,
                                  )
                                }
                              />
                              <span
                                className="sch-enable-switch"
                                aria-hidden="true"
                              >
                                <span className="sch-enable-thumb" />
                              </span>
                              <span className="sch-enable-text">
                                {ts.enabled ? 'On' : 'Off'}
                              </span>
                            </label>
                            {ts.enabled && (
                              <div className="sch-times">
                                <select
                                  value={ts.startTime}
                                  onChange={e =>
                                    updateDraft(
                                      day,
                                      slot,
                                      'startTime',
                                      e.target.value,
                                    )
                                  }
                                >
                                  {startOptions.map(option => (
                                    <option key={option} value={option}>
                                      {formatTimeLabel(option)}
                                    </option>
                                  ))}
                                </select>
                                <span>–</span>
                                <select
                                  value={ts.endTime}
                                  onChange={e =>
                                    updateDraft(
                                      day,
                                      slot,
                                      'endTime',
                                      e.target.value,
                                    )
                                  }
                                >
                                  {endOptions.map(option => (
                                    <option key={option} value={option}>
                                      {formatTimeLabel(option)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowSchedulerModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={saveSchedule}
              >
                Save Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Appointment Modal ── */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div
            className="modal add-appt-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <Plus size={16} /> Add Appointment
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setShowAddModal(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="add-appt-form">
              <label>
                Animal Name *
                <input
                  value={addForm.patientName}
                  onChange={e =>
                    setAddForm(f => ({ ...f, patientName: e.target.value }))
                  }
                  placeholder="e.g. Bruno"
                  autoFocus
                />
              </label>
              <label>
                Species
                <SearchableSelectInput
                  inputId="appointment-species"
                  listId="appointment-species-list"
                  value={addForm.species}
                  onChange={value =>
                    setAddForm(f => ({ ...f, species: value, breed: '' }))
                  }
                  options={speciesNames}
                  placeholder="Search or type species"
                  allowCustom
                />
              </label>
              <label>
                Breed
                <SearchableSelectInput
                  inputId="appointment-breed"
                  listId="appointment-breed-list"
                  value={addForm.breed}
                  onChange={value => setAddForm(f => ({ ...f, breed: value }))}
                  options={addBreedOptions}
                  placeholder={
                    addForm.species.trim()
                      ? 'Search or type breed'
                      : 'Select species first'
                  }
                  disabled={!addForm.species.trim()}
                  allowCustom
                />
              </label>
              <label>
                Age (years)
                <input
                  value={addForm.age}
                  onChange={e =>
                    setAddForm(f => ({
                      ...f,
                      age: e.target.value.replace(/[^0-9]/g, '').slice(0, 2),
                    }))
                  }
                  placeholder="e.g. 3"
                  inputMode="numeric"
                />
              </label>
              <label>
                Owner Name
                <input
                  value={addForm.ownerName}
                  onChange={e =>
                    setAddForm(f => ({ ...f, ownerName: e.target.value }))
                  }
                  placeholder="Owner's name"
                />
              </label>
              <label>
                Owner Contact
                <input
                  value={addForm.ownerContact}
                  onChange={e =>
                    setAddForm(f => ({
                      ...f,
                      ownerContact: e.target.value
                        .replace(/[^0-9]/g, '')
                        .slice(0, 10),
                    }))
                  }
                  placeholder="Mobile number"
                  inputMode="numeric"
                />
              </label>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={saveAppointment}
                disabled={!addForm.patientName.trim()}
              >
                Add Appointment
              </button>
            </div>
          </div>
        </div>
      )}

      {cancelTarget && (
        <div className="modal-overlay" onClick={() => setCancelTarget(null)}>
          <div
            className="modal add-appt-modal cancel-appt-modal"
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>
                <X size={16} /> Cancel Appointment
              </h2>
              <button
                type="button"
                className="modal-close"
                onClick={() => setCancelTarget(null)}
              >
                <X size={18} />
              </button>
            </div>
            <div className="add-appt-form cancel-appt-form">
              <p className="cancel-appt-copy">
                You are about to cancel the appointment for
                <strong> {cancelTarget.patientName}</strong>.
              </p>
              <label>
                Cancellation note (optional)
                <textarea
                  rows={3}
                  value={cancelNote}
                  onChange={e => setCancelNote(e.target.value)}
                  placeholder="If you would like, you can add a short note for your records or for the team."
                  autoFocus
                />
              </label>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-outline"
                onClick={() => setCancelTarget(null)}
              >
                Keep Appointment
              </button>
              <button
                type="button"
                className="btn-primary btn-cancel-appointment"
                onClick={confirmCancelAppointment}
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Inline trash icon to avoid import collision */
function Trash({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

export default Appointments;
