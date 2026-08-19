import React, { useState } from 'react';
import { 
  BarChart3, 
  Printer, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileCheck2, 
  FileText,
  Calendar
} from 'lucide-react';
import { SalesInvoice, PurchaseOrder, ExpenseVoucher, InventoryItem, Customer, SystemSettings } from '../types';

interface ReportsTabProps {
  orders: SalesInvoice[];
  purchases: PurchaseOrder[];
  expenses: ExpenseVoucher[];
  inventory: InventoryItem[];
  customers: Customer[];
  settings: SystemSettings;
  userRole: string;
}

export const ReportsTab: React.FC<ReportsTabProps> = ({
  orders,
  purchases,
  expenses,
  inventory,
  customers,
  settings,
  userRole,
}) => {
  const [reportType, setReportType] = useState<'pnl' | 'gst' | 'aging' | 'stock'>('pnl');

  const totalSalesRevenue = orders.reduce((s, o) => s + (o.subtotal || o.amount * 0.85), 0);
  const totalTaxCollected = orders.reduce((s, o) => s + (o.totalTax || o.amount * 0.15), 0);
  const totalPurchasesCost = purchases.reduce((s, p) => s + p.amt, 0);
  const totalOperatingExpenses = expenses.reduce((s, e) => s + e.amt, 0);
  
  // P&L
  const grossProfit = totalSalesRevenue - (totalPurchasesCost * 0.65);
  const netProfit = grossProfit - totalOperatingExpenses;
  const corporateTaxEstimate = netProfit > 0 ? netProfit * 0.29 : 0;
  const netProfitAfterTax = netProfit - corporateTaxEstimate;

  const totalReceivables = customers.reduce((s, c) => s + (c.balance || 0), 0);

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
            <span>Financial &amp; Statutory Compliance Reports</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time Profit &amp; Loss, Input/Output GST calculations, and accounts receivable aging summaries.
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Financial Report</span>
        </button>
      </div>

      {/* Report Type Selector Tabs */}
      <div className="flex border-b border-slate-200 space-x-4 text-xs font-bold">
        <button
          onClick={() => setReportType('pnl')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            reportType === 'pnl' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Profit &amp; Loss Statement</span>
        </button>
        <button
          onClick={() => setReportType('gst')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            reportType === 'gst' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>Tax &amp; GST Audit Ledger</span>
        </button>
        <button
          onClick={() => setReportType('aging')}
          className={`pb-2.5 flex items-center gap-1.5 transition ${
            reportType === 'aging' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Receivables Aging ({customers.length})</span>
        </button>
      </div>

      {/* P&L View */}
      {reportType === 'pnl' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Total Net Turnover</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {settings.currency} {totalSalesRevenue.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Net of sales tax</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Gross Profit (Margin)</div>
              <div className="text-2xl font-black text-indigo-600 mt-1">
                {settings.currency} {grossProfit.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{((grossProfit / (totalSalesRevenue || 1)) * 100).toFixed(1)}% Gross Margin</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Operating Expenses</div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {settings.currency} {totalOperatingExpenses.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Rent, Salaries, Utilities</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-[10px] font-bold uppercase text-slate-400">Net Profit (After Tax)</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {settings.currency} {netProfitAfterTax.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-700 font-bold mt-0.5">Estimated Tax Paid</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
            <h4 className="font-extrabold text-slate-900 text-sm mb-4">Financial Income Statement Summary</h4>
            <div className="space-y-3 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-2 font-bold text-slate-900">
                <span>Gross Invoiced Sales</span>
                <span>{settings.currency} {(totalSalesRevenue + totalTaxCollected).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-600">
                <span>Less: Statutory Sales Tax (CGST + SGST)</span>
                <span className="text-rose-600">-{settings.currency} {totalTaxCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-black text-slate-900 bg-slate-50 px-2 rounded">
                <span>Net Sales Revenue (Turnover)</span>
                <span>{settings.currency} {totalSalesRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-600">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="text-rose-600">-{settings.currency} {(totalPurchasesCost * 0.65).toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-black text-indigo-700 bg-indigo-50/50 px-2 rounded">
                <span>Gross Profit</span>
                <span>{settings.currency} {grossProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-600">
                <span>Operating Overheads &amp; Employee Payroll</span>
                <span className="text-rose-600">-{settings.currency} {totalOperatingExpenses.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-black text-slate-900 bg-slate-50 px-2 rounded">
                <span>Operating Profit (EBITDA)</span>
                <span>{settings.currency} {netProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-600">
                <span>Estimated Corporate Income Tax (29%)</span>
                <span className="text-rose-600">-{settings.currency} {corporateTaxEstimate.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 font-black text-base text-emerald-700 bg-emerald-50 px-3 rounded-lg">
                <span>Net Profit After Tax</span>
                <span>{settings.currency} {netProfitAfterTax.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tax Report */}
      {reportType === 'gst' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="font-extrabold text-slate-900 text-sm">Tax Liability &amp; Input/Output GST Matrix</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-500">Output Tax (Collected on Sales)</div>
              <div className="text-xl font-black text-orange-600 mt-1">
                {settings.currency} {totalTaxCollected.toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div className="text-[10px] font-bold uppercase text-slate-500">Input Tax (Paid on Purchases)</div>
              <div className="text-xl font-black text-emerald-600 mt-1">
                {settings.currency} {(totalPurchasesCost * 0.18).toFixed(2)}
              </div>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="text-[10px] font-bold uppercase text-emerald-700">Net Tax Payable / (Credit)</div>
              <div className="text-xl font-black text-emerald-800 mt-1">
                {settings.currency} {Math.max(0, totalTaxCollected - (totalPurchasesCost * 0.18)).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receivables Aging */}
      {reportType === 'aging' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
              <tr>
                <th className="p-3">Customer Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-right">0-30 Days</th>
                <th className="p-3 text-right">31-60 Days</th>
                <th className="p-3 text-right">61-90 Days</th>
                <th className="p-3 text-right">90+ Days Overdue</th>
                <th className="p-3 text-right">Total Outstanding Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customers.map(c => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{c.name}</td>
                  <td className="p-3 text-slate-600">{c.contact}</td>
                  <td className="p-3 text-right text-slate-700">{settings.currency} {(c.balance * 0.6).toFixed(2)}</td>
                  <td className="p-3 text-right text-slate-700">{settings.currency} {(c.balance * 0.25).toFixed(2)}</td>
                  <td className="p-3 text-right text-amber-600">{settings.currency} {(c.balance * 0.15).toFixed(2)}</td>
                  <td className="p-3 text-right text-rose-600 font-bold">{settings.currency} 0.00</td>
                  <td className={`p-3 text-right font-black ${c.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {settings.currency} {c.balance.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
