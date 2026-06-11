'use client';

import { useState, useEffect } from 'react';
import { Landmark, Trash2, Calendar, ClipboardList, Tag, HelpCircle, RefreshCw } from 'lucide-react';
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

export default function ExpensesPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState('RENT');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadExpenses = async () => {
    if (!activeTenant?.id || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/expenses`, { headers });
      const data = await res.json();
      setExpenses(data.expenses || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [activeTenant?.id, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    setSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/api/expenses`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ category, amount, date, description })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to file expense.');
      setMsg({ type: 'success', text: data.message });
      setAmount('');
      setDescription('');
      loadExpenses();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this expense record?')) return;
    try {
      const res = await fetch(`${API_BASE}/api/expenses/${id}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete expense.');
      loadExpenses();
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`;

  const tableColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => new Date(row.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    },
    {
      key: 'category',
      header: 'Category',
      render: (row) => (
        <Badge variant={
          row.category === 'SALARY' ? 'success' :
          row.category === 'RENT' ? 'gold' :
          row.category === 'ELECTRICITY' ? 'gold' : 'default'
        }>
          {row.category}
        </Badge>
      )
    },
    { key: 'amount', header: 'Amount', render: (row) => formatCurrency(row.amount) },
    { key: 'description', header: 'Description', render: (row) => row.description || '-' },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <button 
          onClick={() => handleDelete(row.id)} 
          disabled={row.category === 'SALARY'} // Salary locked via payroll runs
          className="text-stone-500 hover:text-rose-400 transition-colors disabled:opacity-30 disabled:pointer-events-none"
        >
          <Trash2 className="h-4.5 w-4.5" />
        </button>
      )
    }
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Financial Operations"
          title="Expense Ledger"
          description="Register rent, electricity, marketing outlays, products, and platform bills."
        >
          <Button variant="outline" size="sm" onClick={loadExpenses} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh Ledger
          </Button>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Record Expense Form */}
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-white/3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Landmark className="h-5 w-5 text-primary" /> Log Expense Transaction
              </h3>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
                  >
                    {['RENT', 'ELECTRICITY', 'SALARY', 'PRODUCTS', 'MARKETING', 'OTHER'].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                      Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="12000"
                      className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                      Date Filed
                    </label>
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="E.g. Electricity bill for main salon floor."
                    className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition resize-none"
                  />
                </div>

                {msg.text && (
                  <div className={`rounded-xl border p-4 text-xs ${
                    msg.type === 'success' 
                      ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' 
                      : 'border-rose-400/20 bg-rose-500/10 text-rose-300'
                  }`}>
                    {msg.text}
                  </div>
                )}

                <Button 
                  type="submit"
                  variant="primary" 
                  size="lg" 
                  disabled={submitting || !amount}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <ClipboardList className="h-4 w-4" /> Save Transaction
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Expenses Register */}
          <DataTable
            columns={tableColumns}
            rows={expenses}
            emptyMessage="No expenses filed yet."
          />
        </div>
      </div>
    </main>
  );
}
