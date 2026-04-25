import { useMemo } from 'react';
import { CalendarCheck2, CalendarX2, Clock3, UserCheck } from 'lucide-react';
import './PartnerAttendance.css';

type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';
type AttendanceStore = Record<string, Record<string, AttendanceStatus>>;

const LS_ATTENDANCE = 'vc_attendance';

const loadAttendance = (key: string): AttendanceStore => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '{}');
  } catch {
    return {};
  }
};

function PartnerAttendance() {
  const partnerId = window.location.pathname.split('/')[2] ?? '';
  const records = useMemo(
    () => loadAttendance(`p_${partnerId}_${LS_ATTENDANCE}`),
    [partnerId],
  );

  const rows = useMemo(
    () =>
      Object.entries(records)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 60),
    [records],
  );

  const totals = useMemo(() => {
    let present = 0;
    let absent = 0;
    let halfDay = 0;
    let leave = 0;

    rows.forEach(([, entry]) => {
      const values = Object.values(entry);
      if (values.includes('present')) present += 1;
      if (values.includes('absent')) absent += 1;
      if (values.includes('half-day')) halfDay += 1;
      if (values.includes('leave')) leave += 1;
    });

    return { present, absent, halfDay, leave };
  }, [rows]);

  return (
    <div className="partner-attendance-page">
      <header className="partner-attendance-hero dash-card">
        <h1 className="dash-page-title">
          <UserCheck size={22} /> Attendance Monitoring
        </h1>
        <p>
          The clinic owner can review partner doctor attendance here based on
          the partner's recorded activity schedule.
        </p>
      </header>

      <section className="partner-attendance-stats">
        <article className="dash-card">
          <CalendarCheck2 size={18} />
          <strong>{totals.present}</strong>
          <span>Present Days</span>
        </article>
        <article className="dash-card">
          <CalendarX2 size={18} />
          <strong>{totals.absent}</strong>
          <span>Absent Days</span>
        </article>
        <article className="dash-card">
          <Clock3 size={18} />
          <strong>{totals.halfDay}</strong>
          <span>Half Days</span>
        </article>
        <article className="dash-card">
          <Clock3 size={18} />
          <strong>{totals.leave}</strong>
          <span>Leave Days</span>
        </article>
      </section>

      <section className="dash-card partner-attendance-table-wrap">
        <h2>Recent Attendance Log</h2>
        {rows.length === 0 ? (
          <p className="partner-attendance-empty">
            No attendance has been recorded yet.
          </p>
        ) : (
          <div className="partner-attendance-table">
            <div className="partner-attendance-head">
              <span>Date</span>
              <span>Morning</span>
              <span>Noon</span>
              <span>Evening</span>
            </div>
            {rows.map(([date, entry]) => (
              <div key={date} className="partner-attendance-row">
                <span>{date}</span>
                <span className={`status ${entry.morning ?? 'empty'}`}>
                  {entry.morning ?? '—'}
                </span>
                <span className={`status ${entry.noon ?? 'empty'}`}>
                  {entry.noon ?? '—'}
                </span>
                <span className={`status ${entry.evening ?? 'empty'}`}>
                  {entry.evening ?? '—'}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default PartnerAttendance;
