import { useState, useEffect, useMemo } from 'react';
import {
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Minus,
} from 'lucide-react';
import './Employee.css';
import { ConfirmWithReasonModal } from '../../utility/ConfirmModal';
import { formatIstDate, getIstDateKey } from '../../../utils/istDateTime';
import type { PartnerDoctor } from '../partners/PartnerDoctors';

type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'leave';
type Employee = { id: string; name: string; role: string };
type AttendancePerson = {
  id: string;
  name: string;
  role: string;
  source: 'employee' | 'partner';
};
type AttendanceRecord = Record<string, AttendanceStatus>; // key: employeeId
type DailyAttendance = Record<string, AttendanceRecord>; // key: dateStr

const LS_EMPLOYEES = 'vc_employees';
const LS_ATTENDANCE = 'vc_attendance';
const LS_PARTNERS = 'vc_partner_doctors';

const loadEmployees = (): Employee[] => {
  try {
    return JSON.parse(localStorage.getItem(LS_EMPLOYEES) ?? '[]');
  } catch {
    return [];
  }
};

const loadAttendance = (): DailyAttendance => {
  try {
    return JSON.parse(localStorage.getItem(LS_ATTENDANCE) ?? '{}');
  } catch {
    return {};
  }
};

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

const toDateStr = (d: Date) => getIstDateKey(d);

const STATUS_OPTIONS: {
  key: AttendanceStatus;
  label: string;
  color: string;
}[] = [
  { key: 'present', label: 'P', color: '#16a34a' },
  { key: 'absent', label: 'A', color: '#ef4444' },
  { key: 'half-day', label: 'H', color: '#f59e0b' },
  { key: 'leave', label: 'L', color: '#8b5cf6' },
];

function EmployeeAttendance() {
  const today = useMemo(() => new Date(), []);
  const [currentDate, setCurrentDate] = useState(today);
  const [employees, setEmployees] = useState<Employee[]>(loadEmployees);
  const [attendance, setAttendance] = useState<DailyAttendance>(loadAttendance);
  const [newEmpName, setNewEmpName] = useState('');
  const [newEmpRole, setNewEmpRole] = useState('');
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const attendancePeople = useMemo<AttendancePerson[]>(() => {
    const employeeRows: AttendancePerson[] = employees.map(item => ({
      id: item.id,
      name: item.name,
      role: item.role,
      source: 'employee',
    }));

    const partnerRows: AttendancePerson[] = loadPartners()
      .filter(partner => partner.isActive !== false)
      .map(partner => ({
        id: `partner:${partner.id}`,
        name: `Dr. ${partner.name}`,
        role: 'Partner Doctor',
        source: 'partner',
      }));

    return [...partnerRows, ...employeeRows];
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(LS_EMPLOYEES, JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem(LS_ATTENDANCE, JSON.stringify(attendance));
  }, [attendance]);

  const dateStr = toDateStr(currentDate);
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

  const getStatus = (empId: string): AttendanceStatus | '' =>
    attendance[dateStr]?.[empId] ?? '';

  const setStatus = (empId: string, status: AttendanceStatus) => {
    setAttendance(prev => ({
      ...prev,
      [dateStr]: { ...prev[dateStr], [empId]: status },
    }));
  };

  const addEmployee = () => {
    if (!newEmpName.trim()) return;
    setEmployees(prev => [
      ...prev,
      {
        id: `emp-${Date.now()}`,
        name: newEmpName.trim(),
        role: newEmpRole.trim(),
      },
    ]);
    setNewEmpName('');
    setNewEmpRole('');
    setShowAddEmp(false);
  };

  const openRemoveEmployee = (id: string, name: string) => {
    setRemoveTarget({ id, name });
  };

  const closeRemoveModal = () => setRemoveTarget(null);

  const confirmRemoveEmployee = (_reason: string) => {
    if (!removeTarget) return;
    setEmployees(prev => prev.filter(e => e.id !== removeTarget.id));
    setRemoveTarget(null);
  };

  const markAll = (status: AttendanceStatus) => {
    const record: AttendanceRecord = {};
    attendancePeople.forEach(e => {
      record[e.id] = status;
    });
    setAttendance(prev => ({ ...prev, [dateStr]: record }));
  };

  const formatDate = (d: Date) =>
    formatIstDate(d, {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  // Summary counts
  const counts = STATUS_OPTIONS.reduce(
    (acc, s) => {
      acc[s.key] = attendancePeople.filter(
        e => getStatus(e.id) === s.key,
      ).length;
      return acc;
    },
    {} as Record<AttendanceStatus, number>,
  );

  return (
    <div className="employee-page">
      <h1 className="dash-page-title">
        <Users size={22} /> Employee Attendance
      </h1>

      {/* Date navigation */}
      <div className="emp-date-nav dash-card">
        <button type="button" className="emp-nav-btn" onClick={prevDay}>
          <ChevronLeft size={18} />
        </button>
        <span className="emp-date-label">{formatDate(currentDate)}</span>
        <button type="button" className="emp-nav-btn" onClick={nextDay}>
          <ChevronRight size={18} />
        </button>
        <button
          type="button"
          className="btn-today-emp"
          onClick={() => setCurrentDate(today)}
          disabled={toDateStr(currentDate) === toDateStr(today)}
        >
          Today
        </button>
      </div>

      {attendancePeople.length > 0 && (
        <div className="emp-summary-bar dash-card">
          <span className="emp-summary-label">Summary:</span>
          {STATUS_OPTIONS.map(s => (
            <span
              key={s.key}
              className="emp-summary-chip"
              style={{ '--chip-c': s.color } as React.CSSProperties}
            >
              {s.label}: {counts[s.key]}
            </span>
          ))}
          <div className="emp-mark-all">
            <span className="emp-mark-all-label">Mark all:</span>
            {STATUS_OPTIONS.map(s => (
              <button
                key={s.key}
                type="button"
                className="mark-all-btn"
                style={{ '--chip-c': s.color } as React.CSSProperties}
                onClick={() => markAll(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Attendance table */}
      <div className="dash-card">
        <div className="emp-table-header">
          <h3>Attendance — {dateStr}</h3>
          <button
            type="button"
            className="btn-add-emp"
            onClick={() => setShowAddEmp(v => !v)}
          >
            + Add Employee
          </button>
        </div>
        <p className="emp-admin-note">
          Staff removal is a clinic admin action and requires confirmation.
        </p>

        {showAddEmp && (
          <div className="add-emp-inline">
            <input
              value={newEmpName}
              onChange={e => setNewEmpName(e.target.value)}
              placeholder="Employee name *"
              className="emp-input"
              onKeyDown={e => e.key === 'Enter' && addEmployee()}
            />
            <input
              value={newEmpRole}
              onChange={e => setNewEmpRole(e.target.value)}
              placeholder="Role (e.g. Nurse, Asst.)"
              className="emp-input"
            />
            <button
              type="button"
              className="btn-emp-save"
              onClick={addEmployee}
              disabled={!newEmpName.trim()}
            >
              <Check size={14} /> Add
            </button>
            <button
              type="button"
              className="btn-emp-cancel"
              onClick={() => setShowAddEmp(false)}
            >
              <X size={14} />
            </button>
          </div>
        )}

        {attendancePeople.length === 0 ? (
          <p className="emp-empty">
            No staff found yet. Add employees, or add partner doctors from
            Partner Doctors section.
          </p>
        ) : (
          <div className="emp-att-list">
            {attendancePeople.map(emp => {
              const status = getStatus(emp.id);
              return (
                <div
                  key={emp.id}
                  className={`emp-att-row status-${status || 'none'}`}
                >
                  <div className="emp-info">
                    <div className="emp-avatar">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="emp-name-row">
                        <span className="emp-name">{emp.name}</span>
                        {emp.source === 'partner' && (
                          <span className="emp-source-badge">Partner</span>
                        )}
                      </div>
                      {emp.role && <span className="emp-role">{emp.role}</span>}
                    </div>
                  </div>
                  <div className="att-status-buttons">
                    {STATUS_OPTIONS.map(s => (
                      <button
                        key={s.key}
                        type="button"
                        className={`att-btn${status === s.key ? ' active' : ''}`}
                        style={{ '--btn-c': s.color } as React.CSSProperties}
                        title={s.key}
                        onClick={() => setStatus(emp.id, s.key)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {emp.source === 'employee' ? (
                    <button
                      type="button"
                      className="emp-remove-btn"
                      onClick={() => openRemoveEmployee(emp.id, emp.name)}
                      title="Remove employee"
                    >
                      <Minus size={12} />
                    </button>
                  ) : (
                    <span
                      className="emp-remove-placeholder"
                      aria-hidden="true"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="att-legend">
        {STATUS_OPTIONS.map(s => (
          <span key={s.key} className="att-legend-item">
            <span className="att-legend-dot" style={{ background: s.color }} />
            {s.key.replace('-', ' ')} ({s.label})
          </span>
        ))}
      </div>

      <ConfirmWithReasonModal
        open={removeTarget !== null}
        title="Remove Employee"
        message={`You are removing ${removeTarget?.name ?? ''} from the clinic staff list. Please provide a reason.`}
        reasonPlaceholder="e.g. Left the clinic / role discontinued"
        confirmLabel="Remove Employee"
        onConfirm={confirmRemoveEmployee}
        onCancel={closeRemoveModal}
      />
    </div>
  );
}

export default EmployeeAttendance;
