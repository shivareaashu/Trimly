'use client';

import { useEffect, useState } from 'react';
import { CalendarPlus, MessageCircle, Phone, RefreshCw, Search, Send } from 'lucide-react';
import { useModuleStore } from '../../../store/moduleStore';
import { Badge, Button, Card, CardBody, DataTable, PageHeader, StatCard } from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function RevisitCenterPage() {
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);
  const [range, setRange] = useState('7');
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadCustomers = async () => {
    if (!activeTenant?.id || !token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/customers/revisit/due?range=${range}`, { headers });
      const data = await res.json();
      setCustomers(data.customers || []);
    } finally {
      setLoading(false);
    }
  };

  const refreshLifecycle = async () => {
    await fetch(`${API_BASE}/api/customers/lifecycle/refresh`, { method: 'POST', headers });
    loadCustomers();
  };

  useEffect(() => {
    loadCustomers();
  }, [activeTenant?.id, token, range]);

  const statusVariant = (status) => status === 'INACTIVE' ? 'danger' : status === 'ACTIVE' ? 'success' : 'gold';
  const statusLabel = (status) => ({ ACTIVE: 'Active', DUE_SOON: 'Due Soon', AT_RISK: 'At Risk', INACTIVE: 'Inactive' }[status] || status);

  const columns = [
    { key: 'name', header: 'Customer', render: (row) => <span className="font-semibold">{row.firstName} {row.lastName}</span> },
    { key: 'lastVisit', header: 'Last Visit', render: (row) => row.daysSinceLastVisit === null ? '-' : `${row.daysSinceLastVisit} days ago` },
    { key: 'expected', header: 'Expected', render: (row) => `${row.expectedRevisitDays || 30} days` },
    { key: 'service', header: 'Recommended', render: (row) => row.recommendedService?.name || 'Next service' },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={statusVariant(row.lifecycleStatus)}>{statusLabel(row.lifecycleStatus)}</Badge> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</Button>
          <Button size="sm" variant="secondary"><Send className="h-3.5 w-3.5" /> SMS</Button>
          <Button size="sm" variant="secondary"><Phone className="h-3.5 w-3.5" /> Call</Button>
          <Button size="sm"><CalendarPlus className="h-3.5 w-3.5" /> Book</Button>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Customer Lifecycle"
          title="Revisit Center"
          description="Find customers due for their next salon visit and start follow-up actions from CRM."
        >
          <Button variant="secondary" size="sm" onClick={refreshLifecycle}><RefreshCw className="h-4 w-4" /> Refresh</Button>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Due Customers" value={customers.length} icon={Search} />
          <StatCard label="Inactive" value={customers.filter((c) => c.lifecycleStatus === 'INACTIVE').length} icon={Phone} tone="danger" />
          <StatCard label="At Risk" value={customers.filter((c) => c.lifecycleStatus === 'AT_RISK').length} icon={Send} />
          <StatCard label="Due Soon" value={customers.filter((c) => c.lifecycleStatus === 'DUE_SOON').length} icon={CalendarPlus} tone="success" />
        </div>

        <Card>
          <CardBody className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {[
                ['0', 'Today'],
                ['7', '7 Days'],
                ['15', '15 Days'],
                ['30', '30 Days'],
                ['inactive', 'Inactive'],
              ].map(([value, label]) => (
                <Button key={value} size="sm" variant={range === value ? 'primary' : 'secondary'} onClick={() => setRange(value)}>
                  {label}
                </Button>
              ))}
            </div>
            <DataTable columns={columns} rows={customers} loading={loading} emptyMessage="No customers are due for this revisit window." />
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
