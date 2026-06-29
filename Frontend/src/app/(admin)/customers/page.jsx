'use client';

import { useState, useEffect } from 'react';
import { 
  User, Search, PlusCircle, Calendar, RefreshCw, Trophy, Coins, Award, 
  Clock, CreditCard, ChevronRight, CheckCircle, AlertCircle, Plus, Sparkles,
  UserPlus
} from 'lucide-react';
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
  Modal,
  Input,
  TextArea,
  LoadingState,
} from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function CustomersPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  // Lists & State
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [membershipPlans, setMembershipPlans] = useState([]);
  const [activeTab, setActiveTab] = useState('overview'); // overview, timeline, loyalty, membership, photos

  const [passportMetrics, setPassportMetrics] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [activeMembership, setActiveMembership] = useState(null);

  // Search & Filtering
  const [searchQuery, setSearchQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Add Customer Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFirstName, setAddFirstName] = useState('');
  const [addLastName, setAddLastName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPhone, setAddPhone] = useState('');
  const [addNotes, setAddNotes] = useState('');
  const [addIsWalkIn, setAddIsWalkIn] = useState(true);
  const [addTags, setAddTags] = useState([]);
  const [addError, setAddError] = useState('');
  const [addErrorList, setAddErrorList] = useState([]);
  const [addSubmitting, setAddSubmitting] = useState(false);

  // Forms State
  const [adjustPoints, setAdjustPoints] = useState('');
  const [adjustType, setAdjustType] = useState('EARNED'); // EARNED, REDEEMED, ADJUSTED
  const [adjustDesc, setAdjustDesc] = useState('');
  const [pointsSubmitting, setPointsSubmitting] = useState(false);

  // Membership Purchase State
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [membershipSubmitting, setMembershipSubmitting] = useState(false);

  // Message Box
  const [msg, setMsg] = useState({ type: '', text: '' });

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadCustomers = async () => {
    if (!activeTenant?.id || !token) return;
    try {
      setLoading(true);
      let url = `${API_BASE}/api/customers?search=${encodeURIComponent(searchQuery)}`;
      if (tagFilter) {
        url += `&tag=${tagFilter}`;
      }
      const res = await fetch(url, { headers });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerDetails = async (id) => {
    if (!activeTenant?.id || !token || !id) return;
    try {
      setMsg({ type: '', text: '' });
      const [passRes, plansRes] = await Promise.all([
        fetch(`${API_BASE}/api/customers/${id}/passport`, { headers }),
        fetch(`${API_BASE}/api/customers/membership-plans`, { headers }),
      ]);

      if (passRes.ok) {
        const passData = await passRes.json();
        const passport = passData.passport;
        setSelectedCustomer(passport.customer);
        setTimeline(passport.timeline || []);
        setLoyalty(passport.loyalty || null);
        setPassportMetrics(passport.metrics || null);
        setPhotos(passport.photos || []);
        setActiveMembership(passport.activeMembership || null);
      }
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setMembershipPlans(plansData.plans || []);
      }
    } catch (err) {
      console.error('Error fetching customer details:', err);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [activeTenant?.id, token, tagFilter]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      loadCustomers();
    }
  };

  const handleSelectCustomer = (id) => {
    setSelectedCustomerId(id);
    setActiveTab('overview');
    loadCustomerDetails(id);
  };

  const handleAdjustPointsSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !adjustPoints || Number(adjustPoints) <= 0) return;
    setPointsSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/api/customers/${selectedCustomerId}/loyalty/adjust`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          points: adjustPoints,
          type: adjustType,
          description: adjustDesc || 'Manual points adjustment'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to adjust points.');
      setMsg({ type: 'success', text: data.message });
      setAdjustPoints('');
      setAdjustDesc('');
      loadCustomerDetails(selectedCustomerId);
      loadCustomers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setPointsSubmitting(false);
    }
  };

  const handlePurchaseMembershipSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCustomerId || !selectedPlanId) return;
    setMembershipSubmitting(true);
    setMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${API_BASE}/api/customers/${selectedCustomerId}/memberships`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ planId: selectedPlanId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to assign membership.');
      setMsg({ type: 'success', text: data.message });
      setSelectedPlanId('');
      loadCustomerDetails(selectedCustomerId);
      loadCustomers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setMembershipSubmitting(false);
    }
  };

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    if (!addFirstName.trim() || !addLastName.trim()) {
      setAddError('First name and last name are required.');
      return;
    }
    setAddSubmitting(true);
    setAddError('');
    setAddErrorList([]);
    try {
      const tags = [...addTags];
      if (addIsWalkIn && !tags.includes('WALK_IN')) {
        tags.push('WALK_IN');
      }
      const payload = {
        firstName: addFirstName.trim(),
        lastName: addLastName.trim(),
        email: addEmail.trim() || undefined,
        phone: addPhone.trim() || undefined,
        notes: addNotes.trim() || undefined,
        tags,
      };

      const res = await fetch(`${API_BASE}/api/customers`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.errors && Array.isArray(data.errors)) {
          setAddErrorList(data.errors);
        } else {
          setAddError(data.error || 'Failed to create customer.');
        }
        return;
      }
      // Reset form
      setAddFirstName('');
      setAddLastName('');
      setAddEmail('');
      setAddPhone('');
      setAddNotes('');
      setAddIsWalkIn(true);
      setAddTags([]);
      setShowAddModal(false);

      // Select new customer
      handleSelectCustomer(data.customer.id);
      loadCustomers();
    } catch (err) {
      setAddError(err.message || 'An unexpected error occurred.');
    } finally {
      setAddSubmitting(false);
    }
  };

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`;
  const daysSince = (date) => date ? Math.floor((Date.now() - new Date(date).getTime()) / 86400000) : null;
  const lifecycleLabel = (status) => ({
    ACTIVE: 'Active',
    DUE_SOON: 'Due Soon',
    AT_RISK: 'At Risk',
    INACTIVE: 'Inactive Customer',
  }[status] || status || 'Active');

  const directoryColumns = [
    { 
      key: 'name', 
      header: 'Name', 
      render: (row) => (
        <span className="font-semibold text-stone-200">
          {row.firstName} {row.lastName}
        </span>
      ) 
    },
    { key: 'phone', header: 'Phone', render: (row) => row.phone || '-' },
    { key: 'totalSpending', header: 'Total Spent', render: (row) => formatCurrency(row.totalSpending) },
    { key: 'lifecycleStatus', header: 'Lifecycle', render: (row) => (
      <Badge variant={row.lifecycleStatus === 'INACTIVE' ? 'danger' : row.lifecycleStatus === 'ACTIVE' ? 'success' : 'gold'}>
        {lifecycleLabel(row.lifecycleStatus)}
      </Badge>
    ) },
    { 
      key: 'tags', 
      header: 'Segment', 
      render: (row) => (
        <div className="flex gap-1 flex-wrap">
          {(row.tags || []).map(t => {
            let variant = 'default';
            if (t === 'VIP') variant = 'success';
            else if (t === 'NEW') variant = 'gold';
            
            return (
              <Badge 
                key={t} 
                variant={variant}
                className={t === 'WALK_IN' ? 'border-primary/40 text-primary bg-primary/5' : ''}
              >
                {t === 'WALK_IN' ? 'Walk-In' : t}
              </Badge>
            );
          })}
        </div>
      ) 
    },
    {
      key: 'actions',
      header: '',
      render: (row) => (
        <button 
          onClick={() => handleSelectCustomer(row.id)}
          className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider transition ${
            selectedCustomerId === row.id ? 'text-primary' : 'text-stone-400 hover:text-white'
          }`}
        >
          Manage <ChevronRight className="h-3 w-3" />
        </button>
      )
    }
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Customer CRM"
          title={t('customer_crm_ledger')}
          description="Access loyalty balances, membership tiers, spending logs, and administrative records."
        >
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadCustomers} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Sync CRM
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => setShowAddModal(true)} 
              className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/95 border border-primary/20"
            >
              <PlusCircle className="h-4 w-4" /> Add Customer
            </Button>
          </div>
        </PageHeader>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          
          {/* Customer Directory List */}
          <div className="space-y-4">
            {/* Search & Tag Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center bg-card/60 border border-border/60 p-4 rounded-2xl shadow-sm">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyPress}
                  className="w-full bg-zinc-900/60 border border-border rounded-xl pl-10 pr-12 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => { setSearchQuery(''); setTimeout(loadCustomers, 0); }}
                    className="absolute right-3 top-3.5 text-xs text-muted-foreground hover:text-foreground font-semibold"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full sm:w-auto bg-zinc-900/60 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition min-w-[140px]"
                >
                  <option value="">All Segments</option>
                  <option value="VIP">VIP</option>
                  <option value="NEW">New Clients</option>
                  <option value="WALK_IN">Walk-In Clients</option>
                </select>

                <Button 
                  variant="primary" 
                  onClick={loadCustomers} 
                  className="px-5 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  Search
                </Button>
              </div>
            </div>

            {loading ? (
              <LoadingState label="Searching CRM Ledger..." />
            ) : (
              <DataTable
                columns={directoryColumns}
                rows={customers}
                emptyMessage="No customer files match your criteria."
                className="border border-border/60 bg-gradient-to-b from-card to-zinc-950/40 shadow-sm"
              />
            )}
          </div>

          {/* Customer Details Panel */}
          <div>
            {selectedCustomer ? (
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-b from-card to-zinc-950/40">
                <CardHeader className="border-b border-border/60 bg-white/3 p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg border border-primary/20">
                        {selectedCustomer.firstName.substring(0, 1)}{selectedCustomer.lastName.substring(0, 1)}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white font-display">
                          {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground">{selectedCustomer.email || 'No Email Recorded'}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 justify-end max-w-[150px]">
                      {(selectedCustomer.tags || []).map(t => {
                        let variant = 'default';
                        if (t === 'VIP') variant = 'success';
                        else if (t === 'NEW') variant = 'gold';
                        
                        return (
                          <Badge 
                            key={t} 
                            variant={variant}
                            className={t === 'WALK_IN' ? 'border-primary/40 text-primary bg-primary/5' : ''}
                          >
                            {t === 'WALK_IN' ? 'Walk-In' : t}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>

                  {/* Tabs bar */}
                  <div className="flex gap-2 mt-6 border-b border-border/40 pb-0.5">
                    {['overview', 'timeline', 'loyalty', 'membership', 'photos'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`text-xs font-semibold px-3 py-2 border-b-2 capitalize transition ${
                          activeTab === tab 
                            ? 'border-primary text-primary' 
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </CardHeader>

                <CardBody className="p-6 min-h-[400px]">
                  
                  {msg.text && (
                    <div className={`rounded-xl border p-4 text-xs mb-4 ${
                      msg.type === 'success' 
                        ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' 
                        : 'border-rose-400/20 bg-rose-500/10 text-rose-300'
                    }`}>
                      {msg.text}
                    </div>
                  )}

                  {/* TAB 1: OVERVIEW */}
                  {activeTab === 'overview' && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Spendings */}
                        <div className="bg-zinc-900/40 p-4 border border-border/40 rounded-2xl flex items-center gap-3">
                          <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                            <Coins className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Total Spendings</span>
                            <span className="text-base font-bold text-white font-display mt-0.5 block">
                              {formatCurrency(selectedCustomer.totalSpending)}
                            </span>
                          </div>
                        </div>

                        {/* Preferred Stylist */}
                        <div className="bg-zinc-900/40 p-4 border border-border/40 rounded-2xl flex items-center gap-3">
                          <div className="p-2.5 bg-violet-500/10 rounded-xl text-violet-400">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Preferred Stylist</span>
                            <span className="text-xs font-semibold text-stone-200 mt-1 block">
                              {passportMetrics?.preferredStylist || 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Preferred Services */}
                        <div className="bg-zinc-900/40 p-4 border border-border/40 rounded-2xl flex items-center gap-3">
                          <div className="p-2.5 bg-sky-500/10 rounded-xl text-sky-400">
                            <Sparkles className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Preferred Services</span>
                            <span className="text-xs font-semibold text-stone-200 mt-1 block truncate max-w-[150px]" title={passportMetrics?.preferredServices?.join(', ')}>
                              {passportMetrics?.preferredServices?.join(', ') || 'None'}
                            </span>
                          </div>
                        </div>

                        {/* Revisit Score */}
                        <div className="bg-zinc-900/40 p-4 border border-border/40 rounded-2xl flex items-center gap-3">
                          <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-400">
                            <Clock className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Revisit Score (Avg Interval)</span>
                            <span className="text-base font-bold text-white font-display mt-0.5 block">
                              {passportMetrics?.revisitScore ? `${passportMetrics.revisitScore} Days` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        {/* Last Visit */}
                        <div className="bg-zinc-900/40 p-4 border border-border/40 rounded-2xl flex items-center gap-3">
                          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Last Visit</span>
                            <span className="text-xs font-semibold text-stone-200 mt-1 block">
                              {selectedCustomer.lastVisitAt 
                                ? new Date(selectedCustomer.lastVisitAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'No visits'}
                            </span>
                          </div>
                        </div>

                        {/* Risk Level */}
                        <div className="bg-zinc-900/40 p-4 border border-border/40 rounded-2xl flex items-center gap-3">
                          <div className="p-2.5 bg-rose-500/10 rounded-xl text-rose-400">
                            <AlertCircle className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-stone-500 uppercase tracking-wider block">Risk Level</span>
                            <span className="text-xs font-semibold text-stone-200 mt-1 block">
                              <Badge variant={passportMetrics?.riskLevel === 'HIGH' ? 'danger' : passportMetrics?.riskLevel === 'MEDIUM' ? 'gold' : 'success'}>
                                {passportMetrics?.riskLevel || 'LOW'}
                              </Badge>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Contact & Client Notes</h4>
                        <div className="bg-zinc-900/20 border border-border/60 rounded-2xl p-5 space-y-3 text-xs">
                          <p className="text-muted-foreground"><strong className="text-foreground">Phone:</strong> {selectedCustomer.phone || 'N/A'}</p>
                          <p className="text-muted-foreground"><strong className="text-foreground">Email:</strong> {selectedCustomer.email || 'N/A'}</p>
                          <p className="text-muted-foreground"><strong className="text-foreground">Registered:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                          <div className="border-t border-border/40 pt-3 mt-3 text-muted-foreground leading-relaxed">
                            <strong className="text-foreground block mb-1">Administrative Notes:</strong>
                            <p className="italic text-stone-300 whitespace-pre-wrap">{selectedCustomer.notes || 'No administrative notes added to this client profile.'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: TIMELINE */}
                  {activeTab === 'timeline' && (
                    <div className="space-y-6 max-h-[450px] overflow-y-auto pr-1">
                      {timeline.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-10">No activities on customer timeline.</p>
                      ) : (
                        <div className="relative border-l border-border/60 pl-5 ml-2.5 space-y-6">
                          {timeline.map((evt) => (
                            <div key={evt.id} className="relative">
                              <span className="absolute -left-[26px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-zinc-950 border border-primary/60">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                              </span>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-bold text-stone-200">{evt.title}</span>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(evt.occurredAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                  </span>
                                </div>
                                <p className="text-[11px] text-muted-foreground">{evt.description}</p>
                                {evt.amount && (
                                  <Badge variant="gold" className="mt-1">
                                    Amount: {formatCurrency(evt.amount)}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: LOYALTY POINTS */}
                  {activeTab === 'loyalty' && (
                    <div className="space-y-6">
                      <div className="grid gap-4 sm:grid-cols-3 text-center">
                        <div className="bg-zinc-900/60 p-4 border border-border/60 rounded-2xl">
                          <Coins className="h-5 w-5 text-primary mx-auto mb-1" />
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Balance</span>
                          <span className="text-lg font-bold text-white mt-1 block font-display">{loyalty?.pointsBalance || 0}</span>
                        </div>
                        <div className="bg-zinc-900/60 p-4 border border-border/60 rounded-2xl">
                          <Trophy className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Lifetime</span>
                          <span className="text-lg font-bold text-white mt-1 block font-display">{loyalty?.lifetimePoints || 0}</span>
                        </div>
                        <div className="bg-zinc-900/60 p-4 border border-border/60 rounded-2xl">
                          <Award className="h-5 w-5 text-stone-400 mx-auto mb-1" />
                          <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">Redeemed</span>
                          <span className="text-lg font-bold text-white mt-1 block font-display">{loyalty?.redeemedPoints || 0}</span>
                        </div>
                      </div>

                      {/* Adjust Balance Form */}
                      <form onSubmit={handleAdjustPointsSubmit} className="bg-background/40 border border-border p-4 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">{t('points_adjustment_console')}</h4>
                        
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase">Points Amount</label>
                            <input
                              type="number"
                              min="1"
                              required
                              value={adjustPoints}
                              onChange={(e) => setAdjustPoints(e.target.value)}
                              placeholder="100"
                              className="w-full bg-zinc-900 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50 transition"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase">Transaction Type</label>
                            <select
                              value={adjustType}
                              onChange={(e) => setAdjustType(e.target.value)}
                              className="w-full bg-zinc-900 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50 transition"
                            >
                              <option value="EARNED">EARNED</option>
                              <option value="REDEEMED">REDEEMED</option>
                              <option value="ADJUSTED">ADJUSTED</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase">Adjustment Reason</label>
                          <input
                            type="text"
                            required
                            placeholder="E.g. Bonus points for referral program"
                            value={adjustDesc}
                            onChange={(e) => setAdjustDesc(e.target.value)}
                            className="w-full bg-zinc-900 border border-border rounded-xl px-3 py-2 text-xs text-foreground outline-none focus:border-primary/50 transition"
                          />
                        </div>

                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="sm" 
                          disabled={pointsSubmitting || !adjustPoints}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Plus className="h-3.5 w-3.5" /> {t('adjust_balance')}
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* TAB 4: MEMBER PLANS */}
                  {activeTab === 'membership' && (
                    <div className="space-y-6">
                      
                      {/* Current Membership Active Status */}
                      <div className="bg-zinc-900/60 p-4 border border-border/60 rounded-2xl flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest block">Active Membership</span>
                          <span className="text-base font-bold text-white mt-1 block font-display">
                            {selectedCustomer.memberships?.find(m => m.status === 'ACTIVE')?.membershipPlan?.name || 'No Active Membership'}
                          </span>
                        </div>
                        <Badge variant={selectedCustomer.memberships?.some(m => m.status === 'ACTIVE') ? 'success' : 'default'}>
                          {selectedCustomer.memberships?.some(m => m.status === 'ACTIVE') ? 'SUBSCRIBED' : 'STANDARD'}
                        </Badge>
                      </div>

                      {/* Subscribe Form */}
                      <form onSubmit={handlePurchaseMembershipSubmit} className="bg-background/40 border border-border p-4 rounded-2xl space-y-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Subscribe Customer to Plan</h4>
                        
                        <div className="space-y-2">
                          <label className="text-[9px] font-bold text-muted-foreground uppercase block">Select Member Tier</label>
                          <select
                            value={selectedPlanId}
                            onChange={(e) => setSelectedPlanId(e.target.value)}
                            className="w-full bg-zinc-900 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:border-primary/50 transition"
                          >
                            <option value="">-- Select Membership Tier --</option>
                            {membershipPlans.map(plan => (
                              <option key={plan.id} value={plan.id}>
                                {plan.name} - {formatCurrency(plan.price)}
                              </option>
                            ))}
                          </select>
                        </div>

                        <Button 
                          type="submit" 
                          variant="primary" 
                          size="lg" 
                          disabled={membershipSubmitting || !selectedPlanId}
                          className="w-full flex items-center justify-center gap-2"
                        >
                          <Sparkles className="h-4 w-4" /> {t('subscribe_customer')}
                        </Button>
                      </form>

                      {/* Benefits catalog list */}
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Membership Catalog Details</h4>
                        <div className="grid gap-3">
                          {membershipPlans.map(plan => (
                            <div key={plan.id} className="border border-border/40 p-3.5 rounded-xl space-y-1.5 bg-zinc-950/20">
                              <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-stone-200">{plan.name}</span>
                                <span className="text-xs font-bold text-primary">{formatCurrency(plan.price)}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground">{plan.description}</p>
                              {plan.benefits && plan.benefits.length > 0 && (
                                <ul className="text-[9px] text-stone-400 space-y-0.5 pl-3 list-disc">
                                  {plan.benefits.map(b => (
                                    <li key={b.id}>{b.title}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 5: PHOTOS */}
                  {activeTab === 'photos' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Treatment Photos & Showroom</h4>
                      {photos.length === 0 ? (
                        <div className="border border-dashed border-border/60 rounded-2xl p-12 text-center text-muted-foreground italic text-xs">
                          No treatment photos uploaded yet for this client.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {photos.map(photo => (
                            <div key={photo.id} className="relative group bg-zinc-900 border border-border/45 rounded-2xl overflow-hidden shadow-md">
                              <img src={photo.url} alt={photo.alt || 'Treatment'} className="w-full h-40 object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-x-0 bottom-0 bg-black/60 p-2.5 text-[9px] text-white">
                                <p className="font-semibold truncate">{photo.fileName}</p>
                                <p className="text-slate-450 mt-0.5">{new Date(photo.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                </CardBody>
              </Card>
            ) : (
              <Card className="border-dashed border-border/80 flex flex-col items-center justify-center py-20 px-6 text-center bg-card/10">
                <UserPlus className="h-12 w-12 text-primary/40 mb-3" />
                <h3 className="text-sm font-semibold text-stone-300">Select Customer Profile</h3>
                <p className="text-xs text-stone-500 mt-1.5 max-w-[240px] leading-relaxed">
                  Select a customer from the left directory to adjust loyalty balances, buy memberships, and view timeline logs.
                </p>
                <div className="mt-5 border-t border-border/40 pt-5 w-full max-w-[200px]">
                  <p className="text-[11px] text-stone-500 mb-2">Or get started by registering a new client</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddModal(true)}
                    className="w-full flex items-center justify-center gap-2 text-[11px] uppercase tracking-wider py-2 font-bold"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Customer
                  </Button>
                </div>
              </Card>
            )}
          </div>

        </div>
      </div>

      {/* Add Walk-In / Customer Modal */}
      <Modal 
        open={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Add Walk-In / Customer" 
        subtitle="Create a new customer profile in your salon CRM database."
        icon={PlusCircle}
        width="acczite-modal-width-md"
      >
        <form onSubmit={handleAddCustomerSubmit} className="space-y-4 pt-2">
          {addError && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{addError}</span>
            </div>
          )}

          {addErrorList.length > 0 && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs text-rose-400 space-y-1">
              <div className="font-semibold flex items-center gap-2 mb-1">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Please fix the following validation errors:</span>
              </div>
              <ul className="list-disc pl-5 space-y-0.5">
                {addErrorList.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">First Name *</label>
              <Input
                type="text"
                required
                placeholder="E.g. Priya"
                value={addFirstName}
                onChange={(e) => setAddFirstName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Last Name *</label>
              <Input
                type="text"
                required
                placeholder="E.g. Kapoor"
                value={addLastName}
                onChange={(e) => setAddLastName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Phone Number</label>
              <Input
                type="tel"
                placeholder="E.g. 9876543210"
                value={addPhone}
                onChange={(e) => setAddPhone(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Email Address</label>
              <Input
                type="email"
                placeholder="E.g. priya@gmail.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Administrative Notes</label>
            <TextArea
              placeholder="E.g. Customer prefers tea, has skin allergies to certain dye brands..."
              value={addNotes}
              onChange={(e) => setAddNotes(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between bg-zinc-900/50 border border-border/40 p-4 rounded-xl">
            <div className="space-y-0.5">
              <label className="text-xs font-semibold text-stone-200 block">Mark as Walk-In Customer</label>
              <p className="text-[10px] text-muted-foreground">Will automatically tag this client as a "Walk-In" for front-desk tracking.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={addIsWalkIn}
                onChange={(e) => setAddIsWalkIn(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl transition hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addSubmitting}
              variant="primary"
              className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider bg-primary text-primary-foreground hover:bg-primary/95 rounded-xl transition flex items-center gap-2"
            >
              {addSubmitting ? 'Creating...' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
