import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  FileText,
  Syringe,
  UserCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { getIstDateKey } from '../../../utils/istDateTime';
import type { PartnerDoctor } from './PartnerDoctors';
import './PartnerReports.css';

type Appointment = {
  id: string;
  status?: string;
};

type PrescriptionRecord = {
  id: string;
  createdAt?: string;
  prescriptionDate?: string;
};

type VaccinationRecord = {
  id: string;
  dateAdministered: string;
};

type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';
type AttendanceStore = Record<string, Record<string, AttendanceStatus>>;
type AppointmentsStore = Record<string, Appointment[]>;
type ReportMode = 'daily' | 'monthly';

const LS_PARTNERS = 'vc_partner_doctors';
const LS_ATTENDANCE = 'vc_attendance';

const loadPartners = (): PartnerDoctor[] => {
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_PARTNERS) ?? '[]') as
      | PartnerDoctor[]
      | undefined;
    return (parsed ?? []).map(partner => ({
      ...partner,
      isActive: partner.isActive !== false,
    }));
  } catch {
    return [];
  }
};

const readPrescriptions = (key: string) => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(key) ?? '[]',
    ) as PrescriptionRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as PrescriptionRecord[];
  }
};

const readAppointments = (partnerId: string) => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(`p_${partnerId}_vc_appointments`) ?? '{}',
    ) as AppointmentsStore;
    return parsed;
  } catch {
    return {} as AppointmentsStore;
  }
};

const readVaccinations = (key: string) => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(key) ?? '[]',
    ) as VaccinationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as VaccinationRecord[];
  }
};

const readAttendance = () => {
  try {
    const parsed = JSON.parse(
      localStorage.getItem(LS_ATTENDANCE) ?? '{}',
    ) as AttendanceStore;
    return parsed;
  } catch {
    return {} as AttendanceStore;
  }
};

const toMonthKey = (dateKey: string) => dateKey.slice(0, 7);

const matchesPeriod = (
  dateKey: string,
  mode: ReportMode,
  selectedDate: string,
  selectedMonth: string,
) => {
  if (!dateKey) return false;
  if (mode === 'daily') return dateKey === selectedDate;
  return toMonthKey(dateKey) === selectedMonth;
};

const getPrescriptionDateKey = (record: PrescriptionRecord): string => {
  if (record.prescriptionDate) return record.prescriptionDate;
  if (record.createdAt) return record.createdAt.slice(0, 10);
  return '';
};

function PartnerReports() {
  const partners = useMemo(loadPartners, []);
  const todayKey = getIstDateKey();
  const [mode, setMode] = useState<ReportMode>('daily');
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [selectedMonth, setSelectedMonth] = useState(todayKey.slice(0, 7));
  const clinicAttendance = useMemo(readAttendance, []);

  const reportRows = useMemo(
    () =>
      partners.map(partner => {
        const appointmentStore = readAppointments(partner.id);
        const appointments = Object.entries(appointmentStore)
          .filter(([dateKey]) =>
            matchesPeriod(dateKey, mode, selectedDate, selectedMonth),
          )
          .flatMap(([, items]) => items);

        const completed = appointments.filter(
          appt => appt.status === 'completed',
        ).length;

        const prescriptions = readPrescriptions(
          `p_${partner.id}_vc_prescriptions`,
        ).filter(record =>
          matchesPeriod(
            getPrescriptionDateKey(record),
            mode,
            selectedDate,
            selectedMonth,
          ),
        );

        const vaccinations = readVaccinations(
          `p_${partner.id}_vc_vaccination_records`,
        ).filter(record =>
          matchesPeriod(
            record.dateAdministered,
            mode,
            selectedDate,
            selectedMonth,
          ),
        );

        const attendanceKey = `partner:${partner.id}`;
        const attendanceDays = Object.entries(clinicAttendance).filter(
          ([dateKey, dayRecord]) =>
            matchesPeriod(dateKey, mode, selectedDate, selectedMonth) &&
            Boolean(dayRecord[attendanceKey]),
        ).length;

        return {
          partner,
          appointmentCount: appointments.length,
          completedCount: completed,
          prescriptionCount: prescriptions.length,
          vaccinationCount: vaccinations.length,
          attendanceDays,
        };
      }),
    [clinicAttendance, mode, partners, selectedDate, selectedMonth],
  );

  const totals = useMemo(
    () =>
      reportRows.reduce(
        (acc, row) => {
          acc.appointments += row.appointmentCount;
          acc.prescriptions += row.prescriptionCount;
          acc.vaccinations += row.vaccinationCount;
          acc.attendance += row.attendanceDays;
          return acc;
        },
        { appointments: 0, prescriptions: 0, vaccinations: 0, attendance: 0 },
      ),
    [reportRows],
  );

  return (
    <div className="partner-reports-page">
      <header className="dash-card partner-reports-hero">
        <h1 className="dash-page-title">
          <BarChart3 size={22} /> Partner Doctor Reports
        </h1>
        <p>
          Monitor partner doctors activity across appointments, prescriptions,
          vaccinations, and attendance.
        </p>
        <div className="partner-report-controls">
          <div className="partner-report-mode-toggle">
            <button
              type="button"
              className={mode === 'daily' ? 'active' : ''}
              onClick={() => setMode('daily')}
            >
              <CalendarDays size={14} /> Daily
            </button>
            <button
              type="button"
              className={mode === 'monthly' ? 'active' : ''}
              onClick={() => setMode('monthly')}
            >
              <CalendarRange size={14} /> Monthly
            </button>
          </div>
          <label className="partner-report-picker">
            {mode === 'daily' ? 'Report Date' : 'Report Month'}
            <input
              type={mode === 'daily' ? 'date' : 'month'}
              value={mode === 'daily' ? selectedDate : selectedMonth}
              onChange={event => {
                if (mode === 'daily') {
                  setSelectedDate(event.target.value);
                  return;
                }
                setSelectedMonth(event.target.value);
              }}
            />
          </label>
        </div>
      </header>

      <section className="partner-reports-stats">
        <article className="dash-card">
          <CalendarRange size={18} />
          <strong>{totals.appointments}</strong>
          <span>
            {mode === 'daily' ? 'Daily Appointments' : 'Monthly Appointments'}
          </span>
        </article>
        <article className="dash-card">
          <FileText size={18} />
          <strong>{totals.prescriptions}</strong>
          <span>
            {mode === 'daily' ? 'Daily Prescriptions' : 'Monthly Prescriptions'}
          </span>
        </article>
        <article className="dash-card">
          <Syringe size={18} />
          <strong>{totals.vaccinations}</strong>
          <span>
            {mode === 'daily' ? 'Daily Vaccinations' : 'Monthly Vaccinations'}
          </span>
        </article>
        <article className="dash-card">
          <UserCheck size={18} />
          <strong>{totals.attendance}</strong>
          <span>
            {mode === 'daily' ? 'Daily Attendance' : 'Monthly Attendance Days'}
          </span>
        </article>
      </section>

      <section className="dash-card partner-report-table-wrap">
        <h2>
          Partner-wise Activity (
          {mode === 'daily' ? selectedDate : selectedMonth})
        </h2>
        {reportRows.length === 0 ? (
          <p className="partner-report-empty">No partner doctors found.</p>
        ) : (
          <div className="partner-report-table">
            <div className="partner-report-head">
              <span>Doctor</span>
              <span>Status</span>
              <span>Appointments</span>
              <span>Completed</span>
              <span>Prescriptions</span>
              <span>Vaccinations</span>
              <span>Attendance</span>
            </div>
            {reportRows.map(row => (
              <div key={row.partner.id} className="partner-report-row">
                <span>Dr. {row.partner.name}</span>
                <span
                  className={`status-pill ${row.partner.isActive ? 'active' : 'inactive'}`}
                >
                  {row.partner.isActive ? 'Active' : 'Inactive'}
                </span>
                <span>{row.appointmentCount}</span>
                <span>{row.completedCount}</span>
                <span>{row.prescriptionCount}</span>
                <span>{row.vaccinationCount}</span>
                <span>{row.attendanceDays}</span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PartnerReports;
