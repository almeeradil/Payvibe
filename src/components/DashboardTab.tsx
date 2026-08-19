import React from 'react';
import { 
  DollarSign, 
  Package, 
  Users, 
  ArrowUpRight, 
  AlertTriangle, 
  Clock, 
  Store, 
  Percent, 
  Landmark, 
  HeartHandshake, 
  UserCheck, 
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  ArrowRightLeft
} from 'lucide-react';
import { AppStateData } from '../types';

interface DashboardTabProps {
  data: AppStateData;
  onNavigateTab: (tab: string) => void;
  onOpenNewInvoice: () => void;
  onOpenStockTransfer: () => void;
  onOpenGstFiling: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  data,
  onNavigateTab,
  onOpenNewInvoice,
  onOpenStockTransfer,
  onOpenGstFiling,
}) => {
  const isHQ = data.currentBranchId === 'ALL_HQ';
  
  // Filter records by active branch
  const filteredOrders = isHQ 
    ? data.orders 
    : data.orders.filter(o => o.branchId === data.currentBranchId);
    
  const filteredInventory = isHQ 
    ? data.inventory 
    : data.inventory.filter(i => i.branchId === data.currentBranchId);

  const filteredPurchases = isHQ 
    ? data.purchaseinvoices 
    : data.purchaseinvoices.filter(p => p.branchId === data.currentBranchId);

  const filteredExpenses = isHQ 
    ? data.expenses 
    : data.expenses.filter(e => e.branchId === data.currentBranchId);

  const totalSalesRevenue = filteredOrders.reduce((s, o) => s + (o.amount || 0), 0);
  const totalPurchaseExpenses = filteredPurchases.reduce((s, p) => s + (p.amt || 0), 0);
  const totalOtherExpenses = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
  const totalStockUnits = filteredInventory.reduce((s, i) => s + (i.stock || 0), 0);
  const totalStockValue = filteredInventory.reduce((s, i) => s + (i.stock * i.purchasePrice), 0);
  
  // Low stock & near expiry
  const lowStockItems = filteredInventory.filter(i => i.stock <= (i.minStockLevel || 5));
  const today = new Date();
  const nearExpiryItems = filteredInventory.filter(i => {
    if (!i.expiry) return false;
    const exp = new Date(i.expiry);
    const diff = (exp.getTime() - today.getTime()) / (1000 * 3600 * 24);
    return diff <= 60 && diff >= 0;
  });

  const pendingReminders = filteredOrders.filter(o => o.status === 'Unpaid' || o.status === 'Overdue');
  const activeStaffCount = data.employees.filter(e => isHQ || e.branchId === data.currentBranchId).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Alert for Low Stock */}
      {lowStockItems.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 animate-bounce" />
            <div>
              <span className="font-extrabold text-xs">Low Stock Alert: </span>
              <span className="text-xs font-semibold">
                {lowStockItems.length} item(s) are below minimum threshold! Immediate reorder recommended.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition shrink-0"
          >
            Manage Stock
          </button>
        </div>
      )}

      {/* Near Expiry Banner */}
      {nearExpiryItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-extrabold text-xs">Near Expiry Warning: </span>
              <span className="text-xs font-semibold">
                {nearExpiryItems.length} medicine batch(es) expire within 60 days!
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition shrink-0"
          >
            Review Batches
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-orange-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Sales Turnover</span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data.settings.currency} {totalSalesRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{filteredOrders.length} Invoices Generated</span>
          </div>
        </div>

        {/* Stock Inventory Value */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-cyan-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Live Inventory Value</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data.settings.currency} {totalStockValue.toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            {totalStockUnits} Units across {filteredInventory.length} SKUs
          </div>
        </div>

        {/* Multi-Store Active Branches */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-purple-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Multi-Store Network</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {data.branches.length} Store Chains
          </div>
          <div className="text-[11px] font-semibold text-purple-600 mt-1">
            {activeStaffCount} Active On-Duty Staff
          </div>
        </div>

        {/* Total Outflow & Expenses */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs hover:border-rose-300 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Total Purchases &amp; Exp</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 mt-2">
            {data.settings.currency} {(totalPurchaseExpenses + totalOtherExpenses).toLocaleString()}
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">
            Purchases: {data.settings.currency} {totalPurchaseExpenses.toLocaleString()} | Exp: {data.settings.currency} {totalOtherExpenses.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Multi-Store Chain Live Branch Monitoring Table */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <Store className="w-4 h-4 text-purple-600" />
              <span>Multi-Store &amp; Franchise Live Branch Monitor</span>
            </h4>
            <p className="text-[11px] text-slate-500">Live aggregated sales, stock levels, and staff status across store network.</p>
          </div>
          <button
            onClick={() => onNavigateTab('multistore')}
            className="text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
          >
            <span>Branch Controller</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
              <tr>
                <th className="p-3">Store Branch</th>
                <th className="p-3">Location / Code</th>
                <th className="p-3">Branch Manager</th>
                <th className="p-3 text-right">Sales Revenue</th>
                <th className="p-3 text-right">Stock Value</th>
                <th className="p-3 text-center">Staff Count</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.branches.map(b => {
                const bSales = data.orders.filter(o => o.branchId === b.id).reduce((s, o) => s + o.amount, 0);
                const bStockVal = data.inventory.filter(i => i.branchId === b.id).reduce((s, i) => s + (i.stock * i.purchasePrice), 0);
                const bStaff = data.employees.filter(e => e.branchId === b.id).length;
                return (
                  <tr key={b.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <Store className="w-3.5 h-3.5 text-purple-500" />
                      <span>{b.name}</span>
                      {b.isHq && <span className="bg-purple-100 text-purple-800 text-[9px] px-1.5 py-0.2 rounded font-bold">HQ</span>}
                    </td>
                    <td className="p-3 font-semibold text-slate-600">{b.city} ({b.code})</td>
                    <td className="p-3 text-slate-700">{b.manager}</td>
                    <td className="p-3 text-right font-black text-emerald-600">
                      {data.settings.currency} {bSales.toLocaleString()}
                    </td>
                    <td className="p-3 text-right font-black text-slate-900">
                      {data.settings.currency} {bStockVal.toLocaleString()}
                    </td>
                    <td className="p-3 text-center font-bold text-slate-700">{bStaff} Staff</td>
                    <td className="p-3 text-center">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Access Modules Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* GST & Tax Compliance Widget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-slate-400">GST &amp; Tax Compliance</span>
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h5 className="font-extrabold text-slate-900 text-sm">Automated 1-Click Tax Filing</h5>
            <p className="text-[11px] text-slate-500 mt-1">
              GSTR-1, GSTR-3B &amp; E-Way Bill validation engine with pre-submission error checking.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('gstfiling')}
            className="mt-4 w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Open GST Compliance Center</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inter-Store Stock Transfer Widget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-slate-400">Logistics &amp; Stock</span>
              <ArrowRightLeft className="w-4 h-4 text-purple-600" />
            </div>
            <h5 className="font-extrabold text-slate-900 text-sm">Inter-Store Stock Transfer</h5>
            <p className="text-[11px] text-slate-500 mt-1">
              Transfer items seamlessly between store branches with real-time transit status tracking.
            </p>
          </div>
          <button
            onClick={onOpenStockTransfer}
            className="mt-4 w-full py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>New Stock Transfer Order</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* HR & Biometric Attendance Widget */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase text-slate-400">HR &amp; Payroll</span>
              <UserCheck className="w-4 h-4 text-indigo-600" />
            </div>
            <h5 className="font-extrabold text-slate-900 text-sm">Biometric Attendance &amp; Payroll</h5>
            <p className="text-[11px] text-slate-500 mt-1">
              Punch-in tracking, automated working hours salary calculation, and 1-Click Sync to Expenses.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('hrpayroll')}
            className="mt-4 w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition flex items-center justify-center gap-1.5"
          >
            <span>Manage HR &amp; Payroll</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
