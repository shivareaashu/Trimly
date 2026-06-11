'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle, Play, Plus, RefreshCw, RotateCcw, Timer } from 'lucide-react';
import { useModuleStore } from '../../../store/moduleStore';
import { Badge, Button, Card, CardBody, PageHeader, StatCard } from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function elapsed(startedAt) {
  if (!startedAt) return '00:00:00';
  const total = Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000));
  const hours = String(Math.floor(total / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const seconds = String(total % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export default function MyQueuePage() {
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);
  const [queue, setQueue] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState({});
  const [, tick] = useState(0);

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  }), [token, activeTenant?.id]);

  const load = async () => {
    if (!activeTenant?.id || !token) return;
    const [bookingRes, serviceRes] = await Promise.all([
      fetch(`${API_BASE}/api/bookings?status=BOOKED,CHECKED_IN,ASSIGNED,CONSULTATION,IN_SERVICE`, { headers }),
      fetch(`${API_BASE}/api/services?isActive=true`, { headers }),
    ]);
    if (bookingRes.ok) setQueue((await bookingRes.json()).bookings || []);
    if (serviceRes.ok) setServices((await serviceRes.json()).services || []);
  };

  useEffect(() => {
    load();
  }, [activeTenant?.id, token]);

  useEffect(() => {
    const timer = setInterval(() => tick((value) => value + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const action = async (id, name, extra = {}) => {
    await fetch(`${API_BASE}/api/bookings/${id}/action`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: name, ...extra }),
    });
    load();
  };

  const addService = async (id) => {
    const serviceId = selectedService[id];
    if (!serviceId) return;
    await fetch(`${API_BASE}/api/bookings/${id}/add-service`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ serviceId }),
    });
    setSelectedService({ ...selectedService, [id]: '' });
    load();
  };

  const current = queue.find((item) => item.status === 'IN_SERVICE');

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader eyebrow="Staff Workspace" title="My Queue" description="Accept assignments, run consultation, add services, track timers, and complete work." >
          <Button variant="secondary" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Queue" value={queue.length} icon={Timer} />
          <StatCard label="Current Timer" value={current ? elapsed(current.serviceStartedAt) : '00:00:00'} icon={Play} tone="success" />
          <StatCard label="Completed Next" value={queue.filter((item) => item.status === 'COMPLETED').length} icon={CheckCircle} />
        </div>

        <div className="grid gap-4">
          {queue.map((item) => {
            const items = item.serviceItems || [{ name: item.service?.name, price: item.service?.price }];
            return (
              <Card key={item.id}>
                <CardBody className="space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-bold">{item.customer?.firstName} {item.customer?.lastName}</p>
                      <p className="text-sm text-muted-foreground">{items.map((svc) => svc.name).join(' + ')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.status === 'IN_SERVICE' ? 'success' : 'gold'}>{item.status}</Badge>
                      {item.serviceStartedAt ? <span className="font-mono text-sm text-primary">{elapsed(item.serviceStartedAt)}</span> : null}
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-zinc-900/50 p-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-bold uppercase tracking-[0.25em] text-muted-foreground">
                      <span>Dynamic Bill</span>
                      <span>Rs. {Number(item.totalAmount || item.service?.price || 0).toLocaleString('en-IN')}</span>
                    </div>
                    {items.map((svc, index) => (
                      <div key={`${svc.serviceId}-${index}`} className="flex justify-between border-t border-border/50 py-2 text-sm">
                        <span>{svc.name}</span>
                        <span>Rs. {Number(svc.price || 0).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="secondary" onClick={() => action(item.id, 'accept')}><CheckCircle className="h-3.5 w-3.5" /> Accept</Button>
                    <Button size="sm" variant="secondary" onClick={() => action(item.id, 'request-reassignment')}><RotateCcw className="h-3.5 w-3.5" /> Reassign</Button>
                    <Button size="sm" onClick={() => action(item.id, 'start')}><Play className="h-3.5 w-3.5" /> Start</Button>
                    <Button size="sm" variant="secondary" onClick={() => action(item.id, 'complete')}><CheckCircle className="h-3.5 w-3.5" /> Complete</Button>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select className="h-10 flex-1 rounded-xl border border-border bg-zinc-900 px-3 text-sm outline-none" value={selectedService[item.id] || ''} onChange={(e) => setSelectedService({ ...selectedService, [item.id]: e.target.value })}>
                      <option value="">Add service from consultation</option>
                      {services.map((service) => <option key={service.id} value={service.id}>{service.name} - Rs. {Number(service.price).toLocaleString('en-IN')}</option>)}
                    </select>
                    <Button size="sm" variant="secondary" onClick={() => addService(item.id)}><Plus className="h-3.5 w-3.5" /> Add Service</Button>
                  </div>
                </CardBody>
              </Card>
            );
          })}
          {queue.length === 0 ? (
            <Card className="shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
              <CardBody className="py-12 text-center text-sm text-muted-foreground">No active assignments in your queue.</CardBody>
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  );
}
