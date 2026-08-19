import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  Printer, 
  FileText, 
  Trash2, 
  CheckCircle2, 
  Truck, 
  QrCode, 
  Search,
  Users,
  Percent,
  Download
} from 'lucide-react';
import { SalesInvoice, InvoiceItem, Customer, InventoryItem, SystemSettings } from '../types';
import { printSalesInvoice } from '../services/printSlip';

interface SalesTabProps {
  orders: SalesInvoice[];
  customers: Customer[];
  inventory: InventoryItem[];
  settings: SystemSettings;
  userRole: string;
  onSaveInvoice: (invoice: SalesInvoice) => void;
  onOpenEwayModal: (invoice: SalesInvoice) => void;
}

export const SalesTab: React.FC<SalesTabProps> = ({
  orders,
  customers,
  inventory,
  settings,
  userRole,
  onSaveInvoice,
  onOpenEwayModal,
}) => {
  const [showNewModal, setShowNewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Invoice creation form state
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Credit / Pay Later' | 'Bank Transfer' | 'Digital Wallet' | 'Split'>('Cash');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceDueDate, setInvoiceDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      name: inventory[0]?.name || 'Panadol 500mg Tablets',
      qty: 2,
      price: inventory[0]?.price || 150,
      taxPercent: 18,
      hsnCode: inventory[0]?.hsnCode || '3004.90.99',
      batch: inventory[0]?.batch || 'PAN-9982',
      discount: 0,
      total: (inventory[0]?.price || 150) * 2 * 1.18,
    }
  ]);
  const [applyTcs, setApplyTcs] = useState(false);
  const [applyTds, setApplyTds] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price) - (item.discount || 0), 0);
  const totalTax = items.reduce((sum, item) => {
    const taxable = (item.qty * item.price) - (item.discount || 0);
    return sum + (taxable * (item.taxPercent / 100));
  }, 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;
  const tcsAmount = applyTcs ? (subtotal * 0.001) : 0;
  const grandTotal = subtotal + totalTax + tcsAmount;

  const handleAddItem = () => {
    const defaultInv = inventory[0];
    const newItem: InvoiceItem = {
      id: 'item-' + Math.random().toString(36).substr(2, 7),
      name: defaultInv?.name || 'New Item',
      qty: 1,
      price: defaultInv?.price || 100,
      taxPercent: 18,
      hsnCode: defaultInv?.hsnCode || '3004.90.99',
      batch: defaultInv?.batch || 'BT-100',
      discount: 0,
      total: (defaultInv?.price || 100) * 1.18,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleItemChange = (idx: number, field: keyof InvoiceItem, val: any) => {
    const updated = [...items];
    const current = { ...updated[idx], [field]: val };
    
    // If name changed from inventory dropdown, autofill price, hsn, batch
    if (field === 'name') {
      const invMatch = inventory.find(i => i.name === val);
      if (invMatch) {
        current.price = invMatch.price || invMatch.salePrice || 100;
        current.hsnCode = invMatch.hsnCode || invMatch.hsCode || '3004.90.99';
        current.batch = invMatch.batch;
      }
    }

    const price = current.price || current.rate || 0;
    const taxPct = current.taxPercent || current.taxPct || 0;
    const taxable = (current.qty * price) - (current.discount || 0);
    current.total = taxable + (taxable * (taxPct / 100));
    updated[idx] = current;
    setItems(updated);
  };

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const invNum = 'INV-' + Math.floor(1000 + Math.random() * 9000);
    const newInvoice: SalesInvoice = {
      id: 'inv-' + Math.random().toString(36).substr(2, 9),
      inv: invNum,
      date: invoiceDate,
      dueDate: invoiceDueDate || invoiceDate,
      custName: selectedCustomer.name,
      partyType: 'Customer',
      contact: selectedCustomer.contact,
      customerNtnGst: selectedCustomer.ntnGst || 'NTN-0899214-5',
      items: [...items],
      amount: grandTotal,
      subtotal,
      totalTax,
      cgst,
      sgst,
      tcsAmount: applyTcs ? tcsAmount : undefined,
      tcsRate: applyTcs ? 0.1 : undefined,
      status: paymentMode === 'Credit / Pay Later' ? 'Unpaid' : 'Paid',
      paymentMode,
      branchId: 'b-hq',
      vehicleNo: vehicleNumber || undefined,
      eWayBillNo: grandTotal >= 50000 && vehicleNumber ? 'EWB-' + Math.floor(100000000000 + Math.random() * 900000000000) : undefined,
      irn: 'IRN-' + Math.random().toString(36).substr(2, 12).toUpperCase(),
    };

    onSaveInvoice(newInvoice);
    setShowNewModal(false);
  };

  const filteredOrders = orders.filter(o => 
    o.inv.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.custName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600" />
            <span>Sales Invoicing &amp; GST POS Billing</span>
          </h3>
          <p className="text-xs text-slate-500">
            Generate compliant B2B/B2C tax invoices with customer dropdowns, HSN codes, and instant E-way bill generation.
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Invoice</span>
        </button>
      </div>

      {/* Search & Stats Filter */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoices by customer or invoice #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <div className="text-xs text-slate-500 font-bold">
          Total Invoices: <span className="text-slate-900 font-black">{filteredOrders.length}</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
            <tr>
              <th className="p-3">Invoice #</th>
              <th className="p-3">Date</th>
              <th className="p-3">Customer / Party Name</th>
              <th className="p-3">Payment Mode</th>
              <th className="p-3 text-right">Taxable Subtotal</th>
              <th className="p-3 text-right">Tax (GST)</th>
              <th className="p-3 text-right">Total Amount</th>
              <th className="p-3 text-center">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-slate-50">
                <td className="p-3 font-mono font-bold text-orange-600">{order.inv}</td>
                <td className="p-3 font-semibold text-slate-600">{order.date}</td>
                <td className="p-3">
                  <div className="font-bold text-slate-900">{order.custName}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{order.customerNtnGst || order.contact}</div>
                </td>
                <td className="p-3 text-slate-700 font-medium">{order.paymentMode || 'Cash'}</td>
                <td className="p-3 text-right font-semibold text-slate-800">
                  {settings.currency} {(order.subtotal || order.amount * 0.85).toFixed(2)}
                </td>
                <td className="p-3 text-right font-semibold text-emerald-600">
                  {settings.currency} {(order.totalTax || order.amount * 0.15).toFixed(2)}
                </td>
                <td className="p-3 text-right font-black text-slate-900">
                  {settings.currency} {order.amount.toFixed(2)}
                </td>
                <td className="p-3 text-center">
                  <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                    order.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex justify-end gap-1.5">
                    <button
                      onClick={() => printSalesInvoice(order, settings)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[10px] flex items-center gap-1 transition"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Print</span>
                    </button>
                    {order.amount >= 50000 && !order.eWayBillNo && (
                      <button
                        onClick={() => onOpenEwayModal(order)}
                        className="px-2 py-1 bg-purple-50 text-purple-700 rounded font-bold text-[10px] hover:bg-purple-100 transition"
                      >
                        + E-Way
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create New Invoice Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-600" />
                <span>Create GST / Tax Sales Invoice</span>
              </h3>
              <button onClick={() => setShowNewModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              {/* Customer Drop-down selection */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                    Select Customer (From Existing List) *
                  </label>
                  <select
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-bold text-slate-900"
                  >
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.category}) - {c.contact}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg bg-white font-semibold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Bank Transfer">Bank Transfer (Direct)</option>
                    <option value="Credit / Pay Later">Credit / Pay Later</option>
                    <option value="Digital Wallet">Customer Digital Wallet</option>
                  </select>
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-800 text-xs">Invoice Items &amp; Medicine Details</h4>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 text-slate-700 font-bold text-[10px] uppercase">
                      <tr>
                        <th className="p-2 text-left">Item / Medicine (From Stock)</th>
                        <th className="p-2 text-left">Batch #</th>
                        <th className="p-2 text-left">HSN Code</th>
                        <th className="p-2 text-right">Qty</th>
                        <th className="p-2 text-right">Unit Price</th>
                        <th className="p-2 text-right">Tax %</th>
                        <th className="p-2 text-right">Total ({settings.currency})</th>
                        <th className="p-2 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="p-2">
                            <select
                              value={item.name}
                              onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                              className="w-full px-2 py-1 border rounded bg-white font-medium"
                            >
                              {inventory.map(i => (
                                <option key={i.id} value={i.name}>{i.name} (Stock: {i.stock})</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.batch || ''}
                              onChange={(e) => handleItemChange(idx, 'batch', e.target.value)}
                              className="w-20 px-2 py-1 border rounded font-mono text-[11px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.hsnCode || ''}
                              onChange={(e) => handleItemChange(idx, 'hsnCode', e.target.value)}
                              className="w-24 px-2 py-1 border rounded font-mono text-[11px]"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleItemChange(idx, 'qty', parseInt(e.target.value) || 1)}
                              className="w-16 px-2 py-1 border rounded text-right font-bold"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => handleItemChange(idx, 'price', parseFloat(e.target.value) || 0)}
                              className="w-20 px-2 py-1 border rounded text-right"
                            />
                          </td>
                          <td className="p-2">
                            <select
                              value={item.taxPercent}
                              onChange={(e) => handleItemChange(idx, 'taxPercent', parseFloat(e.target.value))}
                              className="w-16 px-2 py-1 border rounded text-right bg-white font-bold text-emerald-600"
                            >
                              <option value="0">0%</option>
                              <option value="5">5%</option>
                              <option value="12">12%</option>
                              <option value="18">18%</option>
                            </select>
                          </td>
                          <td className="p-2 text-right font-black text-slate-900">
                            {(item.total || item.amount || 0).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-rose-500 hover:text-rose-700"
                            >
                              <Trash2 className="w-4 h-4 mx-auto" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Tax & E-Way Bill Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h5 className="font-bold text-slate-800 text-[11px] uppercase">Statutory Compliance &amp; Logistics</h5>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyTcs}
                      onChange={(e) => setApplyTcs(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span className="font-semibold text-slate-700">Apply TCS under Section 206C(1H) (0.1%)</span>
                  </label>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                      Transport Vehicle No (For E-Way Bill)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. LES-2024 (Auto generates E-way bill if >= Rs 50k)"
                      value={vehicleNumber}
                      onChange={(e) => setVehicleNumber(e.target.value)}
                      className="w-full px-3 py-1.5 border rounded-lg uppercase font-mono font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Subtotal:</span>
                    <span className="font-bold text-slate-900">{settings.currency} {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>CGST (50%):</span>
                    <span className="font-semibold text-emerald-600">{settings.currency} {cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>SGST (50%):</span>
                    <span className="font-semibold text-emerald-600">{settings.currency} {sgst.toFixed(2)}</span>
                  </div>
                  {applyTcs && (
                    <div className="flex justify-between text-emerald-700 font-semibold">
                      <span>TCS (0.1%):</span>
                      <span>+{settings.currency} {tcsAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                    <span>Grand Total:</span>
                    <span className="text-orange-600">{settings.currency} {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow"
                >
                  Confirm &amp; Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
