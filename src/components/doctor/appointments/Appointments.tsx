import { useState, useEffect } from 'react';
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
} from 'lucide-react';
import './Appointments.css';

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
  ownerName: string;
  ownerContact: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
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

const SLOT_META: { key: SlotKey; label: string; color: string }[] = [
  { key: 'morning', label: 'Morning', color: '#f59e0b' },
  { key: 'noon', label: 'Noon', color: '#10b981' },
  { key: 'evening', label: 'Evening', color: '#6366f1' },
];

const LS_SCHEDULE = 'vc_doctor_schedule';
const LS_APPOINTMENTS = 'vc_appointments';
const LS_HOLIDAYS = 'vc_holidays';

const loadSchedule = (): WeeklySchedule => {
  try {
    return JSON.parse(
      localStorage.getItem(LS_SCHEDULE) ?? '',
    ) as WeeklySchedule;
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

const toDateStr = (d: Date) => d.toISOString().split('T')[0];
const getDayKey = (d: Date): DayKey =>
  DAY_KEYS[d.getDay() === 0 ? 6 : d.getDay() - 1].key;

/* ── Component ── */
function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedule, setSchedule] = useState<WeeklySchedule>(loadSchedule);
  const [appointments, setAppointments] =
    useState<Record<string, Appointment[]>>(loadAppointments);
  const [holidays] = useState<HolidaysStore>(loadHolidays);

  const [showSchedulerModal, setShowSchedulerModal] = useState(false);
  const [draftSchedule, setDraftSchedule] = useState<WeeklySchedule>(schedule);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addSlot, setAddSlot] = useState<SlotKey>('morning');
  const [addForm, setAddForm] = useState({
    patientName: '',
    species: '',
    ownerName: '',
    ownerContact: '',
    notes: '',
  });

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
    setDraftSchedule(schedule);
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
      [day]: { ...prev[day], [slot]: { ...prev[day][slot], [field]: val } },
    }));
  };

  const saveSchedule = () => {
    setSchedule(draftSchedule);
    setShowSchedulerModal(false);
  };

  /* Add appointment */
  const openAddAppt = (slot: SlotKey) => {
    setAddSlot(slot);
    setAddForm({
      patientName: '',
      species: '',
      ownerName: '',
      ownerContact: '',
      notes: '',
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
      ownerName: addForm.ownerName,
      ownerContact: addForm.ownerContact,
      notes: addForm.notes,
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

  const isToday = toDateStr(currentDate) === toDateStr(new Date());

  const formatFullDate = (d: Date) =>
    d.toLocaleDateString('en-IN', {
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

          return (
            <div
              key={key}
              className={`slot-card dash-card${!slot.enabled ? ' slot-disabled' : ''}${isHoliday ? ' slot-holiday' : ''}`}
            >
              <div className="slot-header" style={{ borderLeftColor: color }}>
                <div className="slot-label-group">
                  <span className="slot-badge" style={{ background: color }}>
                    {label}
                  </span>
                  {slot.enabled && (
                    <span className="slot-time">
                      <Clock size={12} />
                      {slot.startTime} – {slot.endTime}
                    </span>
                  )}
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
                    <p className="no-appts">No appointments scheduled</p>
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
                        </div>
                        <div className="appt-actions">
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
                                onClick={() =>
                                  updateApptStatus(appt.id, 'cancelled')
                                }
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
              <table className="schedule-table">
                <thead>
                  <tr>
                    <th>Day</th>
                    {SLOT_META.map(s => (
                      <th key={s.key} style={{ color: s.color }}>
                        {s.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAY_KEYS.map(({ key: day, label }) => (
                    <tr key={day}>
                      <td className="sch-day-name">{label}</td>
                      {SLOT_META.map(({ key: slot }) => {
                        const ts = draftSchedule[day][slot];
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
                              <span>On</span>
                            </label>
                            {ts.enabled && (
                              <div className="sch-times">
                                <input
                                  type="time"
                                  value={ts.startTime}
                                  onChange={e =>
                                    updateDraft(
                                      day,
                                      slot,
                                      'startTime',
                                      e.target.value,
                                    )
                                  }
                                />
                                <span>–</span>
                                <input
                                  type="time"
                                  value={ts.endTime}
                                  onChange={e =>
                                    updateDraft(
                                      day,
                                      slot,
                                      'endTime',
                                      e.target.value,
                                    )
                                  }
                                />
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
                <input
                  value={addForm.species}
                  onChange={e =>
                    setAddForm(f => ({ ...f, species: e.target.value }))
                  }
                  placeholder="Dog, Cat…"
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
                    setAddForm(f => ({ ...f, ownerContact: e.target.value }))
                  }
                  placeholder="Mobile number"
                />
              </label>
              <label>
                Notes
                <textarea
                  rows={2}
                  value={addForm.notes}
                  onChange={e =>
                    setAddForm(f => ({ ...f, notes: e.target.value }))
                  }
                  placeholder="Any notes…"
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
