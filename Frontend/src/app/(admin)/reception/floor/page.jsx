'use client';

import { useState, useEffect } from 'react';
import { 
  Users, CheckCircle, Clock, Play, CheckSquare, ShieldCheck, 
  RefreshCw, Timer, Scissors, ArrowRight, UserCheck, AlertCircle, ShoppingBag
} from 'lucide-react';
import { useModuleStore } from '@/store/moduleStore';
import { Badge, Button, Card, CardBody, PageHeader, Modal, Input } from '@/components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function LiveFloorPage() {
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  // States
  const [appointments, setAppointments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // POS Checkout Modal State
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [posSubmitting, setPosSubmitting] = useState(false);

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadData = async () => {
    if (!activeTenant?.id || !token) return;
    try {
      setLoading(true);
      setError('');
      const [appRes, staffRes] = await Promise.all([
        fetch(`${API_BASE}/api/bookings`, { headers }),
        fetch(`${API_BASE}/api/bookings/staff`, { headers }),
      ]);

      if (appRes.ok) {
        const appData = await appRes.json();
        setAppointments(appData.bookings || []);
      }
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaff(staffData.staff || []);
      }
    } catch (err) {
      console.error('Error loading live floor data:', err);
      setError('Failed to fetch salon floor details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [activeTenant?.id, token]);

  const handleAction = async (bookingId, action, payload = {}) => {
    try {
      setError('');
      setMessage('');
      const res = await fetch(`${API_BASE}/api/bookings/${bookingId}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action, ...payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to transition state.`);
      setMessage(`Successfully moved booking status!`);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handlePOSCheckoutSubmit = async (e) => {
    e.preventDefault();
    if (!checkoutBooking) return;
    setPosSubmitting(true);
    setError('');
    setMessage('');
    try {
      // 1. Create POS order and pay it
      const payRes = await fetch(`${API_BASE}/api/bookings/${checkoutBooking.id}/action`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ action: 'mark-paid', paymentMethod })
      });
      const payData = await payRes.json();
      if (!payRes.ok) throw new Error(payData.error || 'POS settlement failed.');

      setMessage(`Checkout complete for Ref: ${checkoutBooking.bookingReference}!`);
      setCheckoutBooking(null);
      loadData();
    } catch (err) {
      setError(err.message);
    } finally {
      setPosSubmitting(false);
    }
  };

  // Helper to compute elapsed service timer
  const getElapsedTimer = (startTime, duration) => {
    const elapsedMs = Date.now() - new Date(startTime).getTime();
    const elapsedMins = Math.floor(elapsedMs / 60000);
    const remaining = duration - elapsedMins;
    return {
      elapsedMins,
      remaining,
      percent: Math.min(100, Math.max(0, (elapsedMins / duration) * 100))
    };
  };

  // Columns segmentation
  const waitingQueue = appointments.filter(a => ['CHECKED_IN', 'CONFIRMED'].includes(a.status));
  const activeChairs = appointments.filter(a => ['ASSIGNED', 'CONSULTATION', 'IN_SERVICE'].includes(a.status));
  const checkoutQueue = appointments.filter(a => ['COMPLETED', 'BILLED'].includes(a.status));

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Reception Cockpit"
          title="Live Salon Floor"
          description="Real-time control panel to track check-ins, stylist chairs, running services, and cash registers."
        >
          <Button variant="outline" size="sm" onClick={loadData} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Sync Floor
          </Button>
        </PageHeader>

        {message && (
          <div className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-4 text-xs text-emerald-300">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-xs text-rose-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            
            {/* COLUMN 1: WAITING QUEUE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-amber-400" />
                  <h3 className="font-bold text-white">Checked-In Waiting</h3>
                </div>
                <Badge variant="gold">{waitingQueue.length} Clients</Badge>
              </div>

              <div className="space-y-3">
                {waitingQueue.map(booking => (
                  <Card key={booking.id} className="border-border/60 bg-gradient-to-b from-card to-zinc-950/40 hover:border-primary/30 transition">
                    <CardBody className="p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-stone-200">
                            {booking.customer?.firstName} {booking.customer?.lastName}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">{booking.service?.name}</p>
                        </div>
                        <Badge variant="default" className="text-[9px]">
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-stone-400 bg-zinc-900/40 p-2 rounded-lg">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" /> Check-in: {new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="font-semibold text-primary">₹{Number(booking.service?.price).toLocaleString('en-IN')}</span>
                      </div>

                      <div className="pt-1 flex gap-2">
                        <select 
                          className="flex-1 bg-zinc-900 border border-border/60 rounded-xl px-3 py-1.5 text-xs text-stone-300 outline-none"
                          onChange={(e) => handleAction(booking.id, 'assign', { staffId: e.target.value })}
                          defaultValue=""
                        >
                          <option value="" disabled>Assign Stylist...</option>
                          {staff.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          className="text-[10px] uppercase font-bold py-1.5"
                          onClick={() => handleAction(booking.id, 'accept')}
                        >
                          Start Consultation <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}

                {waitingQueue.length === 0 && (
                  <p className="border border-dashed border-border/40 p-10 text-center text-xs text-muted-foreground italic rounded-2xl">
                    Waiting room is empty.
                  </p>
                )}
              </div>
            </div>

            {/* COLUMN 2: ACTIVE CHAIRS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-violet-400" />
                  <h3 className="font-bold text-white">Active Chairs (Styling)</h3>
                </div>
                <Badge variant="success">{activeChairs.length} Styling</Badge>
              </div>

              <div className="space-y-3">
                {activeChairs.map(booking => {
                  const timer = getElapsedTimer(booking.startTime, booking.service?.duration || 30);
                  
                  return (
                    <Card key={booking.id} className="border-violet-500/20 bg-gradient-to-b from-card to-zinc-950/40 hover:border-violet-500/40 transition">
                      <CardBody className="p-4 space-y-3.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-stone-200">
                              {booking.customer?.firstName} {booking.customer?.lastName}
                            </p>
                            <p className="text-[11px] text-violet-300 mt-0.5">Stylist: {booking.staff?.name || 'Unassigned'}</p>
                          </div>
                          <Badge variant="gold" className="text-[9px]">
                            {booking.status}
                          </Badge>
                        </div>

                        {/* Progress Bar & Timer */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-stone-400">
                            <span className="flex items-center gap-1 font-mono">
                              <Timer className="h-3 w-3 animate-pulse" /> {timer.elapsedMins}m elapsed
                            </span>
                            <span>{timer.remaining > 0 ? `${timer.remaining}m left` : 'Overtime'}</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-500 ${timer.remaining <= 0 ? 'bg-rose-500 animate-pulse' : 'bg-violet-500'}`}
                              style={{ width: `${timer.percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="text-[11px] text-stone-400 bg-zinc-900/40 p-2 rounded-lg flex justify-between items-center">
                          <span>{booking.service?.name}</span>
                          <span className="font-semibold text-white">₹{Number(booking.service?.price).toLocaleString('en-IN')}</span>
                        </div>

                        <div className="pt-1 flex gap-2">
                          {booking.status === 'ASSIGNED' && (
                            <Button 
                              variant="outline" 
                              className="w-full text-[10px] uppercase font-bold py-1.5"
                              onClick={() => handleAction(booking.id, 'accept')}
                            >
                              Accept Consultation
                            </Button>
                          )}
                          {booking.status === 'CONSULTATION' && (
                            <Button 
                              variant="primary" 
                              className="w-full text-[10px] uppercase font-bold py-1.5"
                              onClick={() => handleAction(booking.id, 'start')}
                            >
                              Start Service
                            </Button>
                          )}
                          {booking.status === 'IN_SERVICE' && (
                            <Button 
                              variant="success" 
                              className="w-full text-[10px] uppercase font-bold py-1.5 bg-emerald-600 hover:bg-emerald-500 border-none"
                              onClick={() => handleAction(booking.id, 'complete')}
                            >
                              <CheckSquare className="mr-1 h-3.5 w-3.5" /> Service Completed
                            </Button>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  );
                })}

                {activeChairs.length === 0 && (
                  <p className="border border-dashed border-border/40 p-10 text-center text-xs text-muted-foreground italic rounded-2xl">
                    No active styling sessions.
                  </p>
                )}
              </div>
            </div>

            {/* COLUMN 3: BILLING & CHECKOUT QUEUE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-400" />
                  <h3 className="font-bold text-white">POS Checkout Queue</h3>
                </div>
                <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                  {checkoutQueue.length} Pending Checkout
                </Badge>
              </div>

              <div className="space-y-3">
                {checkoutQueue.map(booking => (
                  <Card key={booking.id} className="border-emerald-500/20 bg-gradient-to-b from-card to-zinc-950/40 hover:border-emerald-500/40 transition">
                    <CardBody className="p-4 space-y-3.5">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-stone-200">
                            {booking.customer?.firstName} {booking.customer?.lastName}
                          </p>
                          <p className="text-[11px] text-emerald-300 mt-0.5">Stylist: {booking.staff?.name}</p>
                        </div>
                        <Badge variant="success" className="text-[9px]">
                          {booking.status}
                        </Badge>
                      </div>

                      <div className="text-[11px] text-stone-400 bg-zinc-900/40 p-2.5 rounded-lg space-y-1">
                        <div className="flex justify-between">
                          <span>{booking.service?.name}</span>
                          <span className="font-semibold text-white">₹{Number(booking.service?.price).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t border-border/40 pt-1 flex justify-between font-bold text-emerald-400">
                          <span>Total Invoice Amount</span>
                          <span>₹{Number(booking.totalAmount || booking.service?.price).toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="pt-1 flex gap-2">
                        <Button 
                          variant="primary" 
                          className="w-full text-[10px] uppercase font-bold py-2 bg-emerald-500 hover:bg-emerald-400 border border-emerald-500/20"
                          onClick={() => setCheckoutBooking(booking)}
                        >
                          <ShoppingBag className="mr-1 h-3.5 w-3.5" /> Finalize POS Checkout
                        </Button>
                      </div>
                    </CardBody>
                  </Card>
                ))}

                {checkoutQueue.length === 0 && (
                  <p className="border border-dashed border-border/40 p-10 text-center text-xs text-muted-foreground italic rounded-2xl">
                    Billing queue is clear.
                  </p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* POS Checkout Dialog */}
      <Modal
        open={!!checkoutBooking}
        onClose={() => setCheckoutBooking(null)}
        title="POS Ledger - Process Payment"
        subtitle={`Process final invoice payment for Ref: ${checkoutBooking?.bookingReference}`}
        icon={CreditCard}
        width="acczite-modal-width-md"
      >
        {checkoutBooking && (
          <form onSubmit={handlePOSCheckoutSubmit} className="space-y-4 pt-2">
            <div className="bg-zinc-900/40 border border-border/60 rounded-2xl p-4 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Client Name</span>
                <span className="font-bold text-white">{checkoutBooking.customer?.firstName} {checkoutBooking.customer?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stylist Name</span>
                <span className="font-bold text-white">{checkoutBooking.staff?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Treatment Booked</span>
                <span className="font-bold text-white">{checkoutBooking.service?.name}</span>
              </div>
              <div className="border-t border-border/40 pt-2 flex justify-between text-sm font-bold text-primary">
                <span>Amount Due</span>
                <span>₹{Number(checkoutBooking.totalAmount || checkoutBooking.service?.price).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Payment Channel</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-zinc-900 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
              >
                <option value="CASH">Cash Drawer</option>
                <option value="UPI">UPI QR Scanner</option>
                <option value="CARD">Credit / Debit Card POS terminal</option>
                <option value="LOYALTY">Loyalty Points Redemption</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
              <Button type="button" variant="outline" size="sm" onClick={() => setCheckoutBooking(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={posSubmitting} className="bg-primary text-primary-foreground font-bold">
                {posSubmitting ? 'Settling Ledger...' : 'Approve Payment & Close Invoice'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </main>
  );
}
