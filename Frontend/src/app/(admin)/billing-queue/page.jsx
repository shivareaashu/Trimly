'use client';

import { useEffect, useState } from 'react';
import { CreditCard, IndianRupee, Link as LinkIcon, ReceiptText, Wallet } from 'lucide-react';
import { useModuleStore } from '../../../store/moduleStore';
import { Badge, Button, Card, CardBody, DataTable, PageHeader, StatCard } from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function BillingQueuePage() {
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);
  const [queue, setQueue] = useState([]);

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadQueue = async () => {
    if (!activeTenant?.id || !token) return;
    const res = await fetch(`${API_BASE}/api/bookings?status=COMPLETED,BILLED`, { headers });
    const data = await res.json();
    setQueue(data.bookings || []);
  };

  useEffect(() => {
    loadQueue();
  }, [activeTenant?.id, token]);

  const action = async (id, name, extra = {}) => {
    await fetch(`${API_BASE}/api/bookings/${id}/action`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: name, ...extra }),
    });
    loadQueue();
  };

  const total = queue.reduce((sum, item) => sum + Number(item.totalAmount || item.service?.price || 0), 0);
  const columns = [
    { key: 'customer', header: 'Customer', render: (row) => `${row.customer?.firstName || ''} ${row.customer?.lastName || ''}`.trim() },
    { key: 'services', header: 'Services', render: (row) => (row.serviceItems || [{ name: row.service?.name }]).map((item) => item.name).join(', ') },
    { key: 'amount', header: 'Amount', render: (row) => `Rs. ${Number(row.totalAmount || row.service?.price || 0).toLocaleString('en-IN')}` },
    { key: 'status', header: 'Status', render: (row) => <Badge variant={row.status === 'BILLED' ? 'gold' : 'success'}>{row.status}</Badge> },
    {
      key: 'actions',
      header: 'Collect',
      render: (row) => (
        <div className="flex flex-wrap gap-2">
          {row.status === 'COMPLETED' ? <Button size="sm" variant="secondary" onClick={() => action(row.id, 'bill')}><ReceiptText className="h-3.5 w-3.5" /> Bill</Button> : null}
          <Button size="sm" onClick={() => action(row.id, 'mark-paid', { paymentMethod: 'CASH' })}><Wallet className="h-3.5 w-3.5" /> Cash</Button>
          <Button size="sm" variant="secondary" onClick={() => action(row.id, 'mark-paid', { paymentMethod: 'UPI' })}><IndianRupee className="h-3.5 w-3.5" /> UPI</Button>
          <Button size="sm" variant="secondary" onClick={() => action(row.id, 'mark-paid', { paymentMethod: 'CARD' })}><CreditCard className="h-3.5 w-3.5" /> Card</Button>
          <Button size="sm" variant="secondary"><LinkIcon className="h-3.5 w-3.5" /> Cashfree</Button>
        </div>
      ),
    },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader eyebrow="Reception Billing" title="Billing Queue" description="Completed services waiting for bill generation and payment collection." />
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard label="Waiting Bills" value={queue.length} icon={ReceiptText} />
          <StatCard label="Queue Value" value={`Rs. ${total.toLocaleString('en-IN')}`} icon={Wallet} tone="success" />
          <StatCard label="Cashfree Links" value="Ready" icon={LinkIcon} />
        </div>
        <Card><CardBody><DataTable columns={columns} rows={queue} emptyMessage="No completed services are waiting for billing." /></CardBody></Card>
      </div>
    </main>
  );
}
