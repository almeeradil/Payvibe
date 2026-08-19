import React, { useState } from 'react';
import { 
  UserCircle2, 
  X, 
  Wallet, 
  Award, 
  FileText, 
  Printer, 
  CreditCard, 
  CheckCircle2, 
  Calendar,
  Gift,
  Building,
  Upload
} from 'lucide-react';
import { Customer, SalesInvoice, SystemSettings } from '../types';
import { printDetailedInvoice } from '../services/printSlip';

interface ClientPortalModalProps {
  customers: Customer[];
  orders: SalesInvoice[];
  settings: SystemSettings;
  onClose: () => void;
  onSubmitPaymentProof?: (customerId: string, invoiceNo: string, utrRef: string, amount: number) => void;
}

export const ClientPortalModal: React.FC<ClientPortalModalProps> = ({
  customers,
  orders,
  settings,
  onClose,
  onSubmitPaymentProof,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [utrRef, setUtrRef] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [targetInvoice, setTargetInvoice] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState(false);

  const currentCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];
  const customerInvoices = orders.filter(o => 
    o.customerId === currentCustomer?.id || 
    o.custName.toLowerCase() === currentCustomer?.name.toLowerCase()
  );

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || !utrRef) return;
    if (onSubmitPaymentProof) {
      onSubmitPaymentProof(currentCustomer.id, targetInvoice, utrRef, parseFloat(payAmount));
    }
    setPaymentSuccessMsg(true);
    setUtrRef('');
    setPayAmount('');
    setTimeout(() => setPaymentSuccessMsg(false), 4000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-6 border border-slate-200 my-8">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
              <UserCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                Client Self-Service Portal
                <span className="text-[10px] bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded-full">
                  Customer View
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                View your outstanding statements, download tax invoices, reward points &amp; wallet cashback.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customer Selector Dropdown */}
        <div className="my-4 bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold uppercase text-slate-600">Select Customer Account:</label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:ring-2 focus:ring-cyan-500"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.category}) - Balance: {settings.currency} {c.credit.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Registered NTN/CNIC: <span className="font-mono font-bold text-slate-800">{currentCustomer?.ntnCnic || 'N/A'}</span>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="text-[10px] font-bold uppercase text-slate-400">Outstanding Balance</div>
            <div className="text-xl font-black text-rose-600 mt-1">
              {settings.currency} {(currentCustomer?.credit || 0).toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Credit Limit: {settings.currency} {(currentCustomer?.creditLimit || 100000).toLocaleString()}</div>
          </div>

          <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <div className="text-[10px] font-bold uppercase text-amber-700 flex items-center justify-between">
              <span>Loyalty Points</span>
              <Award className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-amber-900 mt-1">
              {currentCustomer?.loyaltyPoints || 0} pts
            </div>
            <div className="text-[10px] text-amber-700 font-semibold mt-0.5">Tier: {currentCustomer?.tier || 'Silver'} Member</div>
          </div>

          <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
            <div className="text-[10px] font-bold uppercase text-emerald-700 flex items-center justify-between">
              <span>Digital Wallet</span>
              <Wallet className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl font-black text-emerald-800 mt-1">
              {settings.currency} {(currentCustomer?.walletBalance || 0).toFixed(2)}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">Instant Checkout Usable</div>
          </div>

          <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-200">
            <div className="text-[10px] font-bold uppercase text-purple-700 flex items-center justify-between">
              <span>Special Privileges</span>
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div className="text-sm font-black text-purple-900 mt-1">
              15% Birthday Discount
            </div>
            <div className="text-[10px] text-purple-700 mt-0.5">Valid on all prescription orders</div>
          </div>
        </div>

        {/* Customer Invoices History */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-cyan-600" />
              <span>Your Invoices &amp; Receipts ({customerInvoices.length})</span>
            </h4>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
                <tr>
                  <th className="p-3">Invoice #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Products</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Total ({settings.currency})</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customerInvoices.length > 0 ? (
                  customerInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 font-bold text-orange-600 font-mono">{inv.inv}</td>
                      <td className="p-3 font-semibold text-slate-600">{inv.date}</td>
                      <td className="p-3 text-slate-700">
                        {inv.items.map(it => it.prodName).join(', ')}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-black text-slate-900">
                        {settings.currency} {inv.amount.toFixed(2)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => printDetailedInvoice(inv, settings)}
                          className="px-2.5 py-1 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 rounded font-bold text-[11px] transition inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Print Slip</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-400">
                      No invoices recorded under this customer account.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit Online Payment / UTR Proof */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-800 uppercase mb-2 flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Submit Online Payment Proof / Bank UTR Reference</span>
          </h4>
          <form onSubmit={handlePaymentSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Invoice Ref (Optional)</label>
              <input
                type="text"
                value={targetInvoice}
                onChange={(e) => setTargetInvoice(e.target.value)}
                placeholder="e.g. INV-1001"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Payment Amount ({settings.currency}) *</label>
              <input
                type="number"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
                placeholder="0.00"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Bank UTR / Transaction ID *</label>
              <input
                type="text"
                value={utrRef}
                onChange={(e) => setUtrRef(e.target.value)}
                required
                placeholder="e.g. FT-99881120"
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg bg-white"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow transition text-xs flex items-center justify-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Submit Proof</span>
              </button>
            </div>
          </form>

          {paymentSuccessMsg && (
            <div className="mt-3 p-2.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payment proof submitted successfully! Our accounting team will verify and update your ledger balance.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
