'use client';

import { useEffect, useState } from 'react';
import {
  Check,
  Landmark,
  Mail,
  Pencil,
  Phone,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  UserPlus,
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useModuleStore } from '../../../store/moduleStore';
import {
  Badge,
  Button,
  Card,
  CardBody,
  DataTable,
  Modal,
  PageHeader,
  StatCard,
} from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  bio: '',
  baseSalary: '',
  commissionType: 'PERCENTAGE',
  commissionValue: '',
  isActive: true,
};

export default function StaffPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState({ type: '', text: '' });

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadStaff = async () => {
    if (!activeTenant?.id || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/staff`, { headers });
      const data = await res.json();
      setStaff(data.staff || []);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Failed to load staff list.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, [activeTenant?.id, token]);

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const startEdit = (member) => {
    setEditingId(member.id);
    setForm({
      name: member.name || '',
      email: member.email || '',
      phone: member.phone || '',
      bio: member.bio || '',
      baseSalary: Number(member.baseSalary || 0).toString(),
      commissionType: member.commissionType || 'PERCENTAGE',
      commissionValue: Number(member.commissionValue || 0).toString(),
      isActive: Boolean(member.isActive),
    });
    setMessage({ type: '', text: '' });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const payload = {
      name: form.name.trim(),
      email: form.email.trim() || undefined,
      phone: form.phone.trim() || undefined,
      bio: form.bio.trim() || undefined,
      baseSalary: form.baseSalary ? Number(form.baseSalary) : 0,
      commissionType: form.commissionType,
      commissionValue: form.commissionValue ? Number(form.commissionValue) : 0,
      isActive: form.isActive,
    };

    try {
      const res = await fetch(`${API_BASE}/api/staff${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PUT' : 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save staff details.');

      setMessage({
        type: 'success',
        text: editingId ? 'Stylist profile updated.' : 'New stylist registered.',
      });
      closeModal();
      loadStaff();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (value) => `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;

  const tableColumns = [
    { key: 'name', header: 'Name', render: (row) => <span className="font-semibold text-foreground">{row.name}</span> },
    { key: 'baseSalary', header: 'Base Salary', render: (row) => formatCurrency(row.baseSalary) },
    {
      key: 'commission',
      header: 'Commission Model',
      render: (row) => (
        <span>
          {row.commissionType === 'PERCENTAGE'
            ? `${Number(row.commissionValue)}%`
            : `${formatCurrency(row.commissionValue)} Fixed`}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <Badge variant={row.isActive ? 'success' : 'default'}>
          {row.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <Button size="sm" variant="secondary" onClick={() => startEdit(row)}>
          <Pencil className="h-3.5 w-3.5" /> Edit
        </Button>
      ),
    },
  ];

  const activeStaffCount = staff.filter((member) => member.isActive).length;
  const totalBasePayroll = staff.reduce((sum, member) => sum + (member.isActive ? Number(member.baseSalary) : 0), 0);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Stylist Directory"
          title={t('staff_settings_title')}
          description="Configure salon stylist contracts, salary scales, and commission schemes."
        >
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="secondary" size="sm" onClick={loadStaff}>
              <RefreshCw className="h-4 w-4" /> Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <UserPlus className="h-4 w-4" /> Add Stylist
            </Button>
          </div>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Total Registered Stylists" value={staff.length} icon={UserPlus} />
          <StatCard label="Active Practitioners" value={activeStaffCount} icon={Check} tone="success" />
          <StatCard label="Monthly Base Salary Outlay" value={formatCurrency(totalBasePayroll)} icon={Landmark} />
        </div>

        {message.text ? (
          <div className={`rounded-2xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-500'
              : 'border-rose-400/20 bg-rose-500/10 text-rose-500'
          }`}>
            {message.text}
          </div>
        ) : null}

        <div className="hidden md:block">
          <DataTable
            columns={tableColumns}
            rows={staff}
            emptyMessage={loading ? 'Loading stylists...' : 'No stylists registered yet.'}
          />
        </div>

        <div className="grid gap-3 md:hidden">
          {staff.map((member) => (
            <Card key={member.id} className="rounded-2xl">
              <CardBody className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-foreground">{member.name}</h3>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                      {member.phone ? <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {member.phone}</span> : null}
                      {member.email ? <span className="inline-flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {member.email}</span> : null}
                    </div>
                  </div>
                  <Badge variant={member.isActive ? 'success' : 'default'}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-white/5 p-3 text-sm">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Base</p>
                    <p className="font-semibold">{formatCurrency(member.baseSalary)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Commission</p>
                    <p className="font-semibold">
                      {member.commissionType === 'PERCENTAGE'
                        ? `${Number(member.commissionValue)}%`
                        : formatCurrency(member.commissionValue)}
                    </p>
                  </div>
                </div>

                {member.bio ? <p className="text-sm text-muted-foreground">{member.bio}</p> : null}

                <Button variant="secondary" size="sm" className="w-full" onClick={() => startEdit(member)}>
                  <Pencil className="h-3.5 w-3.5" /> Edit Stylist
                </Button>
              </CardBody>
            </Card>
          ))}
          {!loading && staff.length === 0 ? (
            <Card className="rounded-2xl border-dashed">
              <CardBody className="py-10 text-center">
                <UserPlus className="mx-auto h-8 w-8 text-primary" />
                <p className="mt-3 text-sm font-semibold">No stylists registered yet.</p>
                <Button className="mt-4" size="sm" onClick={openCreate}>Add Stylist</Button>
              </CardBody>
            </Card>
          ) : null}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingId ? 'Edit Stylist Contract' : 'Register New Stylist'}
        subtitle="Capture profile details, salary rules, and commission settings."
        topLabel="Staff Workspace"
        icon={Sparkles}
        width="acczite-modal-width-lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5 text-slate-900">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Stylist Name" className="sm:col-span-2">
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
                placeholder="E.g. Vikram Mehta"
                className="staff-modal-input"
              />
            </Field>

            <Field label="Email Address">
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
                placeholder="vikram@example.com"
                className="staff-modal-input"
              />
            </Field>

            <Field label="Phone Number">
              <input
                type="tel"
                value={form.phone}
                onChange={(event) => updateForm('phone', event.target.value)}
                placeholder="+91 98765 43210"
                className="staff-modal-input"
              />
            </Field>

            <Field label="Short Bio" className="sm:col-span-2">
              <textarea
                rows={3}
                value={form.bio}
                onChange={(event) => updateForm('bio', event.target.value)}
                placeholder="E.g. Creative director specializing in balayage."
                className="staff-modal-input resize-none"
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              <Landmark className="h-4 w-4 text-primary" /> Remuneration Rules
            </h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Base Salary">
                <input
                  type="number"
                  min="0"
                  value={form.baseSalary}
                  onChange={(event) => updateForm('baseSalary', event.target.value)}
                  placeholder="25000"
                  className="staff-modal-input"
                />
              </Field>

              <Field label="Commission Type">
                <select
                  value={form.commissionType}
                  onChange={(event) => updateForm('commissionType', event.target.value)}
                  className="staff-modal-input"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </Field>

              <Field label="Commission Value">
                <input
                  type="number"
                  min="0"
                  value={form.commissionValue}
                  onChange={(event) => updateForm('commissionValue', event.target.value)}
                  placeholder={form.commissionType === 'PERCENTAGE' ? '10' : '500'}
                  className="staff-modal-input"
                />
              </Field>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Active Status</p>
              <p className="mt-1 text-sm text-slate-500">Inactive staff cannot receive new bookings.</p>
            </div>
            <button
              type="button"
              onClick={() => updateForm('isActive', !form.isActive)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {form.isActive ? <ToggleRight className="h-6 w-6 text-emerald-500" /> : <ToggleLeft className="h-6 w-6 text-slate-400" />}
              {form.isActive ? 'Active' : 'Inactive'}
            </button>
          </div>

          {message.text && message.type === 'error' ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
              {message.text}
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="lg" onClick={closeModal} className="bg-white text-slate-900">
              Cancel
            </Button>
            <Button type="submit" size="lg" disabled={submitting || !form.name.trim()}>
              {submitting ? 'Saving...' : 'Save Stylist'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}

function Field({ label, className = '', children }) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}
