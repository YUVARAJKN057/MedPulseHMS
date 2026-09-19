import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, FileText, CreditCard, Download, CheckCircle2, AlertCircle, TrendingUp, X } from 'lucide-react';
import { cn, formatCurrency } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { getBilling, getPatients, createInvoice } from '../../services/firestoreService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function BillingManager() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    service: '',
    amount: 0,
    status: 'Pending'
  });

  useEffect(() => {
    if (!user) return;
    const unsubscribe = getBilling((data) => {
      setInvoices(data);
      setLoading(false);
    }, user.role, user.uid);

    const unsubscribePatients = getPatients((data) => {
      setPatients(data);
    });

    return () => {
      unsubscribe();
      unsubscribePatients();
    };
  }, [user]);

  const stats = useMemo(() => {
    const total = invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const pending = invoices.filter(i => i.status === 'Pending').reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const completed = invoices.filter(i => i.status === 'Paid').length;
    return { total, pending, completed };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch = 
        (invoice.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (invoice.service || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || invoice.status === statusFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'All') {
        const invoiceDate = invoice.createdAt ? new Date(invoice.createdAt.seconds * 1000) : new Date();
        const now = new Date();
        
        if (dateFilter === 'This Week') {
          const sevenDaysAgo = new Date(now);
          sevenDaysAgo.setDate(now.getDate() - 7);
          matchesDate = invoiceDate >= sevenDaysAgo;
        } else if (dateFilter === 'This Month') {
          matchesDate = invoiceDate.getMonth() === now.getMonth() && invoiceDate.getFullYear() === now.getFullYear();
        }
      }

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [invoices, searchQuery, statusFilter, dateFilter]);

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const patient = patients.find(p => p.id === formData.patientId);
      await createInvoice({
        ...formData,
        patientName: patient?.name || formData.patientName,
        amount: Number(formData.amount),
        invoiceId: `INV-${Date.now().toString().slice(-6)}`
      });
      toast.success('Invoice created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      toast.error('Failed to create invoice');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('All');
    setDateFilter('All');
  };

  const hasActiveFilters = searchQuery !== '' || statusFilter !== 'All' || dateFilter !== 'All';

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Revenue & Billing</h1>
          <p className="text-slate-500">Track invoices, payments and financial growth.</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
        >
          <Plus size={18} />
          Create New Invoice
        </button>
      </header>

      {/* Financial Overview */}
      <div className="grid md:grid-cols-3 gap-8">
        <FinanceCard title="Total Revenue" value={formatCurrency(stats.total)} trend="+12.5%" color="blue" />
        <FinanceCard title="Pending Payments" value={formatCurrency(stats.pending)} trend="-3.2%" color="indigo" />
        <FinanceCard title="Completed Invoices" value={stats.completed.toString()} trend="+8.1%" color="emerald" />
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        <div className="p-8 border-b border-slate-100 space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by invoice ID, patient name..." 
                className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <button 
                  onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                  className={cn(
                    "px-6 py-4 border rounded-2xl font-bold flex items-center gap-2 transition-all uppercase text-[10px] tracking-widest",
                    isFilterMenuOpen || hasActiveFilters 
                      ? "bg-slate-900 border-slate-900 text-white" 
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <Filter size={18} />
                  {hasActiveFilters ? 'Filters Active' : 'Advanced Filters'}
                </button>
                
                <AnimatePresence>
                  {isFilterMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-white border border-slate-200 rounded-[2rem] shadow-2xl p-6 z-50 space-y-6"
                    >
                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Payment Status</h4>
                        <div className="flex flex-wrap gap-2">
                          {['All', 'Paid', 'Pending', 'Overdue'].map(status => (
                            <button
                              key={status}
                              onClick={() => setStatusFilter(status)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                                statusFilter === status 
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                              )}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Date Range</h4>
                        <div className="flex flex-wrap gap-2">
                          {['All', 'This Week', 'This Month'].map(range => (
                            <button
                              key={range}
                              onClick={() => setDateFilter(range)}
                              className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all",
                                dateFilter === range 
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                              )}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-100 flex justify-between gap-4">
                        <button 
                          onClick={clearFilters}
                          className="text-[10px] font-bold uppercase tracking-widest text-red-500 hover:text-red-600"
                        >
                          Reset
                        </button>
                        <button 
                          onClick={() => setIsFilterMenuOpen(false)}
                          className="text-[10px] font-bold uppercase tracking-widest text-blue-600 hover:text-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Active:</span>
              {statusFilter !== 'All' && (
                <FilterChip label={`Status: ${statusFilter}`} onClear={() => setStatusFilter('All')} />
              )}
              {dateFilter !== 'All' && (
                <FilterChip label={`Date: ${dateFilter}`} onClear={() => setDateFilter('All')} />
              )}
              {searchQuery && (
                <FilterChip label={`Search: ${searchQuery}`} onClear={() => setSearchQuery('')} />
              )}
              <button 
                onClick={clearFilters}
                className="text-[10px] font-bold text-slate-400 hover:text-slate-900 transition-colors underline decoration-dotted"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 text-[10px] uppercase tracking-widest text-slate-400 font-bold border-b border-slate-100">
                <th className="px-8 py-5">Invoice ID</th>
                <th className="px-8 py-5">Patient</th>
                <th className="px-8 py-5">Service</th>
                <th className="px-8 py-5">Amount</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence>
                {loading ? (
                  <tr><td colSpan={7} className="px-8 py-12 text-center text-slate-400">Loading billing data...</td></tr>
                ) : filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice, index) => (
                    <InvoiceRow 
                      key={invoice.id}
                      id={invoice.invoiceId || invoice.id}
                      patient={invoice.patientName}
                      service={invoice.service}
                      amount={invoice.amount}
                      status={invoice.status}
                      date={invoice.createdAt ? new Date(invoice.createdAt.seconds * 1000) : new Date()}
                      index={index}
                    />
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-8 py-32 text-center">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                          <Search size={32} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-lg font-bold text-slate-900">No invoices found</h4>
                          <p className="text-sm text-slate-400">Try adjusting your filters or search query.</p>
                        </div>
                        <button 
                          onClick={clearFilters}
                          className="px-6 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold"
                        >
                          Clear All Filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl p-8 overflow-hidden"
            >
              <button 
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute right-6 top-6 p-2 text-slate-400 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>

              <h2 className="text-2xl font-bold text-slate-900 mb-6">Issue New Invoice</h2>
              
              <form onSubmit={handleCreateInvoice} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Select Patient</label>
                    <select 
                      required
                      value={formData.patientId}
                      onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    >
                      <option value="">Select a registered patient</option>
                      {patients.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.email})</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Service Description</label>
                    <input 
                      required
                      type="text" 
                      value={formData.service}
                      onChange={(e) => setFormData({...formData, service: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                      placeholder="e.g., MRI Scan - Cardiac"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Amount ($)</label>
                    <input 
                      required
                      type="number" 
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-blue-600/10 focus:outline-none"
                    >
                      <option>Pending</option>
                      <option>Paid</option>
                      <option>Overdue</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
                >
                  Generate Invoice
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FilterChip({ label, onClear }: { label: string, onClear: () => void }) {
  return (
    <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
      <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{label}</span>
      <button onClick={onClear} className="text-blue-400 hover:text-blue-600 transition-colors">
        <X size={12} />
      </button>
    </div>
  );
}

function FinanceCard({ title, value, trend, color }: any) {
  const colors: any = {
    blue: "bg-blue-600 shadow-blue-200",
    indigo: "bg-slate-900 shadow-slate-200",
    emerald: "bg-emerald-600 shadow-emerald-200"
  };
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={cn("p-8 rounded-[2.5rem] text-white overflow-hidden relative", colors[color])}
    >
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-white/60">{title}</h3>
          <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
            <TrendingUp size={16} />
          </div>
        </div>
        <div className="text-3xl font-bold tracking-tight mb-2">{value}</div>
        <div className="text-xs font-bold text-white/80">{trend} from last month</div>
      </div>
      <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-[60px]" />
    </motion.div>
  );
}

function InvoiceRow({ id, patient, service, amount, status, date, index }: any) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const statusStyles: any = {
    Paid: 'bg-green-100 text-green-600',
    Pending: 'bg-orange-100 text-orange-600',
    Overdue: 'bg-red-100 text-red-600',
  };

  const statusIcons: any = {
    Paid: <CheckCircle2 size={10} className="inline mr-1" />,
    Pending: <AlertCircle size={10} className="inline mr-1" />,
    Overdue: <AlertCircle size={10} className="inline mr-1" />,
  };

  return (
    <motion.tr 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-slate-50/50 transition-colors group"
    >
      <td className="px-8 py-5">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
          <span className="text-xs font-bold text-slate-900">{id}</span>
        </div>
      </td>
      <td className="px-8 py-5 text-sm font-bold text-slate-700">{patient}</td>
      <td className="px-8 py-5 text-xs text-slate-500 font-medium truncate max-w-[200px]">{service}</td>
      <td className="px-8 py-5 text-sm font-bold text-slate-900">{formatCurrency(amount)}</td>
      <td className="px-8 py-5">
        <span className={cn(
          "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap",
          statusStyles[status]
        )}>
          {statusIcons[status]}
          {status}
        </span>
      </td>
      <td className="px-8 py-5 text-xs text-slate-400 font-bold whitespace-nowrap">{formattedDate}</td>
      <td className="px-8 py-5">
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all" title="Download Invoice">
            <Download size={18} />
          </button>
          <button className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 shadow-sm transition-all" title="Process Payment">
            <CreditCard size={18} />
          </button>
        </div>
      </td>
    </motion.tr>
  );
}

