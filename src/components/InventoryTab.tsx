import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  AlertTriangle, 
  Calendar, 
  Layers, 
  CheckCircle2,
  Barcode,
  Package
} from 'lucide-react';
import { InventoryItem, SystemSettings } from '../types';

interface InventoryTabProps {
  inventory: InventoryItem[];
  settings: SystemSettings;
  userRole: string;
  onAddItem: (item: InventoryItem) => void;
  onOpenStockTransferModal: () => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  inventory,
  settings,
  userRole,
  onAddItem,
  onOpenStockTransferModal,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Tablets');
  const [stock, setStock] = useState('100');
  const [price, setPrice] = useState('150');
  const [costPrice, setCostPrice] = useState('120');
  const [batch, setBatch] = useState('');
  const [expiry, setExpiry] = useState('2027-12-31');
  const [hsnCode, setHsnCode] = useState('3004.90.99');
  const [minStock, setMinStock] = useState('20');

  const totalValuation = inventory.reduce((s, i) => s + (i.stock * (i.costPrice || i.price * 0.8)), 0);
  const lowStockCount = inventory.filter(i => i.stock <= (i.minStockAlert || 20)).length;

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const newItem: InventoryItem = {
      id: 'inv-' + Math.random().toString(36).substr(2, 9),
      name,
      category,
      stock: parseInt(stock) || 0,
      price: parseFloat(price) || 0,
      costPrice: parseFloat(costPrice) || 0,
      batch: batch || 'BT-' + Math.floor(1000 + Math.random() * 9000),
      expiryDate: expiry,
      hsnCode: hsnCode || '3004.90.99',
      minStockAlert: parseInt(minStock) || 20,
    };

    onAddItem(newItem);
    setShowAddModal(false);
    setName('');
    setBatch('');
  };

  const filteredInventory = inventory.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.batch.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.hsnCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || i.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Cards */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-indigo-600" />
            <span>Pharma &amp; Enterprise Inventory Catalog</span>
          </h3>
          <p className="text-xs text-slate-500">
            Real-time stock tracking with batch numbers, expiry dates, HSN tax classifications, and automated reorder alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStockTransferModal}
            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>Inter-Store Transfer</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow transition flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Stock Item</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Stock Valuation</div>
          <div className="text-2xl font-black text-slate-900 mt-1">
            {settings.currency} {totalValuation.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">FIFO Purchase Cost Basis</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Total Stock Units</div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {inventory.reduce((s, i) => s + i.stock, 0).toLocaleString()} Units
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Across {inventory.length} SKUs</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[10px] font-bold uppercase text-slate-400">Low Stock Reorders</div>
          <div className={`text-2xl font-black mt-1 ${lowStockCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {lowStockCount} Items
          </div>
          <div className="text-[10px] text-amber-700 font-bold mt-0.5">Below Safety Threshold</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search items, HSN, batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <table className="w-full text-xs text-left border-collapse">
          <thead className="bg-slate-50 text-slate-600 uppercase border-b border-slate-200 font-bold text-[10px]">
            <tr>
              <th className="p-3">Medicine / Product Name</th>
              <th className="p-3">Category</th>
              <th className="p-3">Batch Number</th>
              <th className="p-3">HSN Code</th>
              <th className="p-3">Expiry Date</th>
              <th className="p-3 text-right">Selling Price</th>
              <th className="p-3 text-right">In-Stock Qty</th>
              <th className="p-3 text-center">Stock Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredInventory.map(item => {
              const isLow = item.stock <= (item.minStockAlert || 20);
              return (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900">{item.name}</td>
                  <td className="p-3 text-slate-600">{item.category}</td>
                  <td className="p-3 font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                    {item.batch}
                  </td>
                  <td className="p-3 font-mono text-slate-600">{item.hsnCode || '3004.90.99'}</td>
                  <td className="p-3 text-slate-600">{item.expiryDate || 'N/A'}</td>
                  <td className="p-3 text-right font-black text-slate-900">
                    {settings.currency} {item.price.toFixed(2)}
                  </td>
                  <td className={`p-3 text-right font-black ${isLow ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {item.stock}
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isLow ? 'Low Stock' : 'Optimal'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Stock Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 mb-4">
              <h3 className="font-extrabold text-slate-900 text-sm">Add New Medicine / Inventory SKU</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <form onSubmit={handleSaveItem} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Item / Medicine Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Brufen 400mg Tablets"
                  className="w-full px-3 py-2 border rounded-lg font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  >
                    <option value="Tablets">Tablets / Capsules</option>
                    <option value="Syrups">Syrups / Suspensions</option>
                    <option value="Injections">Injections / Ampoules</option>
                    <option value="Surgical Supplies">Surgical Supplies</option>
                    <option value="General Consumer">General Consumer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">HSN / Tariff Code</label>
                  <input
                    type="text"
                    value={hsnCode}
                    onChange={(e) => setHsnCode(e.target.value)}
                    placeholder="3004.90.99"
                    className="w-full px-3 py-2 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Batch Number *</label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    placeholder="e.g. BRU-9901"
                    className="w-full px-3 py-2 border rounded-lg font-mono uppercase font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Expiry Date</label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Initial Qty</label>
                  <input
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Purchase Cost</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Sale Price</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-xs shadow"
                >
                  Save Stock Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
