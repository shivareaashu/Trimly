'use client';

import { useState, useEffect } from 'react';
import { Clock, UserCheck, Timer, CheckCircle, RefreshCw, UserMinus } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useModuleStore } from '../../../store/moduleStore';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  PageHeader,
  Button,
} from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function AttendancePage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  const [attendance, setAttendance] = useState([]);
  const [staff, setStaff] = useState([]);
  const [myStaff, setMyStaff] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Manual Logger State
  const [manualStatus, setManualStatus] = useState('LEAVE');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualNotes, setManualNotes] = useState('');


  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const selectedStaffProfile = staff.find((item) => item.id === selectedStaff);
  const selectedAttendance = selectedStaff
    ? attendance.filter((item) => item.staffId === selectedStaff)
    : attendance;
  const isOwnStaffProfile = Boolean(myStaff?.id && selectedStaff === myStaff.id);

  const loadData = async () => {
    if (!activeTenant?.id || !token) return;
    try {
      setLoading(true);
      const [attRes, staffRes, selfRes] = await Promise.all([
        fetch(`${API_BASE}/api/attendance`, { headers }),
        fetch(`${API_BASE}/api/staff?isActive=true`, { headers }),
        fetch(`${API_BASE}/api/attendance/self/profile`, { headers }),
      ]);

      const attData = await attRes.json();
      const staffData = await staffRes.json();
      const selfData = selfRes.ok ? await selfRes.json() : null;

      setAttendance(attData.attendance || []);
      setStaff(staffData.staff || [
        { id: 'st-1', name: 'Priya Sharma' },
        { id: 'st-2', name: 'Sara Sen' },
        { id: 'st-3', name: 'Karan Malhotra' },
        { id: 'st-4', name: 'Vikram Mehta' }
      ]);
      if (selfData?.staff) {
        setMyStaff(selfData.staff);
        setSelectedStaff((current) => current || selfData.staff.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTenant?.id, token]);

  const handleClockIn = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const endpoint = isOwnStaffProfile
        ? `${API_BASE}/api/attendance/self/clock-in`
        : `${API_BASE}/api/attendance/clock-in`;
      const payload = isOwnStaffProfile
        ? { checkIn: new Date() }
        : { staffId: selectedStaff, checkIn: new Date() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clock in.');
      setMessage({ type: 'success', text: data.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClockOut = async () => {
    if (!selectedStaff) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const endpoint = isOwnStaffProfile
        ? `${API_BASE}/api/attendance/self/clock-out`
        : `${API_BASE}/api/attendance/clock-out`;
      const payload = isOwnStaffProfile
        ? { checkOut: new Date() }
        : { staffId: selectedStaff, checkOut: new Date() };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to clock out.');
      setMessage({ type: 'success', text: data.message });
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordAttendance = async () => {
    if (!selectedStaff || !manualStatus) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/api/attendance/record`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          staffId: selectedStaff,
          date: manualDate,
          status: manualStatus,
          notes: manualNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record attendance.');
      setMessage({ type: 'success', text: data.message });
      setManualNotes('');
      loadData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const tableColumns = [

    {
      key: 'date',
      header: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    },
    { key: 'staff', header: 'Stylist', render: (row) => row.staff?.name || 'Unknown' },
    {
      key: 'checkIn',
      header: 'Check In',
      render: (row) => row.checkIn ? new Date(row.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
    },
    {
      key: 'checkOut',
      header: 'Check Out',
      render: (row) => row.checkOut ? new Date(row.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'
    },
    { key: 'workingHours', header: 'Hours Worked', render: (row) => row.workingHours ? `${row.workingHours} hrs` : '-' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={
          row.status === 'PRESENT' ? 'success' :
          row.status === 'LATE' ? 'gold' :
          row.status === 'HALF_DAY' ? 'gold' :
          row.status === 'LEAVE' ? 'default' :
          'danger'
        }>
          {row.status}
        </Badge>
      )
    }
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow={t('nav_staff')}
          title={t('daily_shift_registry')}
          description="Staff can mark their own attendance, while admins can review staff logs and maintain manual shift records."
        >
          <Button variant="outline" size="sm" onClick={loadData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Sync Registry
          </Button>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6">
            {/* Shift Console */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-white/3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" /> {t('shift_logger_console')}
                </h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                    {t('select_stylist')}
                  </label>
                  <select
                    value={selectedStaff}
                    onChange={(e) => setSelectedStaff(e.target.value)}
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
                  >
                    <option value="">-- Choose Staff Member --</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {myStaff ? (
                    <button
                      type="button"
                      onClick={() => setSelectedStaff(myStaff.id)}
                      className="mt-2 text-xs font-semibold text-primary transition hover:text-primary/80"
                    >
                      Use my staff profile: {myStaff.name}
                    </button>
                  ) : null}
                </div>

                {selectedStaffProfile ? (
                  <div className="rounded-2xl border border-border bg-background/40 p-4 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">{selectedStaffProfile.name}</p>
                    <p>{selectedStaffProfile.email || 'No email on file'}</p>
                    <p className="mt-2">
                      {isOwnStaffProfile
                        ? 'You are marking your own attendance.'
                        : 'Admin mode: marking attendance for selected staff.'}
                    </p>
                  </div>
                ) : null}

                {message.text && (
                  <div className={`rounded-xl border p-4 text-xs ${
                    message.type === 'success' 
                      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' 
                      : 'border-rose-400/20 bg-rose-500/10 text-rose-300'
                  }`}>
                    {message.text}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    onClick={handleClockIn} 
                    disabled={!selectedStaff || submitting}
                    className="flex items-center justify-center gap-2"
                  >
                    <UserCheck className="h-4 w-4" /> {t('clock_in')}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleClockOut} 
                    disabled={!selectedStaff || submitting}
                    className="flex items-center justify-center gap-2 border-border text-foreground hover:bg-white/5"
                  >
                    <UserMinus className="h-4 w-4" /> {t('clock_out')}
                  </Button>
                </div>

                <div className="bg-background/40 border border-border rounded-2xl p-4 flex gap-4 items-start">
                  <Timer className="h-6 w-6 text-primary flex-shrink-0" />
                  <div className="space-y-1 text-xs text-muted-foreground leading-relaxed">
                    <p className="font-semibold text-foreground">Standard Office Guidelines:</p>
                    <p>• Clock-ins after 09:30 AM are flagged as <strong>LATE</strong>.</p>
                    <p>• Total logged hours below 4.00 will flag as a <strong>HALF DAY</strong>.</p>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Manual Shift Recorder */}
            <Card className="overflow-hidden">
              <CardHeader className="border-b border-border/60 bg-white/3">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-primary" /> {t('manual_shift_recorder')}
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                    {t('shift_date')}
                  </label>
                  <input
                    type="date"
                    value={manualDate}
                    onChange={(e) => setManualDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                    {t('attendance_status')}
                  </label>
                  <select
                    value={manualStatus}
                    onChange={(e) => setManualStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
                  >
                    <option value="PRESENT">PRESENT</option>
                    <option value="ABSENT">ABSENT</option>
                    <option value="HALF_DAY">HALF DAY</option>
                    <option value="LEAVE">LEAVE</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                    Notes / Remarks
                  </label>
                  <textarea
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    placeholder="Enter reason for leave, manual check-in details, etc."
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition min-h-[80px]"
                  />
                </div>

                <Button 
                  variant="primary" 
                  size="lg" 
                  onClick={handleRecordAttendance} 
                  disabled={!selectedStaff || submitting}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" /> {t('save_shift_record')}
                </Button>
              </CardBody>
            </Card>
          </div>

          {/* Registry Table */}
          <DataTable
            columns={tableColumns}
            rows={selectedAttendance}
            emptyMessage={selectedStaff ? 'No attendance logs found for selected staff.' : 'No attendance logs found.'}
          />
        </div>
      </div>
    </main>
  );
}
